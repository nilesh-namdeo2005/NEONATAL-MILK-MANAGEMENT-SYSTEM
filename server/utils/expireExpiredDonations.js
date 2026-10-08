import MilkDonation from '../models/MilkDonation.js';
import Donor from '../models/Donor.js';
import Inventory from '../models/Inventory.js';
import logActivity from './activityLogger.js';

const expireExpiredDonations = async (now = new Date()) => {
  const expiredDonations = await MilkDonation.find({
    status: 'collected',
    expiryDate: { $lte: now }
  });

  let expiredCount = 0;
  for (const candidate of expiredDonations) {
    const donation = await MilkDonation.findOneAndUpdate(
      { _id: candidate._id, status: 'collected', expiryDate: { $lte: now } },
      { $set: { status: 'expired' } },
      { new: true }
    );
    if (!donation) continue;

    const donor = await Donor.findById(donation.donor).select('bloodGroup');
    const bloodGroup = donor?.bloodGroup;
    if (bloodGroup) {
      await Inventory.updateOne(
        { hospital: donation.hospital, bloodGroup },
        [{
          $set: {
            totalAvailableMl: {
              $max: [
                0,
                { $subtract: [{ $ifNull: ['$totalAvailableMl', 0] }, donation.quantityMl] }
              ]
            }
          }
        }]
      );
    }

    await logActivity(
      null,
      'DONATION_EXPIRED',
      'MilkDonation',
      donation._id,
      `Donation of ${donation.quantityMl}ml expired.`
    );
    expiredCount += 1;
  }

  return expiredCount;
};

export default expireExpiredDonations;
