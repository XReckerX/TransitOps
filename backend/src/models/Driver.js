const mongoose = require('mongoose');

const DriverSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add driver name']
  },
  licenseNumber: {
    type: String,
    required: [true, 'Please add driver license number'],
    unique: true,
    uppercase: true,
    trim: true
  },
  licenseCategory: {
    type: String,
    required: [true, 'Please add license category']
  },
  licenseExpiryDate: {
    type: Date,
    required: [true, 'Please add license expiry date']
  },
  contactNumber: {
    type: String,
    required: [true, 'Please add contact number']
  },
  safetyScore: {
    type: Number,
    default: 100,
    min: 0,
    max: 100
  },
  status: {
    type: String,
    enum: ['Available', 'On Trip', 'Off Duty', 'Suspended'],
    default: 'Available'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Driver', DriverSchema);
