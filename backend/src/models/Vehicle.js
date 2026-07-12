const mongoose = require('mongoose');

const VehicleSchema = new mongoose.Schema({
  registrationNumber: {
    type: String,
    required: [true, 'Please add registration number'],
    unique: true,
    uppercase: true,
    trim: true
  },
  name: {
    type: String,
    required: [true, 'Please add name/description']
  },
  model: {
    type: String,
    required: [true, 'Please add vehicle model']
  },
  type: {
    type: String,
    enum: ['Van', 'Truck', 'Mini'],
    required: [true, 'Please select vehicle type']
  },
  maxLoadCapacity: {
    type: Number,
    required: [true, 'Please add maximum load capacity in kg']
  },
  odometer: {
    type: Number,
    required: [true, 'Please add initial odometer reading']
  },
  acquisitionCost: {
    type: Number,
    required: [true, 'Please add acquisition cost']
  },
  status: {
    type: String,
    enum: ['Available', 'On Trip', 'In Shop', 'Retired'],
    default: 'Available'
  },
  region: {
    type: String,
    required: [true, 'Please specify the vehicle region']
  },
  documents: [{
    url: String,
    name: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Vehicle', VehicleSchema);
