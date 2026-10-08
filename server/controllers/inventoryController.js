import Inventory from '../models/Inventory.js';
import Hospital from '../models/Hospital.js';
import asyncHandler from '../middleware/asyncHandler.js';
import expireExpiredDonations from '../utils/expireExpiredDonations.js';

export const getAvailability = asyncHandler(async (req, res) => {
  const { hospital, city, bloodGroup, minQuantity } = req.query;

  const minimum = minQuantity === undefined ? 0 : Number(minQuantity);
  if (!Number.isFinite(minimum) || minimum < 0) {
    return res.status(400).json({ success: false, message: 'Minimum quantity must be a non-negative number' });
  }

  await expireExpiredDonations();
  let inventories = await Inventory.find({
    ...(bloodGroup ? { bloodGroup } : {})
  }).populate({
    path: 'hospital',
    select: 'name city address',
    match: { isApproved: true }
  });

  const data = inventories
    .map((inventory) => {
      const item = inventory.toObject();
      item.availableMl = Math.max(0, item.totalAvailableMl - (item.reservedMl || 0));
      return item;
    })
    .filter((inventory) => inventory.hospital)
    .filter((inventory) => inventory.availableMl > 0)
    .filter((inventory) => inventory.availableMl >= minimum)
    .filter((inventory) => !hospital || inventory.hospital?._id.toString() === hospital)
    .filter((inventory) => !city || inventory.hospital?.city.toLowerCase().includes(city.toLowerCase()));

  res.status(200).json({
    success: true,
    message: 'Inventory retrieved successfully',
    data
  });
});

export const getHospitalStock = asyncHandler(async (req, res) => {
  const hospitalDoc = await Hospital.findOne({ user: req.user._id });
  if (!hospitalDoc) {
    return res.status(404).json({ success: false, message: 'Hospital not found' });
  }

  const stock = await Inventory.find({ hospital: hospitalDoc._id });

  res.status(200).json({
    success: true,
    message: 'Hospital stock retrieved successfully',
    data: stock
  });
});
