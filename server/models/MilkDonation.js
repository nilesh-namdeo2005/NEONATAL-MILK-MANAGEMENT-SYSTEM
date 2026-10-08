import mongoose from 'mongoose';

const milkDonationSchema = new mongoose.Schema({
  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Donor',
    required: true
  },
  hospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
    required: true
  },
  quantityMl: {
    type: Number,
    required: true,
    min: 1
  },
  collectionDate: {
    type: Date
  },
  expiryDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['pending', 'verified', 'collected', 'rejected', 'expired'],
    default: 'pending'
  },
  tokenId: {
    type: String,
    unique: true,
    sparse: true
  },
  rejectionReason: {
    type: String
  }
}, { timestamps: true });

const MilkDonation = mongoose.model('MilkDonation', milkDonationSchema);
export default MilkDonation;
