import ActivityLog from '../models/ActivityLog.js';
import asyncHandler from '../middleware/asyncHandler.js';

export const getHistory = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, entityType, startDate, endDate, search } = req.query;
  const skip = (page - 1) * limit;

  const query = {};

  if (req.user.role !== 'admin') {
    query.actor = req.user._id;
  }

  if (entityType) query.entityType = entityType;
  
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  if (search) {
    query.$or = [
      { action: { $regex: search, $options: 'i' } },
      { details: { $regex: search, $options: 'i' } }
    ];
  }

  const total = await ActivityLog.countDocuments(query);
  const logs = await ActivityLog.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit))
    .populate('actor', 'name email');

  res.status(200).json({
    success: true,
    message: 'History retrieved successfully',
    data: logs,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
});
