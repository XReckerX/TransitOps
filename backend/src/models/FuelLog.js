const mongoose = require('mongoose');

const FuelLogSchema = new mongoose.Schema({
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: [true, 'Please assign a vehicle']
  },
  trip: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip'
  },
  liters: {
    type: Number,
    required: [true, 'Please specify liters of fuel added']
  },
  cost: {
    type: Number,
    required: [true, 'Please specify fuel cost']
  },
  date: {
    type: Date,
    required: [true, 'Please specify date of refueling'],
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('FuelLog', FuelLogSchema);
