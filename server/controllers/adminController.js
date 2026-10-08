import User from '../models/User.js';
import Donor from '../models/Donor.js';
import Hospital from '../models/Hospital.js';
import MilkDonation from '../models/MilkDonation.js';
import MilkRequest from '../models/MilkRequest.js';
import Inventory from '../models/Inventory.js';
import ActivityLog from '../models/ActivityLog.js';
import asyncHandler from '../middleware/asyncHandler.js';
import logActivity from '../utils/activityLogger.js';
import { Parser } from 'json2csv';

export const getStats = asyncHandler(async (req, res) => {
  const totalDonors = await Donor.countDocuments();
  const totalRecipients = await User.countDocuments({ role: 'recipient' });
  const totalHospitals = await Hospital.countDocuments({ isApproved: true });
  const pendingHospitals = await Hospital.countDocuments({
    $or: [
      { approvalStatus: 'pending' },
      { approvalStatus: { $exists: false }, isApproved: false }
    ]
  });
  const totalDonations = await MilkDonation.countDocuments();
  const totalRequests = await MilkRequest.countDocuments();

  const donationsByMonth = await MilkDonation.aggregate([
    {
      $match: {
        createdAt: { $gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1)) }
      }
    },
    {
      $group: {
        _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
        totalMl: { $sum: "$quantityMl" }
      }
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } }
  ]);

  const requestsByStatus = await MilkRequest.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 }
      }
    }
  ]);

  const stockByBloodGroup = await Inventory.aggregate([
    {
      $group: {
        _id: "$bloodGroup",
        totalMl: { $sum: "$totalAvailableMl" }
      }
    }
  ]);

  const recentActivity = await ActivityLog.find()
    .sort({ createdAt: -1 })
    .limit(10)
    .populate('actor', 'name');

  res.status(200).json({
    success: true,
    message: 'Stats retrieved',
    data: {
      totalDonors,
      totalRecipients,
      totalHospitals,
      pendingHospitals,
      totalDonations,
      totalRequests,
      donationsByMonth,
      requestsByStatus,
      stockByBloodGroup,
      recentActivity
    }
  });
});

export const exportReport = asyncHandler(async (req, res) => {
  const { type } = req.query;
  let data = [];
  
  if (type === 'donations') {
    data = await MilkDonation.find().populate('donor hospital').lean();
  } else if (type === 'requests') {
    data = await MilkRequest.find().populate('baby hospital').lean();
  } else if (type === 'users') {
    data = await User.find().select('-passwordHash').lean();
  } else {
    return res.status(400).json({ success: false, message: 'Invalid report type' });
  }

  const parser = new Parser();
  const csv = parser.parse(data);

  res.header('Content-Type', 'text/csv');
  res.attachment(`${type}-report.csv`);
  res.send(csv);
});

export const getUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, role, search } = req.query;
  const skip = (page - 1) * limit;

  const query = {};
  if (role) query.role = role;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  const total = await User.countDocuments(query);
  const users = await User.find(query)
    .select('-passwordHash')
    .skip(skip)
    .limit(Number(limit));

  res.status(200).json({
    success: true,
    message: 'Users retrieved',
    data: users,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

export const toggleUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  user.isActive = !user.isActive;
  await user.save();

  await logActivity(req.user._id, 'TOGGLE_USER', 'User', user._id, `Toggled user active status to ${user.isActive}`);

  res.status(200).json({
    success: true,
    message: 'User status toggled',
    data: user
  });
});
