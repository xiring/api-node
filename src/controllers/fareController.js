const FareService = require('../services/FareService');
const ResponseHelper = require('../utils/response');
const { SUCCESS_MESSAGES } = require('../constants');

class FareController {
  constructor() {
    this.fareService = new FareService();
  }

  getAllFares = async (req, res, next) => {
    try {
      const result = await this.fareService.getFares(req.query);
      ResponseHelper.paginated(res, result.fares, result.pagination, 'Fares retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  getFareById = async (req, res, next) => {
    try {
      const result = await this.fareService.getFareById(req.params.id);
      ResponseHelper.success(res, { fare: result }, 'Fare retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  createFare = async (req, res, next) => {
    try {
      const result = await this.fareService.createFare(req.body);
      ResponseHelper.created(res, { fare: result }, SUCCESS_MESSAGES.FARE_CREATED);
    } catch (error) {
      next(error);
    }
  };

  updateFare = async (req, res, next) => {
    try {
      const result = await this.fareService.updateFare(req.params.id, req.body);
      ResponseHelper.success(res, { fare: result }, SUCCESS_MESSAGES.FARE_UPDATED);
    } catch (error) {
      next(error);
    }
  };

  deleteFare = async (req, res, next) => {
    try {
      const result = await this.fareService.deleteFare(req.params.id);
      ResponseHelper.success(res, result, SUCCESS_MESSAGES.FARE_DELETED);
    } catch (error) {
      next(error);
    }
  };

  getFareByRoute = async (req, res, next) => {
    try {
      const { fromCity, toCity } = req.params;
      const result = await this.fareService.getFareByRoute(fromCity, toCity);
      ResponseHelper.success(res, { fare: result }, 'Fare retrieved successfully');
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new FareController();