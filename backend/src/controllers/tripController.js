const Trip = require('../models/Trip');
const ApiError = require('../utils/ApiError');
const statusEngine = require('../services/statusEngine');

// @desc    Get all trips
// @route   GET /api/trips
// @access  Private (FleetManager, Driver)
exports.getTrips = async (req, res, next) => {
  try {
    const { status } = req.query;
    let query = {};
    if (status) query.status = status;

    const trips = await Trip.find(query)
      .populate('vehicle', 'registrationNumber name model maxLoadCapacity status')
      .populate('driver', 'name licenseNumber status');

    res.status(200).json({ success: true, count: trips.length, data: trips });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single trip
// @route   GET /api/trips/:id
// @access  Private
exports.getTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.id)
      .populate('vehicle')
      .populate('driver');
    if (!trip) {
      return next(new ApiError(404, 'Trip not found'));
    }
    res.status(200).json({ success: true, data: trip });
  } catch (error) {
    next(error);
  }
};

// @desc    Create trip (Draft state)
// @route   POST /api/trips
// @access  Private (Driver, FleetManager)
exports.createTrip = async (req, res, next) => {
  try {
    const { vehicle, driver, cargoWeight } = req.body;

    // Run business validations first
    await statusEngine.validateTripCreation({
      vehicleId: vehicle,
      driverId: driver,
      cargoWeight
    });

    const trip = await Trip.create({
      ...req.body,
      status: 'Draft'
    });

    res.status(201).json({ success: true, data: trip });
  } catch (error) {
    next(error);
  }
};

// @desc    Dispatch trip (Triggers On Trip status)
// @route   PUT /api/trips/:id/dispatch
// @access  Private (Driver, FleetManager)
exports.dispatchTrip = async (req, res, next) => {
  try {
    const trip = await statusEngine.dispatchTrip(req.params.id);
    res.status(200).json({ success: true, data: trip });
  } catch (error) {
    next(error);
  }
};

// @desc    Complete trip (Restores Available status, records parameters)
// @route   PUT /api/trips/:id/complete
// @access  Private (Driver, FleetManager)
exports.completeTrip = async (req, res, next) => {
  try {
    const { finalOdometer, fuelConsumed, actualDistance } = req.body;
    if (finalOdometer === undefined || fuelConsumed === undefined || actualDistance === undefined) {
      return next(new ApiError(400, 'Please provide finalOdometer, fuelConsumed, and actualDistance'));
    }

    const trip = await statusEngine.completeTrip(req.params.id, {
      finalOdometer,
      fuelConsumed,
      actualDistance
    });

    res.status(200).json({ success: true, data: trip });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel trip
// @route   PUT /api/trips/:id/cancel
// @access  Private (Driver, FleetManager)
exports.cancelTrip = async (req, res, next) => {
  try {
    const trip = await statusEngine.cancelTrip(req.params.id);
    res.status(200).json({ success: true, data: trip });
  } catch (error) {
    next(error);
  }
};
