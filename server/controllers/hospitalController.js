import Hospital from '../models/Hospital.js';
import User from '../models/User.js';
import asyncHandler from '../middleware/asyncHandler.js';
import logActivity from '../utils/activityLogger.js';
import getPagination from '../utils/pagination.js';

export const getApprovedHospitals = asyncHandler(async (req, res) => {
  const { city } = req.query;
  const query = { isApproved: true };
  if (city) query.city = { $regex: city, $options: 'i' };

  const hospitals = await Hospital.find(query).populate('user', 'name email');

  res.status(200).json({
    success: true,
    message: 'Approved hospitals retrieved',
    data: hospitals
  });
});

export const getAllHospitals = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  const total = await Hospital.countDocuments();
  const hospitals = await Hospital.find().skip(skip).limit(Number(limit)).populate('user', 'name email').lean();

  res.status(200).json({
    success: true,
    message: 'All hospitals retrieved',
    data: hospitals,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

export const approveHospital = asyncHandler(async (req, res) => {
  const hospital = await Hospital.findById(req.params.id);
  if (!hospital) {
    return res.status(404).json({ success: false, message: 'Hospital not found' });
  }

  hospital.isApproved = true;
  hospital.approvalStatus = 'approved';
  await hospital.save();

  await User.findByIdAndUpdate(hospital.user, { isActive: true });

  await logActivity(req.user._id, 'APPROVE_HOSPITAL', 'Hospital', hospital._id, `Approved hospital ${hospital.name}`);

  res.status(200).json({
    success: true,
    message: 'Hospital approved',
    data: hospital
  });
});

export const rejectHospital = asyncHandler(async (req, res) => {
  const hospital = await Hospital.findById(req.params.id);
  if (!hospital) {
    return res.status(404).json({ success: false, message: 'Hospital not found' });
  }

  hospital.isApproved = false;
  hospital.approvalStatus = 'rejected';
  await hospital.save();

  await User.findByIdAndUpdate(hospital.user, { isActive: false });

  await logActivity(req.user._id, 'REJECT_HOSPITAL', 'Hospital', hospital._id, `Rejected hospital ${hospital.name}`);

  res.status(200).json({
    success: true,
    message: 'Hospital rejected',
    data: hospital
  });
});

export const getHospitalProfile = asyncHandler(async (req, res) => {
  const hospital = await Hospital.findOne({ user: req.user._id }).populate('user', 'name email phone');
  if (!hospital) {
    return res.status(404).json({ success: false, message: 'Hospital profile not found' });
  }

  res.status(200).json({
    success: true,
    message: 'Hospital profile retrieved',
    data: hospital
  });
});

export const updateHospitalProfile = asyncHandler(async (req, res) => {
  const { name, address, city, phone } = req.body;
  const hospital = await Hospital.findOne({ user: req.user._id });
  if (!hospital) {
    return res.status(404).json({ success: false, message: 'Hospital profile not found' });
  }

  if (name !== undefined) hospital.name = name;
  if (address !== undefined) hospital.address = address;
  if (city !== undefined) hospital.city = city;
  if (phone !== undefined) hospital.phone = phone;
  await hospital.save();

  if (phone !== undefined) {
    await User.findByIdAndUpdate(req.user._id, { phone });
  }
  await logActivity(req.user._id, 'UPDATE_PROFILE', 'Hospital', hospital._id, 'Updated hospital profile');

  res.status(200).json({
    success: true,
    message: 'Hospital profile updated',
    data: await hospital.populate('user', 'name email phone')
  });
});
