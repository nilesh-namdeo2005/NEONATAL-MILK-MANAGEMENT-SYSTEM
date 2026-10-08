import Donor from '../models/Donor.js';
import User from '../models/User.js';
import Hospital from '../models/Hospital.js';
import MilkDonation from '../models/MilkDonation.js';
import asyncHandler from '../middleware/asyncHandler.js';
import logActivity from '../utils/activityLogger.js';
import getPagination from '../utils/pagination.js';

export const getDonorProfile = asyncHandler(async (req, res) => {
  const donor = await Donor.findOne({ user: req.user._id }).populate('user', 'name email phone');
  
  if (!donor) {
    return res.status(404).json({ success: false, message: 'Donor profile not found' });
  }
  
  res.status(200).json({
    success: true,
    message: 'Donor profile retrieved',
    data: donor
  });
});

export const updateDonorProfile = asyncHandler(async (req, res) => {
  const { age, bloodGroup, address, diseaseHistory, phone } = req.body;
  
  const donor = await Donor.findOneAndUpdate(
    { user: req.user._id },
    { age, bloodGroup, address, diseaseHistory },
    { new: true, runValidators: true }
  ).populate('user', 'name email phone');
  
  if (!donor) {
    return res.status(404).json({ success: false, message: 'Donor profile not found' });
  }

  if (phone !== undefined) {
    await User.findByIdAndUpdate(req.user._id, { phone });
    donor.user.phone = phone;
  }
  await logActivity(req.user._id, 'UPDATE_PROFILE', 'Donor', donor._id, 'Updated donor profile');
  
  res.status(200).json({
    success: true,
    message: 'Donor profile updated',
    data: donor
  });
});

export const getAllDonors = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, screeningStatus } = req.query;
  
  const query = {};
  if (req.user.role === 'hospital') {
    const hospital = await Hospital.findOne({ user: req.user._id });
    if (!hospital) {
      return res.status(404).json({ success: false, message: 'Hospital not found' });
    }
    query._id = {
      $in: await MilkDonation.distinct('donor', { hospital: hospital._id, status: 'pending' })
    };
  }
  if (screeningStatus) {
    query.screeningStatus = screeningStatus;
  }
  
  const donorsList = await Donor.find(query).populate({
    path: 'user',
    match: search ? { name: { $regex: search, $options: 'i' } } : {}
  });

  // Filter out where user populate failed due to search match
  const filteredDonors = search ? donorsList.filter(d => d.user) : donorsList;
  
  const pagination = getPagination(page, limit, filteredDonors.length);
  const data = filteredDonors.slice(pagination.skip, pagination.skip + pagination.limit);

  res.status(200).json({
    success: true,
    message: 'Donors retrieved successfully',
    data,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total: filteredDonors.length,
      pages: Math.ceil(filteredDonors.length / pagination.limit)
    }
  });
});

export const updateDonorScreening = asyncHandler(async (req, res) => {
  const { screeningStatus, screeningNote } = req.body;
  if (!['approved', 'rejected'].includes(screeningStatus)) {
    return res.status(400).json({ success: false, message: 'Screening status must be approved or rejected' });
  }
  if (screeningStatus === 'rejected' && !screeningNote?.trim()) {
    return res.status(400).json({ success: false, message: 'A reason is required when rejecting donor screening' });
  }

  const hospital = await Hospital.findOne({ user: req.user._id });
  if (!hospital) {
    return res.status(404).json({ success: false, message: 'Hospital not found' });
  }
  const hasDonation = await MilkDonation.exists({
    donor: req.params.id,
    hospital: hospital._id,
    status: 'pending'
  });
  if (!hasDonation) {
    return res.status(404).json({ success: false, message: 'No pending donation for this donor at your hospital' });
  }

  const donor = await Donor.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        screeningStatus,
        screeningNote: screeningStatus === 'rejected' ? screeningNote.trim() : ''
      }
    },
    { new: true, runValidators: true }
  ).populate('user', 'name email');

  if (!donor) {
    return res.status(404).json({ success: false, message: 'Donor not found' });
  }

  await logActivity(
    req.user._id,
    `SCREENING_${screeningStatus.toUpperCase()}`,
    'Donor',
    donor._id,
    screeningNote?.trim() || `Donor screening ${screeningStatus}`
  );

  res.status(200).json({
    success: true,
    message: `Donor screening ${screeningStatus}`,
    data: donor
  });
});
