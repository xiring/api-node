const ShipmentRepository = require('../repositories/ShipmentRepository');
const OrderRepository = require('../repositories/OrderRepository');
const WarehouseRepository = require('../repositories/WarehouseRepository');
const ShipmentDTO = require('../dtos/ShipmentDTO');
const EventBus = require('../events/EventBus');
const EVENTS = require('../events/types');
const { NotFoundError, BusinessLogicError } = require('../errors');
const { ERROR_MESSAGES, SUCCESS_MESSAGES, DATABASE, SHIPMENT_STATUS } = require('../constants');

class ShipmentService {
  constructor() {
    this.shipmentRepository = new ShipmentRepository();
    this.orderRepository = new OrderRepository();
    this.warehouseRepository = new WarehouseRepository();
  }

  async createShipment(shipmentData) {
    const { orderId, warehouseId, estimatedDelivery, notes } = shipmentData;

    // Validate order exists
    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      throw new NotFoundError(ERROR_MESSAGES.ORDER_NOT_FOUND);
    }

    // Validate warehouse exists
    const warehouse = await this.warehouseRepository.findById(warehouseId);
    if (!warehouse) {
      throw new NotFoundError(ERROR_MESSAGES.WAREHOUSE_NOT_FOUND);
    }

    // Generate tracking number
    const trackingNumber = this.generateTrackingNumber();

    const shipmentDataToCreate = ShipmentDTO.createShipment({
      orderId,
      warehouseId,
      trackingNumber,
      status: SHIPMENT_STATUS.PREPARING,
      estimatedDelivery,
      notes
    });

    const shipment = await this.shipmentRepository.create(shipmentDataToCreate.toJSON());

    const shipmentResponse = ShipmentDTO.response(shipment);
    try {
      EventBus.emit(EVENTS.SHIPMENT_CREATED, { shipment: shipmentResponse.data });
    } catch (_) {}

    return shipmentResponse;
  }

  async getShipments(options = {}) {
    const { page = 1, limit = 10, status, orderId, warehouseId } = options;

    return await this.shipmentRepository.findManyWithPagination({}, {
      page,
      limit,
      status,
      orderId,
      warehouseId
    });
  }

  async getShipmentById(id) {
    const shipment = await this.shipmentRepository.findByIdWithRelations(id);
    if (!shipment) {
      throw new NotFoundError(ERROR_MESSAGES.SHIPMENT_NOT_FOUND);
    }

    return ShipmentDTO.withRelations(shipment);
  }

  async getShipmentByTrackingNumber(trackingNumber) {
    const shipment = await this.shipmentRepository.findByTrackingNumber(trackingNumber);
    if (!shipment) {
      throw new NotFoundError(ERROR_MESSAGES.SHIPMENT_NOT_FOUND);
    }

    return ShipmentDTO.withRelations(shipment);
  }

  async updateShipment(id, updateData) {
    const shipmentDataToUpdate = ShipmentDTO.updateShipment(updateData);
    const shipment = await this.shipmentRepository.update(id, shipmentDataToUpdate.toJSON());
    const shipmentResponse = ShipmentDTO.response(shipment);
    try {
      EventBus.emit(EVENTS.SHIPMENT_UPDATED, { shipment: shipmentResponse.data });
    } catch (_) {}
    return shipmentResponse;
  }

  async deleteShipment(id) {
    await this.shipmentRepository.delete(id);
    return { message: SUCCESS_MESSAGES.SHIPMENT_DELETED };
  }

  generateTrackingNumber() {
    return `${DATABASE.TRACKING_NUMBER_PREFIX}-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }
}

module.exports = ShipmentService;
