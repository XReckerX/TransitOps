const express = require('express');
const { getDashboardKPIs } = require('../controllers/dashboardController');
const protect = require('../middlewares/authMiddleware');
const rbac = require('../middlewares/rbacMiddleware');

const router = express.Router();

router.get('/', protect, rbac(['FleetManager', 'Driver']), getDashboardKPIs);

module.exports = router;
