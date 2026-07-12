const express = require('express');
const {
  getTrips,
  getTrip,
  createTrip,
  dispatchTrip,
  completeTrip,
  cancelTrip
} = require('../controllers/tripController');
const protect = require('../middlewares/authMiddleware');
const rbac = require('../middlewares/rbacMiddleware');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(rbac(['FleetManager', 'Driver']), getTrips)
  .post(rbac(['Driver', 'FleetManager']), createTrip);

router.get('/:id', rbac(['FleetManager', 'Driver']), getTrip);
router.put('/:id/dispatch', rbac(['Driver', 'FleetManager']), dispatchTrip);
router.put('/:id/complete', rbac(['Driver', 'FleetManager']), completeTrip);
router.put('/:id/cancel', rbac(['Driver', 'FleetManager']), cancelTrip);

module.exports = router;
