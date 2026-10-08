import jwt from 'jsonwebtoken';
import asyncHandler from './asyncHandler.js';
import User from '../models/User.js';
import Hospital from '../models/Hospital.js';

export const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized to access this route');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-passwordHash');
    if (!req.user) {
      res.status(401);
      throw new Error('Not authorized, user not found');
    }
    next();
  } catch (error) {
    res.status(401);
    throw new Error('Not authorized, token failed');
  }
});

export const authorize = (...roles) => {
  return asyncHandler(async (req, res, next) => {
    if (!req.user) {
      res.status(401);
      throw new Error('Not authorized');
    }
    if (!roles.includes(req.user.role)) {
      res.status(403);
      throw new Error(`User role ${req.user.role} is not authorized to access this route`);
    }
    if (!req.user.isActive) {
      res.status(403);
      throw new Error('User account is deactivated');
    }
    if (req.user.role === 'hospital') {
      const hospital = await Hospital.findOne({ user: req.user._id });
      if (!hospital || !hospital.isApproved) {
        res.status(403);
        throw new Error('Hospital account is not approved yet');
      }
    }
    next();
  });
};
