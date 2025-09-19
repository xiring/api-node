const BaseDTO = require('./BaseDTO');
const { ORDER_STATUS, DELIVERY_TYPES } = require('../constants');

class OrderDTO extends BaseDTO {
  constructor(data = {}) {
    super(data);
  }

  static createOrder(data) {
    return new OrderDTO({
      vendorId: data.vendorId,
      userId: data.userId,
      deliveryCity: data.deliveryCity,
      deliveryAddress: data.deliveryAddress,
      contactNumber: data.contactNumber,
      name: data.name,
      alternateContactNumber: data.alternateContactNumber,
      amountToBeCollected: data.amountToBeCollected,
      deliveryType: data.deliveryType,
      productWeight: data.productWeight,
      productType: data.productType,
      notes: data.notes
    });
  }

  static updateOrder(data) {
    const updateData = {};
    if (data.status) updateData.status = data.status;
    if (data.deliveryCity) updateData.deliveryCity = data.deliveryCity;
    if (data.deliveryAddress) updateData.deliveryAddress = data.deliveryAddress;
    if (data.contactNumber) updateData.contactNumber = data.contactNumber;
    if (data.name) updateData.name = data.name;
    if (data.alternateContactNumber) updateData.alternateContactNumber = data.alternateContactNumber;
    if (data.amountToBeCollected !== undefined) updateData.amountToBeCollected = data.amountToBeCollected;
    if (data.deliveryType) updateData.deliveryType = data.deliveryType;
    if (data.productWeight) updateData.productWeight = data.productWeight;
    if (data.productType) updateData.productType = data.productType;
    if (data.notes) updateData.notes = data.notes;
    return new OrderDTO(updateData);
  }

  static response(order) {
    return new OrderDTO({
      id: order.id,
      orderNumber: order.orderNumber,
      vendorId: order.vendorId,
      userId: order.userId,
      status: order.status,
      deliveryCity: order.deliveryCity,
      deliveryAddress: order.deliveryAddress,
      contactNumber: order.contactNumber,
      name: order.name,
      alternateContactNumber: order.alternateContactNumber,
      amountToBeCollected: order.amountToBeCollected,
      deliveryType: order.deliveryType,
      fareId: order.fareId,
      productWeight: order.productWeight,
      productType: order.productType,
      totalAmount: order.totalAmount,
      notes: order.notes,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt
    });
  }

  static withRelations(order) {
    const response = OrderDTO.response(order);
    if (order.vendor) response.data.vendor = order.vendor;
    if (order.user) response.data.user = order.user;
    if (order.fare) response.data.fare = order.fare;
    if (order.shipments) response.data.shipments = order.shipments;
    return response;
  }
}

module.exports = OrderDTO;
