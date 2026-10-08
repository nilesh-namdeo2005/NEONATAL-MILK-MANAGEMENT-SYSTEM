import MilkDonation from '../models/MilkDonation.js';
import Donor from '../models/Donor.js';
import Hospital from '../models/Hospital.js';
import Inventory from '../models/Inventory.js';
import asyncHandler from '../middleware/asyncHandler.js';
import logActivity from '../utils/activityLogger.js';
import generateToken from '../utils/tokenGenerator.js';

export const createDonation = asyncHandler(async (req, res) => {
  const { hospital, quantityMl } = req.body;

  const donorDoc = await Donor.findOne({ user: req.user._id });
  if (!donorDoc) {
    return res.status(404).json({ success: false, message: 'Donor profile not found' });
  }

  const hosp = await Hospital.findById(hospital);
  if (!hosp || !hosp.isApproved) {
    return res.status(400).json({ success: false, message: 'Invalid or unapproved hospital' });
  }

  const donation = await MilkDonation.create({
    donor: donorDoc._id,
    hospital,
    quantityMl
  });

  await logActivity(req.user._id, 'CREATE_DONATION', 'MilkDonation', donation._id, `Created donation request for ${quantityMl}ml`);

  res.status(201).json({
    success: true,
    message: 'Donation created successfully',
    data: donation
  });
});

export const getMyDonations = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  const donorDoc = await Donor.findOne({ user: req.user._id });
  if (!donorDoc) {
    return res.status(404).json({ success: false, message: 'Donor profile not found' });
  }

  const query = { donor: donorDoc._id };
  const total = await MilkDonation.countDocuments(query);
  const donations = await MilkDonation.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit))
    .populate('hospital', 'name');

  res.status(200).json({
    success: true,
    message: 'Donations retrieved successfully',
    data: donations,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

export const getHospitalDonations = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;
  const skip = (page - 1) * limit;

  const hospitalDoc = await Hospital.findOne({ user: req.user._id });
  if (!hospitalDoc) {
    return res.status(404).json({ success: false, message: 'Hospital not found' });
  }

  const query = { hospital: hospitalDoc._id };
  if (status) query.status = status;

  const total = await MilkDonation.countDocuments(query);
  const donations = await MilkDonation.find(query)
    .populate({
      path: 'donor',
      populate: { path: 'user', select: 'name' }
    })
    .skip(skip)
    .limit(Number(limit));
    
  donations.sort((a, b) => {
    if (a.status === 'pending' && b.status !== 'pending') return -1;
    if (a.status !== 'pending' && b.status === 'pending') return 1;
    return b.createdAt - a.createdAt;
  });

  res.status(200).json({
    success: true,
    message: 'Hospital donations retrieved',
    data: donations,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

export const verifyDonation = asyncHandler(async (req, res) => {
  const hospitalDoc = await Hospital.findOne({ user: req.user._id });
  if (!hospitalDoc) {
    return res.status(404).json({ success: false, message: 'Hospital not found' });
  }

  const donation = await MilkDonation.findOne({
    _id: req.params.id,
    hospital: hospitalDoc._id,
    status: 'pending'
  }).populate({ path: 'donor', populate: { path: 'user', select: 'name' } });
  
  if (!donation) {
    return res.status(404).json({ success: false, message: 'Pending donation not found' });
  }
  if (donation.donor.screeningStatus !== 'approved') {
    return res.status(400).json({ success: false, message: 'Donor screening must be approved before verifying a donation' });
  }

  const tokenId = await generateToken('DON');
  const verifiedDonation = await MilkDonation.findOneAndUpdate(
    { _id: donation._id, hospital: hospitalDoc._id, status: 'pending' },
    { $set: { status: 'verified', tokenId } },
    { new: true, runValidators: true }
  );
  if (!verifiedDonation) {
    return res.status(409).json({ success: false, message: 'Donation was already updated' });
  }

  await logActivity(req.user._id, 'VERIFY_DONATION', 'MilkDonation', verifiedDonation._id, `Verified donation ${tokenId}`);

  res.status(200).json({
    success: true,
    message: 'Donation verified successfully',
    data: verifiedDonation
  });
});

export const rejectDonation = asyncHandler(async (req, res) => {
  const hospitalDoc = await Hospital.findOne({ user: req.user._id });
  if (!hospitalDoc) {
    return res.status(404).json({ success: false, message: 'Hospital not found' });
  }

  const donation = await MilkDonation.findOneAndUpdate(
    { _id: req.params.id, hospital: hospitalDoc._id, status: 'pending' },
    { $set: { status: 'rejected', rejectionReason: req.body.rejectionReason } },
    { new: true, runValidators: true }
  );
  
  if (!donation) {
    return res.status(409).json({ success: false, message: 'Only pending donations can be rejected' });
  }

  await logActivity(req.user._id, 'REJECT_DONATION', 'MilkDonation', donation._id, 'Rejected donation');

  res.status(200).json({
    success: true,
    message: 'Donation rejected',
    data: donation
  });
});

export const collectDonation = asyncHandler(async (req, res) => {
  const hospitalDoc = await Hospital.findOne({ user: req.user._id });
  if (!hospitalDoc) {
    return res.status(404).json({ success: false, message: 'Hospital not found' });
  }

  const donation = await MilkDonation.findOne({
    _id: req.params.id,
    hospital: hospitalDoc._id,
    status: 'verified'
  }).populate('donor');
  
  if (!donation) {
    return res.status(409).json({ success: false, message: 'Only verified donations can be collected' });
  }

  const actualQuantity = Number(req.body.quantityMl);
  if (!Number.isFinite(actualQuantity) || actualQuantity <= 0) {
    return res.status(400).json({ success: false, message: 'Collected quantity must be greater than zero' });
  }
  
  const collectionDate = new Date();
  const expiry = new Date(collectionDate);
  expiry.setMonth(expiry.getMonth() + 6);
  const collectedDonation = await MilkDonation.findOneAndUpdate(
    { _id: donation._id, hospital: hospitalDoc._id, status: 'verified' },
    {
      $set: {
        status: 'collected',
        collectionDate,
        expiryDate: expiry,
        quantityMl: actualQuantity
      }
    },
    { new: true, runValidators: true }
  );
  if (!collectedDonation) {
    return res.status(409).json({ success: false, message: 'Donation was already updated' });
  }

  try {
    await Inventory.findOneAndUpdate(
      { hospital: donation.hospital, bloodGroup: donation.donor.bloodGroup },
      { $inc: { totalAvailableMl: actualQuantity } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  } catch (error) {
    await MilkDonation.updateOne(
      { _id: collectedDonation._id, status: 'collected' },
      { $set: { status: 'verified', collectionDate: null, expiryDate: null, quantityMl: donation.quantityMl } }
    );
    throw error;
  }

  await logActivity(req.user._id, 'COLLECT_DONATION', 'MilkDonation', collectedDonation._id, `Collected ${actualQuantity}ml donation`);

  res.status(200).json({
    success: true,
    message: 'Donation collected and inventory updated',
    data: collectedDonation
  });
});
