const express = require('express');
const {
  getMaintenances,
  createMaintenance,
  closeMaintenance
} = require('../controllers/maintenanceController');
const protect = require('../middlewares/authMiddleware');
const rbac = require('../middlewares/rbacMiddleware');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(rbac(['FleetManager']), getMaintenances)
  .post(rbac(['FleetManager']), createMaintenance);

router.put('/:id/close', rbac(['FleetManager']), closeMaintenance);

module.exports = router;
