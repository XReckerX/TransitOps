const mongoose = require('mongoose');

const MaintenanceSchema = new mongoose.Schema({
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: [true, 'Please assign a vehicle for maintenance']
  },
  serviceType: {
    type: String,
    required: [true, 'Please add service type (e.g. Oil Change, Engine Check)']
  },
  cost: {
    type: Number,
    required: [true, 'Please add maintenance cost']
  },
  date: {
    type: Date,
    required: [true, 'Please select service date'],
    default: Date.now
  },
  status: {
    type: String,
    enum: ['Active', 'Completed'],
    default: 'Active'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Maintenance', MaintenanceSchema);
