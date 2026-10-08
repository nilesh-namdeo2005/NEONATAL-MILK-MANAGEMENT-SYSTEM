import mongoose from 'mongoose';

const milkRequestSchema = new mongoose.Schema({
  baby: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Baby',
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
  urgency: {
    type: String,
    enum: ['normal', 'emergency'],
    default: 'normal'
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'processing', 'completed', 'rejected'],
    default: 'pending'
  },
  tokenId: {
    type: String,
    unique: true,
    sparse: true
  },
  notes: {
    type: String
  },
  rejectionReason: {
    type: String
  }
}, { timestamps: true });

const MilkRequest = mongoose.model('MilkRequest', milkRequestSchema);
export default MilkRequest;
