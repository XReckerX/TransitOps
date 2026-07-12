const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/app');

let mongoServer;
let server;
const PORT = 5001;
const BASE_URL = `http://localhost:${PORT}/api`;
let token;

// IDs to store across stages
let vehicleId;
let driverAlexId;
let driverSuspendedId;
let driverExpiredId;
let validTripId;
let maintenanceId;

async function setup() {
  console.log('--- Setting up Test Environment ---');
  
  // 1. Start MongoDB In-Memory Server
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  console.log(`In-Memory MongoDB started at: ${mongoUri}`);

  // Override db connection function or just connect mongoose directly
  // Close any existing connections first
  await mongoose.disconnect();
  await mongoose.connect(mongoUri);
  console.log('Mongoose connected to in-memory database.');

  // 2. Start HTTP server
  server = app.listen(PORT, () => {
    console.log(`Express test server listening on port ${PORT}`);
  });
}

async function teardown() {
  console.log('\n--- Tearing Down Test Environment ---');
  if (server) {
    await new Promise((resolve) => server.close(resolve));
    console.log('HTTP Server closed.');
  }
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    console.log('Mongoose disconnected.');
  }
  if (mongoServer) {
    await mongoServer.stop();
    console.log('In-Memory MongoDB stopped.');
  }
}

