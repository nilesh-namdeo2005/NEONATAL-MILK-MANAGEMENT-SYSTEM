import MilkRequest from '../models/MilkRequest.js';
import Baby from '../models/Baby.js';
import Hospital from '../models/Hospital.js';
import Inventory from '../models/Inventory.js';
import asyncHandler from '../middleware/asyncHandler.js';
import logActivity from '../utils/activityLogger.js';
import generateToken from '../utils/tokenGenerator.js';
import expireExpiredDonations from '../utils/expireExpiredDonations.js';

export const createRequest = asyncHandler(async (req, res) => {
  const { baby, hospital, quantityMl, urgency, notes } = req.body;
  const babyDoc = await Baby.findOne({ _id: baby, guardian: req.user._id });
  if (!babyDoc) {
    return res.status(403).json({ success: false, message: 'Unauthorized or baby not found' });
  }

  const hospitalDoc = await Hospital.findOne({ _id: hospital, isApproved: true });
  if (!hospitalDoc) {
    return res.status(400).json({ success: false, message: 'Select an approved hospital' });
  }

  const request = await MilkRequest.create({
    baby: babyDoc._id,
    hospital: hospitalDoc._id,
    quantityMl,
    urgency,
    notes
  });

  await logActivity(req.user._id, 'CREATE_REQUEST', 'MilkRequest', request._id, `Created request for ${quantityMl}ml`);

  res.status(201).json({
    success: true,
    message: 'Milk request created successfully',
    data: request
  });
});

export const getMyRequests = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.max(1, Number(req.query.limit) || 10);
  const skip = (page - 1) * limit;

  const babies = await Baby.find({ guardian: req.user._id }).select('_id');
  const babyIds = babies.map((baby) => baby._id);
  const query = { baby: { $in: babyIds } };
  const total = await MilkRequest.countDocuments(query);
  const requests = await MilkRequest.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('baby', 'babyName')
    .populate('hospital', 'name city');

  res.status(200).json({
    success: true,
    message: 'Requests retrieved successfully',
    data: requests,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) }
  });
});

export const getHospitalRequests = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.max(1, Number(req.query.limit) || 10);
  const { status } = req.query;
  const hospitalDoc = await Hospital.findOne({ user: req.user._id });
  if (!hospitalDoc) {
    return res.status(404).json({ success: false, message: 'Hospital not found' });
  }

  const query = { hospital: hospitalDoc._id };
  if (status) query.status = status;

  const total = await MilkRequest.countDocuments(query);
  const requests = await MilkRequest.aggregate([
    { $match: query },
    {
      $addFields: {
        urgencyPriority: {
          $cond: [{ $eq: ['$urgency', 'emergency'] }, 0, 1]
        }
      }
    },
    { $sort: { urgencyPriority: 1, createdAt: -1 } },
    { $skip: (page - 1) * limit },
    { $limit: limit },
    { $project: { urgencyPriority: 0 } }
  ]);
  await MilkRequest.populate(requests, {
    path: 'baby',
    select: 'babyName bloodGroup guardian',
    populate: { path: 'guardian', select: 'name' }
  });

  res.status(200).json({
    success: true,
    message: 'Hospital requests retrieved',
    data: requests,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) }
  });
});

export const acceptRequest = asyncHandler(async (req, res) => {
  const hospitalDoc = await Hospital.findOne({ user: req.user._id });
  if (!hospitalDoc) {
    return res.status(404).json({ success: false, message: 'Hospital not found' });
  }

  const request = await MilkRequest.findOne({
    _id: req.params.id,
    hospital: hospitalDoc._id
  }).populate('baby', 'bloodGroup');
  if (!request) {
    return res.status(404).json({ success: false, message: 'Request not found' });
  }
  if (request.status !== 'pending') {
    return res.status(409).json({ success: false, message: 'Only pending requests can be accepted' });
  }

  await expireExpiredDonations();
  const inventory = await Inventory.findOneAndUpdate(
    {
      hospital: hospitalDoc._id,
      bloodGroup: request.baby.bloodGroup,
      $expr: {
        $gte: [
          { $subtract: ['$totalAvailableMl', { $ifNull: ['$reservedMl', 0] }] },
          request.quantityMl
        ]
      }
    },
    { $inc: { reservedMl: request.quantityMl } },
    { new: true }
  );

  if (!inventory) {
    return res.status(400).json({ success: false, message: 'Not enough available inventory for this blood group' });
  }

  let tokenId;
  let acceptedRequest;
  try {
    tokenId = await generateToken('REQ');
    acceptedRequest = await MilkRequest.findOneAndUpdate(
      { _id: request._id, hospital: hospitalDoc._id, status: 'pending' },
      { $set: { status: 'accepted', tokenId } },
      { new: true, runValidators: true }
    );
  } catch (error) {
    await Inventory.updateOne(
      { _id: inventory._id },
      { $inc: { reservedMl: -request.quantityMl } }
    );
    throw error;
  }

  if (!acceptedRequest) {
    await Inventory.updateOne(
      { _id: inventory._id },
      { $inc: { reservedMl: -request.quantityMl } }
    );
    return res.status(409).json({ success: false, message: 'Request was already updated' });
  }

  await logActivity(req.user._id, 'ACCEPT_REQUEST', 'MilkRequest', acceptedRequest._id, `Accepted request ${tokenId}`);
  res.status(200).json({ success: true, message: 'Request accepted', data: acceptedRequest });
});

