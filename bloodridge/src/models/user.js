const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  phoneNumber: { type: String, unique: true, required: true },
  email: { type: String, unique: true, lowercase: true, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  password: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  verificationCode: String,
  verificationExpires: Date,

  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    required: true,
  },
  genotype: {
    type: String,
    enum: ['AA', 'AS', 'SS', 'AC', 'SC'],
    required: true,
  },
  medicalCondition: {
    type: String,
    enum: ['None', 'Diabetes', 'Hypertension', 'Other'],
    default: 'None',
  },
  lastDonationDate: {
    type: String,
    enum: [
      'First Time Donor',
      '3 months ago',
      '6 months ago',
      '1 year ago',
      'More than 1 year',
    ],
    required: true,
  },
  currentLocation: { type: String, required: true },
  preferredDonationRadius: {
    type: String,
    enum: ['5km', '10km', '25km', '50km'],
    required: true,
  },
  preferredDonationCenters: { type: [String], required: true },
  agreeToDonate: {
    type: Boolean,
    required: true,
    validate: { validator: v => v === true, message: 'You must agree to donate voluntarily.' },
  },
  allowContact: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
