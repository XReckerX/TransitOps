const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');
const Trip = require('../models/Trip');

// @desc    Get dashboard KPIs
// @route   GET /api/dashboard
// @access  Private (FleetManager, Driver)
exports.getDashboardKPIs = async (req, res, next) => {
  try {
    const { type, status, region } = req.query;

    let vehicleQuery = {};
    if (type) vehicleQuery.type = type;
    if (status) vehicleQuery.status = status;
    if (region) vehicleQuery.region = region;

    // Fetch vehicle statuses based on filters
    const filteredVehicles = await Vehicle.find(vehicleQuery);
    const activeVehiclesCount = filteredVehicles.filter(v => v.status !== 'Retired').length;
    const availableVehiclesCount = filteredVehicles.filter(v => v.status === 'Available').length;
    const inMaintenanceCount = filteredVehicles.filter(v => v.status === 'In Shop').length;

    // Fetch trip statuses
    const activeTripsCount = await Trip.countDocuments({ status: 'Dispatched' });
    const pendingTripsCount = await Trip.countDocuments({ status: 'Draft' });

    // Fetch driver statuses
    const driversOnDutyCount = await Driver.countDocuments({ status: 'On Trip' });

    // Fleet utilization = (Active Trips / Active Vehicles) * 100
    const fleetUtilization = activeVehiclesCount > 0
      ? parseFloat(((activeTripsCount / activeVehiclesCount) * 100).toFixed(2))
      : 0;

    res.status(200).json({
      success: true,
      data: {
        activeVehicles: activeVehiclesCount,
        availableVehicles: availableVehiclesCount,
        vehiclesInMaintenance: inMaintenanceCount,
        activeTrips: activeTripsCount,
        pendingTrips: pendingTripsCount,
        driversOnDuty: driversOnDutyCount,
        fleetUtilization: `${fleetUtilization}%`
      }
    });
  } catch (error) {
    next(error);
  }
};