export const processRequest = asyncHandler(async (req, res) => {
  const hospitalDoc = await Hospital.findOne({ user: req.user._id });
  if (!hospitalDoc) {
    return res.status(404).json({ success: false, message: 'Hospital not found' });
  }

  const request = await MilkRequest.findOneAndUpdate(
    { _id: req.params.id, hospital: hospitalDoc._id, status: 'accepted' },
    { $set: { status: 'processing' } },
    { new: true, runValidators: true }
  );
  if (!request) {
    return res.status(409).json({ success: false, message: 'Only accepted requests can be processed' });
  }

  await logActivity(req.user._id, 'PROCESS_REQUEST', 'MilkRequest', request._id, 'Started processing request');
  res.status(200).json({ success: true, message: 'Request is processing', data: request });
});

export const completeRequest = asyncHandler(async (req, res) => {
  const hospitalDoc = await Hospital.findOne({ user: req.user._id });
  if (!hospitalDoc) {
    return res.status(404).json({ success: false, message: 'Hospital not found' });
  }

  const request = await MilkRequest.findOne({
    _id: req.params.id,
    hospital: hospitalDoc._id,
    status: 'processing'
  }).populate('baby', 'bloodGroup');
  if (!request) {
    return res.status(409).json({ success: false, message: 'Only processing requests can be completed' });
  }

  const inventory = await Inventory.findOneAndUpdate(
    {
      hospital: hospitalDoc._id,
      bloodGroup: request.baby.bloodGroup,
      $expr: {
        $and: [
          { $gte: ['$totalAvailableMl', request.quantityMl] },
          { $gte: [{ $ifNull: ['$reservedMl', 0] }, request.quantityMl] }
        ]
      }
    },
    {
      $inc: {
        totalAvailableMl: -request.quantityMl,
        reservedMl: -request.quantityMl
      }
    },
    { new: true }
  );
  if (!inventory) {
    return res.status(409).json({ success: false, message: 'Reserved stock is no longer available' });
  }

  let completedRequest;
  try {
    completedRequest = await MilkRequest.findOneAndUpdate(
      { _id: request._id, hospital: hospitalDoc._id, status: 'processing' },
      { $set: { status: 'completed' } },
      { new: true, runValidators: true }
    );
  } catch (error) {
    await Inventory.updateOne(
      { _id: inventory._id },
      {
        $inc: {
          totalAvailableMl: request.quantityMl,
          reservedMl: request.quantityMl
        }
      }
    );
    throw error;
  }

  if (!completedRequest) {
    await Inventory.updateOne(
      { _id: inventory._id },
      {
        $inc: {
          totalAvailableMl: request.quantityMl,
          reservedMl: request.quantityMl
        }
      }
    );
    return res.status(409).json({ success: false, message: 'Request was already updated' });
  }

  await logActivity(req.user._id, 'COMPLETE_REQUEST', 'MilkRequest', request._id, `Completed request ${request.tokenId}`);
  res.status(200).json({ success: true, message: 'Request completed', data: completedRequest });
});

export const rejectRequest = asyncHandler(async (req, res) => {
  const hospitalDoc = await Hospital.findOne({ user: req.user._id });
  if (!hospitalDoc) {
    return res.status(404).json({ success: false, message: 'Hospital not found' });
  }

  const request = await MilkRequest.findOneAndUpdate(
    { _id: req.params.id, hospital: hospitalDoc._id, status: 'pending' },
    { $set: { status: 'rejected', rejectionReason: req.body.rejectionReason } },
    { new: true, runValidators: true }
  );
  if (!request) {
    return res.status(409).json({ success: false, message: 'Only pending requests can be rejected' });
  }

  await logActivity(req.user._id, 'REJECT_REQUEST', 'MilkRequest', request._id, 'Rejected request');
  res.status(200).json({ success: true, message: 'Request rejected', data: request });
});
