const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle'
  },
  trip: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip'
  },
  type: {
    type: String,
    enum: ['Toll', 'Misc', 'Maintenance'],
    required: [true, 'Please specify expense type']
  },
  amount: {
    type: Number,
    required: [true, 'Please add expense amount']
  },
  date: {
    type: Date,
    required: [true, 'Please select expense date'],
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Expense', ExpenseSchema);
