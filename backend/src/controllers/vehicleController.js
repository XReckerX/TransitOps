const Vehicle = require('../models/Vehicle');
const ApiError = require('../utils/ApiError');

// @desc    Get all vehicles
// @route   GET /api/vehicles
// @access  Private (FleetManager, Driver)
exports.getVehicles = async (req, res, next) => {
  try {
    const { search, type, status, region, sortBy, order } = req.query;
    let query = {};

    if (search) {
      query.registrationNumber = { $regex: search, $options: 'i' };
    }
    if (type) query.type = type;
    if (status) query.status = status;
    if (region) query.region = region;

    let buildQuery = Vehicle.find(query);

    if (sortBy) {
      const sortOrder = order === 'desc' ? -1 : 1;
      buildQuery = buildQuery.sort({ [sortBy]: sortOrder });
    }

    const vehicles = await buildQuery;
    res.status(200).json({ success: true, count: vehicles.length, data: vehicles });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single vehicle
// @route   GET /api/vehicles/:id
// @access  Private
exports.getVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return next(new ApiError(404, 'Vehicle not found'));
    }
    res.status(200).json({ success: true, data: vehicle });
  } catch (error) {
    next(error);
  }
};

// @desc    Create vehicle
// @route   POST /api/vehicles
// @access  Private (FleetManager)
exports.createVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.create(req.body);
    res.status(201).json({ success: true, data: vehicle });
  } catch (error) {
    next(error);
  }
};

// @desc    Update vehicle
// @route   PUT /api/vehicles/:id
// @access  Private (FleetManager)
exports.updateVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!vehicle) {
      return next(new ApiError(404, 'Vehicle not found'));
    }
    res.status(200).json({ success: true, data: vehicle });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete vehicle
// @route   DELETE /api/vehicles/:id
// @access  Private (FleetManager)
exports.deleteVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
    if (!vehicle) {
      return next(new ApiError(404, 'Vehicle not found'));
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload vehicle document
// @route   POST /api/vehicles/:id/documents
// @access  Private (FleetManager)
exports.uploadDocument = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return next(new ApiError(404, 'Vehicle not found'));
    }

    if (!req.file) {
      return next(new ApiError(400, 'Please upload a file'));
    }

    vehicle.documents.push({
      url: req.file.path,
      name: req.body.name || req.file.originalname
    });

    await vehicle.save();
    res.status(200).json({ success: true, data: vehicle });
  } catch (error) {
    next(error);
  }
};
