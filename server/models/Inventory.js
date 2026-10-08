import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema({
  hospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
    required: true
  },
  bloodGroup: {
    type: String,
    required: true,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  totalAvailableMl: {
    type: Number,
    default: 0,
    min: 0
  },
  reservedMl: {
    type: Number,
    default: 0,
    min: 0
  }
}, { timestamps: true });

inventorySchema.index({ hospital: 1, bloodGroup: 1 }, { unique: true });

const Inventory = mongoose.model('Inventory', inventorySchema);
export default Inventory;
