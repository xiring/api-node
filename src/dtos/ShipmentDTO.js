const BaseDTO = require('./BaseDTO');

class ShipmentDTO extends BaseDTO {
  constructor(data = {}) {
    super(data);
  }

  static createShipment(data) {
    return new ShipmentDTO({
      orderId: data.orderId,
      warehouseId: data.warehouseId,
      trackingNumber: data.trackingNumber,
      status: data.status,
      estimatedDeliveryDate: data.estimatedDeliveryDate,
      actualDeliveryDate: data.actualDeliveryDate,
      notes: data.notes
    });
  }

  static updateShipment(data) {
    const updateData = {};
    if (data.status) updateData.status = data.status;
    if (data.estimatedDeliveryDate) updateData.estimatedDeliveryDate = data.estimatedDeliveryDate;
    if (data.actualDeliveryDate) updateData.actualDeliveryDate = data.actualDeliveryDate;
    if (data.notes) updateData.notes = data.notes;
    return new ShipmentDTO(updateData);
  }

  static response(shipment) {
    return new ShipmentDTO({
      id: shipment.id,
      orderId: shipment.orderId,
      warehouseId: shipment.warehouseId,
      trackingNumber: shipment.trackingNumber,
      status: shipment.status,
      estimatedDeliveryDate: shipment.estimatedDeliveryDate,
      actualDeliveryDate: shipment.actualDeliveryDate,
      notes: shipment.notes,
      createdAt: shipment.createdAt,
      updatedAt: shipment.updatedAt
    });
  }

  static withRelations(shipment) {
    const response = ShipmentDTO.response(shipment);
    if (shipment.order) response.data.order = shipment.order;
    if (shipment.warehouse) response.data.warehouse = shipment.warehouse;
    return response;
  }
}

module.exports = ShipmentDTO;
