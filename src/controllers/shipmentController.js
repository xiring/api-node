const ShipmentService = require('../services/ShipmentService');
const ResponseHelper = require('../utils/response');
const { SUCCESS_MESSAGES } = require('../constants');

class ShipmentController {
  constructor() {
    this.shipmentService = new ShipmentService();
  }

  getAllShipments = async (req, res, next) => {
    try {
      const result = await this.shipmentService.getShipments(req.query);
      ResponseHelper.paginated(res, result.shipments, result.pagination, 'Shipments retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  getShipmentById = async (req, res, next) => {
    try {
      const result = await this.shipmentService.getShipmentById(req.params.id);
      ResponseHelper.success(res, { shipment: result }, 'Shipment retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  getShipmentByTrackingNumber = async (req, res, next) => {
    try {
      const result = await this.shipmentService.getShipmentByTrackingNumber(req.params.trackingNumber);
      ResponseHelper.success(res, { shipment: result }, 'Shipment retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  createShipment = async (req, res, next) => {
    try {
      const result = await this.shipmentService.createShipment(req.body);
      ResponseHelper.created(res, { shipment: result }, SUCCESS_MESSAGES.SHIPMENT_CREATED);
    } catch (error) {
      next(error);
    }
  };

  updateShipment = async (req, res, next) => {
    try {
      const result = await this.shipmentService.updateShipment(req.params.id, req.body);
      ResponseHelper.success(res, { shipment: result }, SUCCESS_MESSAGES.SHIPMENT_UPDATED);
    } catch (error) {
      next(error);
    }
  };

  deleteShipment = async (req, res, next) => {
    try {
      const result = await this.shipmentService.deleteShipment(req.params.id);
      ResponseHelper.success(res, result, SUCCESS_MESSAGES.SHIPMENT_DELETED);
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new ShipmentController();