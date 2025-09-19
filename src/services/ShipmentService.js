const ShipmentRepository = require('../repositories/ShipmentRepository');
const ShipmentDTO = require('../dtos/ShipmentDTO');
const { NotFoundError, BusinessLogicError } = require('../errors');
const { ERROR_MESSAGES, SUCCESS_MESSAGES, DATABASE, SHIPMENT_STATUS } = require('../constants');

class ShipmentService {
  constructor() {
    this.shipmentRepository = new ShipmentRepository();
  }

  async createShipment(shipmentData) {
    const { orderId, warehouseId, estimatedDeliveryDate, notes } = shipmentData;

    // Generate tracking number
    const trackingNumber = this.generateTrackingNumber();

    const shipmentDataToCreate = ShipmentDTO.createShipment({
      orderId,
      warehouseId,
      trackingNumber,
      status: SHIPMENT_STATUS.PREPARING,
      estimatedDeliveryDate,
      notes
    });

    const shipment = await this.shipmentRepository.create(shipmentDataToCreate.toJSON());

    return ShipmentDTO.response(shipment);
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
    return ShipmentDTO.response(shipment);
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
