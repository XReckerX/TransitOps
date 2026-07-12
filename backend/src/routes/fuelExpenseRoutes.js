const express = require('express');
const {
  getFuelLogs,
  createFuelLog,
  getExpenses,
  createExpense
} = require('../controllers/fuelExpenseController');
const protect = require('../middlewares/authMiddleware');
const rbac = require('../middlewares/rbacMiddleware');

const router = express.Router();

router.use(protect);

router
  .route('/fuel')
  .get(rbac(['FleetManager', 'FinancialAnalyst', 'Driver']), getFuelLogs)
  .post(rbac(['Driver', 'FleetManager']), createFuelLog);

router
  .route('/expenses')
  .get(rbac(['FleetManager', 'FinancialAnalyst', 'Driver']), getExpenses)
  .post(rbac(['Driver', 'FleetManager', 'FinancialAnalyst']), createExpense);

module.exports = router;
