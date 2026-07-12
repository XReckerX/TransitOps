const Vehicle = require('../models/Vehicle');
const Trip = require('../models/Trip');
const Maintenance = require('../models/Maintenance');
const FuelLog = require('../models/FuelLog');

/**
 * Calculates analytics across the fleet (ROI, fuel efficiency, operational cost)
 */
async function getFleetAnalytics() {
  const vehicles = await Vehicle.find({ status: { $ne: 'Retired' } });

  const analytics = await Promise.all(
    vehicles.map(async (vehicle) => {
      // 1. Total fuel logs cost & liters
      const fuelLogs = await FuelLog.find({ vehicle: vehicle._id });
      const totalFuelCost = fuelLogs.reduce((sum, log) => sum + log.cost, 0);
      const totalFuelLiters = fuelLogs.reduce((sum, log) => sum + log.liters, 0);

      // 2. Total maintenance cost
      const maintenances = await Maintenance.find({ vehicle: vehicle._id });
      const totalMaintenanceCost = maintenances.reduce((sum, maint) => sum + maint.cost, 0);

      // 3. Operational Cost = Fuel + Maintenance
      const operationalCost = totalFuelCost + totalMaintenanceCost;

      // 4. Completed distance (using trips completed)
      const completedTrips = await Trip.find({ vehicle: vehicle._id, status: 'Completed' });
      const totalDistance = completedTrips.reduce((sum, trip) => sum + (trip.actualDistance || 0), 0);

      // 5. Fuel Efficiency = Distance / Fuel Consumed
      const fuelEfficiency = totalFuelLiters > 0 ? (totalDistance / totalFuelLiters) : 0;

      // 6. Estimated Revenue (Mock revenue based on cargo weight and distance for ROI check)
      // Standard rate: $2.5 per kg per 100km
      const estimatedRevenue = completedTrips.reduce((sum, trip) => {
        const tripRev = (trip.cargoWeight * (trip.actualDistance || 0) * 0.025);
        return sum + tripRev;
      }, 0);

      // 7. Vehicle ROI = (Revenue - (Maintenance + Fuel)) / AcquisitionCost
      const roi = vehicle.acquisitionCost > 0
        ? ((estimatedRevenue - operationalCost) / vehicle.acquisitionCost) * 100
        : 0;

      return {
        vehicleId: vehicle._id,
        registrationNumber: vehicle.registrationNumber,
        name: vehicle.name,
        type: vehicle.type,
        odometer: vehicle.odometer,
        region: vehicle.region,
        totalFuelCost,
        totalFuelLiters,
        totalMaintenanceCost,
        operationalCost,
        totalDistance,
        fuelEfficiency: parseFloat(fuelEfficiency.toFixed(2)),
        roi: parseFloat(roi.toFixed(2)),
        completedTripsCount: completedTrips.length
      };
    })
  );

  return analytics;
}

module.exports = {
  getFleetAnalytics
};
