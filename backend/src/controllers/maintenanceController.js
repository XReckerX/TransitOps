const Maintenance = require('../models/Maintenance');
const ApiError = require('../utils/ApiError');
const statusEngine = require('../services/statusEngine');

// @desc    Get all maintenance records
// @route   GET /api/maintenance
// @access  Private (FleetManager)
exports.getMaintenances = async (req, res, next) => {
  try {
    const records = await Maintenance.find().populate('vehicle', 'registrationNumber name model status');
    res.status(200).json({ success: true, count: records.length, data: records });
  } catch (error) {
    next(error);
  }
};

// @desc    Create maintenance record (Flags vehicle In Shop)
// @route   POST /api/maintenance
// @access  Private (FleetManager)
exports.createMaintenance = async (req, res, next) => {
  try {
    const { vehicle, serviceType, cost, date } = req.body;
    if (!vehicle || !serviceType || cost === undefined) {
      return next(new ApiError(400, 'Please provide vehicle, serviceType, and cost'));
    }

    const record = await statusEngine.createMaintenance({
      vehicle,
      serviceType,
      cost,
      date
    });

    res.status(201).json({ success: true, data: record });
  } catch (error) {
    next(error);
  }
};

// @desc    Close maintenance record (Restores vehicle Available)
// @route   PUT /api/maintenance/:id/close
// @access  Private (FleetManager)
exports.closeMaintenance = async (req, res, next) => {
  try {
    const record = await statusEngine.closeMaintenance(req.params.id);
    res.status(200).json({ success: true, data: record });
  } catch (error) {
    next(error);
  }
};
