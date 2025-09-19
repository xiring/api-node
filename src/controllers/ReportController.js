const ReportService = require('../services/ReportService');
const QueueService = require('../services/QueueService');
const ResponseHelper = require('../utils/response');
const { AppError } = require('../errors');
const path = require('path');
const fs = require('fs');

class ReportController {
  export = async (req, res, next) => {
    try {
      const { type, filters = {}, delivery = 'download' } = req.body || {};
      if (!type) {
        throw new AppError('Report type is required', 400);
      }

      // Enqueue job
      const job = await QueueService.addJob('report', 'report-export', {
        requester: req.user,
        type,
        filters,
        delivery
      }, {
        attempts: 2,
        removeOnComplete: true,
        removeOnFail: 5
      });

      return ResponseHelper.success(res, { jobId: job.id }, 'Report export enqueued');
    } catch (error) {
      next(error);
    }
  };

  status = async (req, res, next) => {
    try {
      const { jobId } = req.params;
      const job = await QueueService.getJob('report', jobId);
      const state = await job.getState();
      const progress = job.progress() || 0;
      const result = job.returnvalue || null;

      return ResponseHelper.success(res, {
        state,
        progress,
        result
      }, 'Report status');
    } catch (error) {
      next(error);
    }
  };

  download = async (req, res, next) => {
    try {
      const { jobId } = req.params;
      const job = await QueueService.getJob('report', jobId);
      const result = job.returnvalue;
      if (!result || !result.filePath) {
        throw new AppError('Report file not ready', 404);
      }

      const absolutePath = path.resolve(result.filePath);
      if (!fs.existsSync(absolutePath)) {
        throw new AppError('Report file missing', 404);
      }

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=${result.fileName}`);
      fs.createReadStream(absolutePath).pipe(res);
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new ReportController();