// Helper to make fetch calls
async function apiCall(endpoint, method = 'GET', body = null, headers = {}) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    }
  };
  
  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }
  
  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, options);
  const contentType = response.headers.get('content-type') || '';
  let data;
  if (contentType.includes('application/json')) {
    data = await response.json().catch(() => ({}));
  } else {
    data = await response.text();
  }
  return { status: response.status, data };
}

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ Assertion Failed: ${message}`);
    throw new Error(message);
  } else {
    console.log(`✅ Passed: ${message}`);
  }
}

async function runTests() {
  try {
    await setup();

    // ----------------------------------------------------
    // STAGE 1: Authentication & User Registration
    // ----------------------------------------------------
    console.log('\n[Stage 1: Authentication]');
    
    // Register Fleet Manager
    const regRes = await apiCall('/auth/register', 'POST', {
      name: 'Manager John',
      email: 'manager@transitops.io',
      password: 'password123',
      role: 'FleetManager'
    });
    assert(regRes.status === 201, 'Register user response status is 201');
    assert(regRes.data.success === true, 'Register success is true');
    assert(regRes.data.token !== undefined, 'Token is generated');
    
    // Log in
    const loginRes = await apiCall('/auth/login', 'POST', {
      email: 'manager@transitops.io',
      password: 'password123'
    });
    assert(loginRes.status === 200, 'Login response status is 200');
    assert(loginRes.data.token !== undefined, 'Login token acquired');
    token = loginRes.data.token; // Set globally for subsequent api calls

    // ----------------------------------------------------
    // STAGE 2: Register Fleet Assets (Vehicles & Drivers)
    // ----------------------------------------------------
    console.log('\n[Stage 2: Fleet Registry]');

    // Register Vehicle Van-05
    const vehicleRes = await apiCall('/vehicles', 'POST', {
      registrationNumber: 'GJ01AB4521',
      name: 'Van-05',
      model: 'Ford Transit',
      type: 'Van',
      maxLoadCapacity: 500, // 500 kg
      odometer: 10000,
      acquisitionCost: 620000,
      region: 'West-1'
    });
    assert(vehicleRes.status === 201, 'Vehicle created (201)');
    vehicleId = vehicleRes.data.data._id;
    assert(vehicleRes.data.data.status === 'Available', 'Vehicle status defaults to Available');

    // Attempt to register vehicle with duplicate registration number
    const dupVehicleRes = await apiCall('/vehicles', 'POST', {
      registrationNumber: 'GJ01AB4521',
      name: 'Van-05-Dup',
      model: 'Ford Transit',
      type: 'Van',
      maxLoadCapacity: 500,
      odometer: 10000,
      acquisitionCost: 620000,
      region: 'West-1'
    });
    assert(dupVehicleRes.status === 400, 'Duplicate registration number registration is blocked (400)');

    // Register Driver Alex (Valid License)
    const alexRes = await apiCall('/drivers', 'POST', {
      name: 'Alex',
      licenseNumber: 'DL-12345',
      licenseCategory: 'Commercial',
      licenseExpiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Expiry in 30 days
      contactNumber: '9998887770',
      safetyScore: 95
    });
    assert(alexRes.status === 201, 'Driver Alex created (201)');
    driverAlexId = alexRes.data.data._id;
    assert(alexRes.data.data.status === 'Available', 'Driver status defaults to Available');

    // Register Driver SuspendedBob (Suspended)
    const bobRes = await apiCall('/drivers', 'POST', {
      name: 'SuspendedBob',
      licenseNumber: 'DL-67890',
      licenseCategory: 'Commercial',
      licenseExpiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      contactNumber: '9998887771',
      status: 'Suspended'
    });
    assert(bobRes.status === 201, 'Driver SuspendedBob created');
    driverSuspendedId = bobRes.data.data._id;

    // Register Driver ExpiredCharlie (Expired License)
    const charlieRes = await apiCall('/drivers', 'POST', {
      name: 'ExpiredCharlie',
      licenseNumber: 'DL-11111',
      licenseCategory: 'Commercial',
      licenseExpiryDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // Expired 5 days ago
      contactNumber: '9998887772'
    });
    assert(charlieRes.status === 201, 'Driver ExpiredCharlie created');
    driverExpiredId = charlieRes.data.data._id;

    // ----------------------------------------------------
    // STAGE 3: Trip Management & Validations
    // ----------------------------------------------------
    console.log('\n[Stage 3: Trip Constraints and Lifecycle]');

    // Constraint 1: Cargo weight exceeds capacity (700kg > 500kg)
    const weightFailRes = await apiCall('/trips', 'POST', {
      source: 'Depot A',
      destination: 'Hub B',
      vehicle: vehicleId,
      driver: driverAlexId,
      cargoWeight: 700,
      plannedDistance: 150
    });
    assert(weightFailRes.status === 400, 'Creation fails if cargo weight > vehicle capacity');
    assert(weightFailRes.data.error.includes('exceeds vehicle max capacity'), 'Error message describes weight capacity restriction');

    // Constraint 2: Driver Suspended
    const suspendedFailRes = await apiCall('/trips', 'POST', {
      source: 'Depot A',
      destination: 'Hub B',
      vehicle: vehicleId,
      driver: driverSuspendedId,
      cargoWeight: 300,
      plannedDistance: 150
    });
    assert(suspendedFailRes.status === 400, 'Creation fails if driver is suspended');
    assert(suspendedFailRes.data.error.includes('unavailable'), 'Error message shows driver status is unavailable');

    // Constraint 3: Driver License Expired
    const expiredFailRes = await apiCall('/trips', 'POST', {
      source: 'Depot A',
      destination: 'Hub B',
      vehicle: vehicleId,
      driver: driverExpiredId,
      cargoWeight: 300,
      plannedDistance: 150
    });
    assert(expiredFailRes.status === 400, 'Creation fails if driver license is expired');
    assert(expiredFailRes.data.error.includes('expired'), 'Error message shows license is expired');

    // Valid Trip Creation (Draft)
    const validTripRes = await apiCall('/trips', 'POST', {
      source: 'Depot A',
      destination: 'Hub B',
      vehicle: vehicleId,
      driver: driverAlexId,
      cargoWeight: 400,
      plannedDistance: 120
    });
    assert(validTripRes.status === 201, 'Valid trip created in Draft state');
    validTripId = validTripRes.data.data._id;
    assert(validTripRes.data.data.status === 'Draft', 'Trip status defaults to Draft');

    // Dispatch Trip (Triggers status change to On Trip)
    const dispatchRes = await apiCall(`/trips/${validTripId}/dispatch`, 'PUT');
    assert(dispatchRes.status === 200, 'Trip dispatched successfully');
    assert(dispatchRes.data.data.status === 'Dispatched', 'Trip status changed to Dispatched');

    // Verify Vehicle & Driver statuses updated to 'On Trip'
    const checkVehicleRes = await apiCall(`/vehicles/${vehicleId}`);
    assert(checkVehicleRes.data.data.status === 'On Trip', 'Vehicle status updated to On Trip');
    
    const checkDriverRes = await apiCall(`/drivers/${driverAlexId}`);
    assert(checkDriverRes.data.data.status === 'On Trip', 'Driver status updated to On Trip');

    // Attempt to create another trip with vehicle/driver already 'On Trip'
    const doubleBookRes = await apiCall('/trips', 'POST', {
      source: 'Depot C',
      destination: 'Hub D',
      vehicle: vehicleId,
      driver: driverAlexId,
      cargoWeight: 100,
      plannedDistance: 50
    });
    assert(doubleBookRes.status === 400, 'Cannot book vehicle/driver while on another trip');

    // Complete Trip (Restores Available statuses & updates Odometer)
    const completeRes = await apiCall(`/trips/${validTripId}/complete`, 'PUT', {
      finalOdometer: 10120, // 10000 + 120km
      fuelConsumed: 12, // 12 liters
      actualDistance: 120
    });
    assert(completeRes.status === 200, 'Trip completed successfully');
    assert(completeRes.data.data.status === 'Completed', 'Trip status updated to Completed');

    // Verify Vehicle & Driver restored to 'Available' and odometer updated
    const vehicleAfterTrip = await apiCall(`/vehicles/${vehicleId}`);
    assert(vehicleAfterTrip.data.data.status === 'Available', 'Vehicle status restored to Available');
    assert(vehicleAfterTrip.data.data.odometer === 10120, 'Vehicle odometer updated to final trip odometer');

    const driverAfterTrip = await apiCall(`/drivers/${driverAlexId}`);
    assert(driverAfterTrip.data.data.status === 'Available', 'Driver status restored to Available');

    // ----------------------------------------------------
    // STAGE 4: Maintenance Management
    // ----------------------------------------------------
    console.log('\n[Stage 4: Maintenance Management]');

    // Schedule maintenance
    const maintRes = await apiCall('/maintenance', 'POST', {
      vehicle: vehicleId,
      serviceType: 'Routine Oil Change',
      cost: 5000,
      date: new Date()
    });
    assert(maintRes.status === 201, 'Maintenance scheduled (201)');
    maintenanceId = maintRes.data.data._id;
    assert(maintRes.data.data.status === 'Active', 'Maintenance status defaults to Active');

    // Verify vehicle status changed to 'In Shop'
    const vehicleInShop = await apiCall(`/vehicles/${vehicleId}`);
    assert(vehicleInShop.data.data.status === 'In Shop', 'Vehicle status changes to In Shop');

    // Close maintenance
    const closeMaintRes = await apiCall(`/maintenance/${maintenanceId}/close`, 'PUT');
    assert(closeMaintRes.status === 200, 'Maintenance closed (200)');
    assert(closeMaintRes.data.data.status === 'Completed', 'Maintenance status marked Completed');

    // Verify vehicle restored to 'Available'
    const vehicleRestored = await apiCall(`/vehicles/${vehicleId}`);
    assert(vehicleRestored.data.data.status === 'Available', 'Vehicle status restored to Available');

    // ----------------------------------------------------
    // STAGE 5: Dashboard and Analytics
    // ----------------------------------------------------
    console.log('\n[Stage 5: Dashboard and Report Analytics]');

    // Fuel log
    await apiCall('/fuel-expenses/fuel', 'POST', {
      vehicle: vehicleId,
      liters: 12,
      cost: 1500
    });

    // Check Dashboard
    const dashRes = await apiCall('/dashboard');
    assert(dashRes.status === 200, 'Dashboard loaded');
    assert(dashRes.data.data.availableVehicles > 0, 'Dashboard reports available vehicles');

    // Check Reports
    const reportRes = await apiCall('/reports/analytics');
    assert(reportRes.status === 200, 'Reports analytics loaded');
    const analytics = reportRes.data.data[0];
    assert(analytics.operationalCost === 6500, 'Operational Cost aggregated (Maintenance $5000 + Fuel $1500 = $6500)');
    assert(analytics.fuelEfficiency === 10, 'Fuel Efficiency calculated (120 km / 12 L = 10.00 km/L)');

    // CSV Exporter
    const csvRes = await apiCall('/reports/export?format=csv');
    assert(csvRes.status === 200, 'CSV export generated');
    assert(csvRes.data.includes('registrationNumber') && csvRes.data.includes('roi'), 'CSV output contains appropriate headings');

    console.log('\n🌟 ALL INTEGRATION TESTS PASSED SUCCESSFULLY! 🌟');
  } catch (error) {
    console.error('\n❌ INTEGRATION TESTS FAILED:', error.message);
    process.exit(1);
  } finally {
    await teardown();
    process.exit(0);
  }
}

runTests();
