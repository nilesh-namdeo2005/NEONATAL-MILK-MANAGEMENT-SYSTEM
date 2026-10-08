import mongoose from 'mongoose';

const babySchema = new mongoose.Schema({
  guardian: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  babyName: {
    type: String,
    required: true,
    trim: true
  },
  ageInMonths: {
    type: Number,
    required: true
  },
  weightKg: {
    type: Number,
    required: true
  },
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  medicalCondition: {
    type: String,
    default: 'None'
  },
  hospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
    required: false
  }
}, { timestamps: true });

const Baby = mongoose.model('Baby', babySchema);
export default Baby;
