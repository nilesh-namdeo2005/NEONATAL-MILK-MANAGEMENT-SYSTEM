import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Donor from '../models/Donor.js';
import Hospital from '../models/Hospital.js';
import asyncHandler from '../middleware/asyncHandler.js';
import logActivity from '../utils/activityLogger.js';

const authCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.COOKIE_SAME_SITE || 'lax',
  path: '/'
});

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, phone, hospitalName, registrationNo, address, city, age, bloodGroup, diseaseHistory } = req.body;

  if (role === 'donor' && (!age || !bloodGroup || !address)) {
    return res.status(400).json({ success: false, message: 'Age, blood group, and address are required for donor registration' });
  }
  if (role === 'hospital' && (!hospitalName || !registrationNo || !address || !city || !phone)) {
    return res.status(400).json({ success: false, message: 'Hospital name, registration number, address, city, and phone are required' });
  }

  const emailExists = await User.findOne({ email });
  if (emailExists) {
    return res.status(400).json({ success: false, message: 'Email already exists' });
  }

  const user = await User.create({
    name,
    email,
    passwordHash: password,
    role,
    phone
  });

  if (role === 'donor') {
    await Donor.create({
      user: user._id,
      age,
      bloodGroup,
      address,
      diseaseHistory
    });
  } else if (role === 'hospital') {
    await Hospital.create({
      user: user._id,
      name: hospitalName,
      registrationNo,
      address,
      city,
      phone
    });
  }

  await logActivity(user._id, 'REGISTER', 'User', user._id, `User registered as ${role}`);

  const userData = user.toJSON();

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: userData
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  if (!user.isActive) {
    return res.status(403).json({ success: false, message: 'Account is deactivated' });
  }

  if (user.role === 'hospital') {
    const hospital = await Hospital.findOne({ user: user._id });
    if (!hospital || !hospital.isApproved) {
      return res.status(403).json({ success: false, message: 'Hospital account pending admin approval' });
    }
  }

  // Generate JWT token
  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );

  const userData = user.toJSON();

  res.cookie('token', token, {
    ...authCookieOptions(),
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });

  res.status(200).json({
    success: true,
    message: 'Logged in successfully',
    data: userData
  });
});

export const logout = asyncHandler(async (req, res) => {
  res.clearCookie('token', authCookieOptions());

  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
});

export const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'User retrieved successfully',
    data: req.user
  });
});

export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-passwordHash');

  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  res.status(200).json({
    success: true,
    message: 'Profile retrieved successfully',
    data: {
      name: user.name,
      phone: user.phone || '',
      email: user.email,
      role: user.role
    }
  });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone } = req.body;
  const user = await User.findById(req.user._id).select('+passwordHash');

  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  if (req.user.role !== 'admin' && req.user.role !== 'recipient') {
    return res.status(403).json({
      success: false,
      message: 'This profile type does not support generic updates'
    });
  }

  user.name = name || user.name;
  user.phone = phone || user.phone;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      name: user.name,
      phone: user.phone || '',
      email: user.email,
      role: user.role
    }
  });
});
