import Baby from '../models/Baby.js';
import Hospital from '../models/Hospital.js';
import asyncHandler from '../middleware/asyncHandler.js';
import logActivity from '../utils/activityLogger.js';

export const createBaby = asyncHandler(async (req, res) => {
  const { babyName, ageInMonths, weightKg, bloodGroup, medicalCondition, hospital } = req.body;

  if (hospital && !await Hospital.exists({ _id: hospital, isApproved: true })) {
    return res.status(400).json({ success: false, message: 'Select an approved hospital or leave the hospital blank' });
  }

  const baby = await Baby.create({
    guardian: req.user._id,
    babyName,
    ageInMonths,
    weightKg,
    bloodGroup,
    medicalCondition,
    hospital
  });

  await logActivity(req.user._id, 'CREATE_BABY', 'Baby', baby._id, `Registered baby ${babyName}`);

  res.status(201).json({
    success: true,
    message: 'Baby registered successfully',
    data: baby
  });
});

export const getBabies = asyncHandler(async (req, res) => {
  const babies = await Baby.find({ guardian: req.user._id }).populate('hospital', 'name');

  res.status(200).json({
    success: true,
    message: 'Babies retrieved successfully',
    data: babies
  });
});

export const getBaby = asyncHandler(async (req, res) => {
  const baby = await Baby.findOne({ _id: req.params.id, guardian: req.user._id }).populate('hospital', 'name');
  
  if (!baby) {
    return res.status(404).json({ success: false, message: 'Baby not found' });
  }

  res.status(200).json({
    success: true,
    message: 'Baby retrieved successfully',
    data: baby
  });
});

export const updateBaby = asyncHandler(async (req, res) => {
  const { babyName, ageInMonths, weightKg, bloodGroup, medicalCondition, hospital } = req.body;
  if (hospital && !await Hospital.exists({ _id: hospital, isApproved: true })) {
    return res.status(400).json({ success: false, message: 'Select an approved hospital or leave the hospital blank' });
  }

  const baby = await Baby.findOneAndUpdate(
    { _id: req.params.id, guardian: req.user._id },
    { $set: { babyName, ageInMonths, weightKg, bloodGroup, medicalCondition, hospital } },
    { new: true, runValidators: true }
  );

  if (!baby) {
    return res.status(404).json({ success: false, message: 'Baby not found' });
  }

  await logActivity(req.user._id, 'UPDATE_BABY', 'Baby', baby._id, `Updated baby ${baby.babyName}`);

  res.status(200).json({
    success: true,
    message: 'Baby updated successfully',
    data: baby
  });
});

export const deleteBaby = asyncHandler(async (req, res) => {
  const baby = await Baby.findOneAndDelete({ _id: req.params.id, guardian: req.user._id });

  if (!baby) {
    return res.status(404).json({ success: false, message: 'Baby not found' });
  }

  await logActivity(req.user._id, 'DELETE_BABY', 'Baby', baby._id, `Deleted baby ${baby.babyName}`);

  res.status(200).json({
    success: true,
    message: 'Baby deleted successfully',
    data: {}
  });
});
