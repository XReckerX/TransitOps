const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');
const Trip = require('../models/Trip');
const Maintenance = require('../models/Maintenance');
const ApiError = require('../utils/ApiError');

/**
 * Validates constraints prior to trip creation/dispatch
 */
async function validateTripCreation({ vehicleId, driverId, cargoWeight }) {
  const vehicle = await Vehicle.findById(vehicleId);
  const driver = await Driver.findById(driverId);

  if (!vehicle) {
    throw new ApiError(404, 'Vehicle not found');
  }

  if (['Retired', 'In Shop'].includes(vehicle.status)) {
    throw new ApiError(400, 'Vehicle unavailable for dispatch');
  }

  if (vehicle.status === 'On Trip') {
    throw new ApiError(400, 'Vehicle already assigned to another trip');
  }

  if (cargoWeight > vehicle.maxLoadCapacity) {
    throw new ApiError(400, `Cargo weight (${cargoWeight} kg) exceeds vehicle max capacity (${vehicle.maxLoadCapacity} kg)`);
  }

  if (!driver) {
    throw new ApiError(404, 'Driver not found');
  }

  if (['Suspended', 'On Trip', 'Off Duty'].includes(driver.status)) {
    throw new ApiError(400, `Driver is unavailable (current status: ${driver.status})`);
  }

  if (driver.licenseExpiryDate < new Date()) {
    throw new ApiError(400, 'Driver license is expired');
  }

  return { vehicle, driver };
}

/**
 * Dispatches trip and flags vehicles/drivers as 'On Trip'
 */
async function dispatchTrip(tripId) {
  const trip = await Trip.findById(tripId);
  if (!trip) throw new ApiError(404, 'Trip not found');

  const { vehicle, driver } = await validateTripCreation({
    vehicleId: trip.vehicle,
    driverId: trip.driver,
    cargoWeight: trip.cargoWeight
  });

  vehicle.status = 'On Trip';
  driver.status = 'On Trip';
  await vehicle.save();
  await driver.save();

  trip.status = 'Dispatched';
  trip.dispatchedAt = new Date();
  await trip.save();

  return trip;
}

/**
 * Completes a trip, updates final parameters and returns vehicle/driver to 'Available'
 */
async function completeTrip(tripId, { finalOdometer, fuelConsumed, actualDistance }) {
  const trip = await Trip.findById(tripId);
  if (!trip) throw new ApiError(404, 'Trip not found');
  if (trip.status !== 'Dispatched') {
    throw new ApiError(400, 'Only dispatched trips can be completed');
  }

  const vehicle = await Vehicle.findById(trip.vehicle);
  if (vehicle) {
    vehicle.status = 'Available';
    if (finalOdometer < vehicle.odometer) {
      throw new ApiError(400, 'Final odometer cannot be less than initial vehicle odometer');
    }
    vehicle.odometer = finalOdometer;
    await vehicle.save();
  }

  const driver = await Driver.findById(trip.driver);
  if (driver) {
    driver.status = 'Available';
    await driver.save();
  }

  trip.status = 'Completed';
  trip.fuelConsumed = fuelConsumed;
  trip.actualDistance = actualDistance;
  trip.finalOdometer = finalOdometer;
  trip.completedAt = new Date();
  await trip.save();

  return trip;
}

/**
 * Cancels a trip and restores vehicle/driver status
 */
async function cancelTrip(tripId) {
  const trip = await Trip.findById(tripId);
  if (!trip) throw new ApiError(404, 'Trip not found');

  if (trip.status === 'Completed') {
    throw new ApiError(400, 'Cannot cancel an already completed trip');
  }

  if (trip.status === 'Dispatched') {
    await Vehicle.findByIdAndUpdate(trip.vehicle, { status: 'Available' });
    await Driver.findByIdAndUpdate(trip.driver, { status: 'Available' });
  }

  trip.status = 'Cancelled';
  await trip.save();

  return trip;
}

/**
 * Creates maintenance entry and marks vehicle 'In Shop'
 */
async function createMaintenance(data) {
  const vehicle = await Vehicle.findById(data.vehicle);
  if (!vehicle) throw new ApiError(404, 'Vehicle not found');
  if (vehicle.status === 'Retired') {
    throw new ApiError(400, 'Cannot place a retired vehicle in maintenance');
  }

  const record = await Maintenance.create({ ...data, status: 'Active' });
  vehicle.status = 'In Shop';
  await vehicle.save();

  return record;
}

/**
 * Closes maintenance entry and returns vehicle to 'Available'
 */
async function closeMaintenance(id) {
  const record = await Maintenance.findById(id);
  if (!record) throw new ApiError(404, 'Maintenance record not found');
  if (record.status === 'Completed') {
    throw new ApiError(400, 'Maintenance record is already closed');
  }

  record.status = 'Completed';
  await record.save();

  const vehicle = await Vehicle.findById(record.vehicle);
  if (vehicle && vehicle.status !== 'Retired') {
    vehicle.status = 'Available';
    await vehicle.save();
  }

  return record;
}

module.exports = {
  validateTripCreation,
  dispatchTrip,
  completeTrip,
  cancelTrip,
  createMaintenance,
  closeMaintenance
};
