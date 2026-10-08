import mongoose from 'mongoose';

const donorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  age: {
    type: Number
  },
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  address: {
    type: String
  },
  diseaseHistory: {
    type: String,
    default: 'None'
  },
  screeningStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  screeningNote: {
    type: String
  }
}, { timestamps: true });

const Donor = mongoose.model('Donor', donorSchema);
export default Donor;
