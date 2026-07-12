const FuelLog = require('../models/FuelLog');
const Expense = require('../models/Expense');
const ApiError = require('../utils/ApiError');

// @desc    Get fuel logs
// @route   GET /api/fuel-expenses/fuel
// @access  Private (FleetManager, FinancialAnalyst, Driver)
exports.getFuelLogs = async (req, res, next) => {
  try {
    const logs = await FuelLog.find().populate('vehicle', 'registrationNumber name type');
    res.status(200).json({ success: true, count: logs.length, data: logs });
  } catch (error) {
    next(error);
  }
};

// @desc    Create fuel log
// @route   POST /api/fuel-expenses/fuel
// @access  Private (Driver, FleetManager)
exports.createFuelLog = async (req, res, next) => {
  try {
    const { vehicle, trip, liters, cost, date } = req.body;
    if (!vehicle || !liters || !cost) {
      return next(new ApiError(400, 'Please provide vehicle, liters, and cost'));
    }

    const log = await FuelLog.create({
      vehicle,
      trip,
      liters,
      cost,
      date
    });

    res.status(201).json({ success: true, data: log });
  } catch (error) {
    next(error);
  }
};

// @desc    Get expenses
// @route   GET /api/fuel-expenses/expenses
// @access  Private (FleetManager, FinancialAnalyst, Driver)
exports.getExpenses = async (req, res, next) => {
  try {
    const expenses = await Expense.find().populate('vehicle', 'registrationNumber name type');
    res.status(200).json({ success: true, count: expenses.length, data: expenses });
  } catch (error) {
    next(error);
  }
};

// @desc    Create expense log
// @route   POST /api/fuel-expenses/expenses
// @access  Private (Driver, FleetManager, FinancialAnalyst)
exports.createExpense = async (req, res, next) => {
  try {
    const { vehicle, trip, type, amount, date } = req.body;
    if (!type || !amount) {
      return next(new ApiError(400, 'Please provide type and amount'));
    }

    const expense = await Expense.create({
      vehicle,
      trip,
      type,
      amount,
      date
    });

    res.status(201).json({ success: true, data: expense });
  } catch (error) {
    next(error);
  }
};
