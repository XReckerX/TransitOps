const express = require('express');
const {
  getVehicles,
  getVehicle,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  uploadDocument
} = require('../controllers/vehicleController');
const protect = require('../middlewares/authMiddleware');
const rbac = require('../middlewares/rbacMiddleware');
const { upload } = require('../config/cloudinary');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(rbac(['FleetManager', 'Driver', 'SafetyOfficer', 'FinancialAnalyst']), getVehicles)
  .post(rbac(['FleetManager']), createVehicle);

router
  .route('/:id')
  .get(rbac(['FleetManager', 'Driver', 'SafetyOfficer', 'FinancialAnalyst']), getVehicle)
  .put(rbac(['FleetManager']), updateVehicle)
  .delete(rbac(['FleetManager']), deleteVehicle);

router.post('/:id/documents', rbac(['FleetManager']), upload.single('document'), uploadDocument);

module.exports = router;
