const DashboardService = require('../services/DashboardService');
const ResponseHelper = require('../utils/response');

class DashboardController {
  summary = async (req, res, next) => {
    try {
      const { range = '30d' } = req.query;
      const data = await DashboardService.getSummary(req.user, range);
      return ResponseHelper.success(res, data, 'Dashboard summary');
    } catch (error) {
      next(error);
    }
  };

  trends = async (req, res, next) => {
    try {
      const { metric = 'orders', range = '30d' } = req.query;
      const data = await DashboardService.getTrends(req.user, metric, range);
      return ResponseHelper.success(res, data, 'Dashboard trends');
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new DashboardController();


