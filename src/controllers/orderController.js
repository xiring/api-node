const OrderService = require('../services/OrderService');
const ResponseHelper = require('../utils/response');
const { SUCCESS_MESSAGES } = require('../constants');

class OrderController {
  constructor() {
    this.orderService = new OrderService();
  }

  getAllOrders = async (req, res, next) => {
    try {
      const result = await this.orderService.getOrders(req.query);
      ResponseHelper.paginated(res, result.orders, result.pagination, 'Orders retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  getOrderById = async (req, res, next) => {
    try {
      const result = await this.orderService.getOrderById(req.params.id);
      ResponseHelper.success(res, { order: result }, 'Order retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  createOrder = async (req, res, next) => {
    try {
      const result = await this.orderService.createOrder(req.body);
      ResponseHelper.created(res, { order: result }, SUCCESS_MESSAGES.ORDER_CREATED);
    } catch (error) {
      next(error);
    }
  };

  updateOrder = async (req, res, next) => {
    try {
      const result = await this.orderService.updateOrder(req.params.id, req.body);
      ResponseHelper.success(res, { order: result }, SUCCESS_MESSAGES.ORDER_UPDATED);
    } catch (error) {
      next(error);
    }
  };

  deleteOrder = async (req, res, next) => {
    try {
      const result = await this.orderService.deleteOrder(req.params.id);
      ResponseHelper.success(res, result, SUCCESS_MESSAGES.ORDER_DELETED);
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new OrderController();