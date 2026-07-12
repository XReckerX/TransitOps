const express = require('express');
const {
  getDrivers,
  getDriver,
  createDriver,
  updateDriver,
  deleteDriver
} = require('../controllers/driverController');
const protect = require('../middlewares/authMiddleware');
const rbac = require('../middlewares/rbacMiddleware');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(rbac(['FleetManager', 'SafetyOfficer']), getDrivers)
  .post(rbac(['SafetyOfficer', 'FleetManager']), createDriver);

router
  .route('/:id')
  .get(rbac(['FleetManager', 'SafetyOfficer']), getDriver)
  .put(rbac(['SafetyOfficer', 'FleetManager']), updateDriver)
  .delete(rbac(['SafetyOfficer', 'FleetManager']), deleteDriver);

module.exports = router;
