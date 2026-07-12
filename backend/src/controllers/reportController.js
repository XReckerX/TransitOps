const analyticsService = require('../services/analyticsService');
const exportService = require('../services/exportService');
const ApiError = require('../utils/ApiError');

// @desc    Get fleet analytics reports
// @route   GET /api/reports/analytics
// @access  Private (FleetManager, FinancialAnalyst)
exports.getAnalytics = async (req, res, next) => {
  try {
    const reportData = await analyticsService.getFleetAnalytics();
    res.status(200).json({ success: true, count: reportData.length, data: reportData });
  } catch (error) {
    next(error);
  }
};

// @desc    Export report (CSV or PDF)
// @route   GET /api/reports/export
// @access  Private (FleetManager, FinancialAnalyst)
exports.exportReport = async (req, res, next) => {
  try {
    const { format } = req.query;
    const reportData = await analyticsService.getFleetAnalytics();

    if (format === 'csv') {
      const fields = [
        'registrationNumber',
        'name',
        'type',
        'odometer',
        'region',
        'operationalCost',
        'fuelEfficiency',
        'roi'
      ];
      const csv = exportService.exportToCSV(reportData, fields);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=fleet_analytics_report.csv');
      return res.status(200).send(csv);
    } else if (format === 'pdf') {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=fleet_analytics_report.pdf');
      return exportService.exportToPDF(reportData, res);
    } else {
      return next(new ApiError(400, 'Format must be either csv or pdf'));
    }
  } catch (error) {
    next(error);
  }
};
