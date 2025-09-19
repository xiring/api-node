const OrderRepository = require('../repositories/OrderRepository');
const FareRepository = require('../repositories/FareRepository');
const VendorRepository = require('../repositories/VendorRepository');
const OrderDTO = require('../dtos/OrderDTO');
const EventBus = require('../events/EventBus');
const EVENTS = require('../events/types');
const { NotFoundError, BusinessLogicError } = require('../errors');
const { ERROR_MESSAGES, SUCCESS_MESSAGES, DATABASE, DELIVERY_TYPES } = require('../constants');

class OrderService {
  constructor() {
    this.orderRepository = new OrderRepository();
    this.fareRepository = new FareRepository();
    this.vendorRepository = new VendorRepository();
  }

  async createOrder(orderData) {
    const {
      vendorId,
      userId,
      deliveryCity,
      deliveryAddress,
      contactNumber,
      name,
      alternateContactNumber,
      amountToBeCollected,
      deliveryType,
      productWeight,
      productType,
      notes
    } = orderData;

    // Validate vendor exists
    const vendor = await this.vendorRepository.findById(vendorId);
    if (!vendor) {
      throw new NotFoundError(ERROR_MESSAGES.VENDOR_NOT_FOUND);
    }

    // Find fare for the route (from Pokhara to delivery city)
    const fare = await this.fareRepository.findFirst({
      fromCity: DATABASE.DEFAULT_CITY,
      toCity: { contains: deliveryCity, mode: 'insensitive' },
      isActive: true
    });

    if (!fare) {
      throw new BusinessLogicError(ERROR_MESSAGES.FARE_NOT_FOUND_FOR_ROUTE);
    }

    // Calculate fare amount based on delivery type
    const fareAmount = this.calculateFareAmount(fare, deliveryType);

    // Calculate total amount (fare + COD amount if applicable)
    const totalAmount = fareAmount + (amountToBeCollected || 0);

    // Generate order number
    const orderNumber = this.generateOrderNumber();

    const orderDataToCreate = OrderDTO.createOrder({
      vendorId,
      userId,
      deliveryCity,
      deliveryAddress,
      contactNumber,
      name,
      alternateContactNumber,
      amountToBeCollected,
      deliveryType,
      productWeight,
      productType,
      notes
    });

    const order = await this.orderRepository.create({
      ...orderDataToCreate.toJSON(),
      orderNumber,
      fareId: fare.id,
      totalAmount
    });

    const orderResponse = OrderDTO.response(order);
    try {
      EventBus.emit(EVENTS.ORDER_CREATED, { order: orderResponse.data, user: orderResponse.data.user });
    } catch (_) {}
    
    return orderResponse;
  }

  async getOrders(options = {}) {
    const { page = 1, limit = 10, status, vendorId, userId, deliveryCity, deliveryType } = options;

    return await this.orderRepository.findManyWithPagination({}, {
      page,
      limit,
      status,
      vendorId,
      userId,
      deliveryCity,
      deliveryType
    });
  }

  async getOrderById(id) {
    const order = await this.orderRepository.findByIdWithRelations(id);
    if (!order) {
      throw new NotFoundError(ERROR_MESSAGES.ORDER_NOT_FOUND);
    }

    return OrderDTO.withRelations(order);
  }

  async updateOrder(id, updateData) {
    const orderDataToUpdate = OrderDTO.updateOrder(updateData);
    const order = await this.orderRepository.update(id, orderDataToUpdate.toJSON());
    const orderResponse = OrderDTO.response(order);
    try {
      EventBus.emit(EVENTS.ORDER_UPDATED, { order: orderResponse.data });
    } catch (_) {}
    return orderResponse;
  }

  async deleteOrder(id) {
    await this.orderRepository.delete(id);
    return { message: SUCCESS_MESSAGES.ORDER_DELETED };
  }

  calculateFareAmount(fare, deliveryType) {
    switch (deliveryType) {
      case DELIVERY_TYPES.BRANCH_DELIVERY:
        return fare.branchDelivery;
      case DELIVERY_TYPES.COD_BRANCH:
        return fare.codBranch;
      case DELIVERY_TYPES.DOOR_DELIVERY:
        return fare.doorDelivery;
      default:
        throw new BusinessLogicError(ERROR_MESSAGES.INVALID_DELIVERY_TYPE);
    }
  }

  generateOrderNumber() {
    return `${DATABASE.ORDER_NUMBER_PREFIX}-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }
}

module.exports = OrderService;
