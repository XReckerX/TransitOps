const Driver = require('../models/Driver');
const ApiError = require('../utils/ApiError');

// @desc    Get all drivers
// @route   GET /api/drivers
// @access  Private (FleetManager, SafetyOfficer)
exports.getDrivers = async (req, res, next) => {
  try {
    const { search, status, sortBy, order } = req.query;
    let query = {};

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    if (status) query.status = status;

    let buildQuery = Driver.find(query);

    if (sortBy) {
      const sortOrder = order === 'desc' ? -1 : 1;
      buildQuery = buildQuery.sort({ [sortBy]: sortOrder });
    }

    const drivers = await buildQuery;
    res.status(200).json({ success: true, count: drivers.length, data: drivers });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single driver
// @route   GET /api/drivers/:id
// @access  Private
exports.getDriver = async (req, res, next) => {
  try {
    const driver = await Driver.findById(req.params.id);
    if (!driver) {
      return next(new ApiError(404, 'Driver not found'));
    }
    res.status(200).json({ success: true, data: driver });
  } catch (error) {
    next(error);
  }
};

// @desc    Create driver
// @route   POST /api/drivers
// @access  Private (SafetyOfficer, FleetManager)
exports.createDriver = async (req, res, next) => {
  try {
    const driver = await Driver.create(req.body);
    res.status(201).json({ success: true, data: driver });
  } catch (error) {
    next(error);
  }
};

// @desc    Update driver
// @route   PUT /api/drivers/:id
// @access  Private (SafetyOfficer, FleetManager)
exports.updateDriver = async (req, res, next) => {
  try {
    const driver = await Driver.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!driver) {
      return next(new ApiError(404, 'Driver not found'));
    }
    res.status(200).json({ success: true, data: driver });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete driver
// @route   DELETE /api/drivers/:id
// @access  Private (SafetyOfficer, FleetManager)
exports.deleteDriver = async (req, res, next) => {
  try {
    const driver = await Driver.findByIdAndDelete(req.params.id);
    if (!driver) {
      return next(new ApiError(404, 'Driver not found'));
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};
