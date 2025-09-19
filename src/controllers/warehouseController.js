const WarehouseService = require('../services/WarehouseService');
const ResponseHelper = require('../utils/response');
const { SUCCESS_MESSAGES } = require('../constants');

class WarehouseController {
  constructor() {
    this.warehouseService = new WarehouseService();
  }

  getAllWarehouses = async (req, res, next) => {
    try {
      const result = await this.warehouseService.getWarehouses(req.query);
      ResponseHelper.paginated(res, result.warehouses, result.pagination, 'Warehouses retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  getWarehouseById = async (req, res, next) => {
    try {
      const result = await this.warehouseService.getWarehouseById(req.params.id);
      ResponseHelper.success(res, { warehouse: result }, 'Warehouse retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  createWarehouse = async (req, res, next) => {
    try {
      const result = await this.warehouseService.createWarehouse(req.body);
      ResponseHelper.created(res, { warehouse: result }, SUCCESS_MESSAGES.WAREHOUSE_CREATED);
    } catch (error) {
      next(error);
    }
  };

  updateWarehouse = async (req, res, next) => {
    try {
      const result = await this.warehouseService.updateWarehouse(req.params.id, req.body);
      ResponseHelper.success(res, { warehouse: result }, SUCCESS_MESSAGES.WAREHOUSE_UPDATED);
    } catch (error) {
      next(error);
    }
  };

  deleteWarehouse = async (req, res, next) => {
    try {
      const result = await this.warehouseService.deleteWarehouse(req.params.id);
      ResponseHelper.success(res, result, SUCCESS_MESSAGES.WAREHOUSE_DELETED);
    } catch (error) {
      next(error);
    }
  };

  getWarehousesByCity = async (req, res, next) => {
    try {
      const result = await this.warehouseService.getWarehousesByCity(req.params.city);
      ResponseHelper.success(res, { warehouses: result }, 'Warehouses retrieved successfully');
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new WarehouseController();