const mongoose = require('mongoose');

const TripSchema = new mongoose.Schema({
  source: {
    type: String,
    required: [true, 'Please add source location']
  },
  destination: {
    type: String,
    required: [true, 'Please add destination location']
  },
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: [true, 'Please assign a vehicle']
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    required: [true, 'Please assign a driver']
  },
  cargoWeight: {
    type: Number,
    required: [true, 'Please specify cargo weight in kg']
  },
  plannedDistance: {
    type: Number,
    required: [true, 'Please specify planned distance in km']
  },
  actualDistance: {
    type: Number // Filled on completion
  },
  fuelConsumed: {
    type: Number // Filled on completion (in liters)
  },
  finalOdometer: {
    type: Number // Filled on completion
  },
  status: {
    type: String,
    enum: ['Draft', 'Dispatched', 'Completed', 'Cancelled'],
    default: 'Draft'
  },
  dispatchedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Trip', TripSchema);
