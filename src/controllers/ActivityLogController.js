const ActivityLogService = require('../services/ActivityLogService');
const ResponseHelper = require('../utils/response');

class ActivityLogController {
  static async list(req, res, next) {
    try {
      const result = await ActivityLogService.getActivityLogs(req.query);
      ResponseHelper.paginated(res, result.logs, result.pagination, 'Activity logs retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ActivityLogController;


