const express = require('express');
const { getAnalytics, exportReport } = require('../controllers/reportController');
const protect = require('../middlewares/authMiddleware');
const rbac = require('../middlewares/rbacMiddleware');

const router = express.Router();

router.use(protect);

router.get('/analytics', rbac(['FleetManager', 'FinancialAnalyst', 'SafetyOfficer']), getAnalytics);
router.get('/export', rbac(['FleetManager', 'FinancialAnalyst']), exportReport);

module.exports = router;
