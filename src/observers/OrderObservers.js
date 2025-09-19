const logger = require('../utils/logger');
const EmailService = require('../services/EmailService');

module.exports = function registerOrderObservers(eventBus) {
  eventBus.on('order.created', async ({ order, user }) => {
    try {
      logger.info(`observer:order.created order=${order.id}`);
      if (user && user.email) {
        await EmailService.sendOrderConfirmationEmail(user, order);
      }
    } catch (error) {
      logger.error(`observer:order.created failed: ${error.message}`);
    }
  });

  eventBus.on('order.updated', async ({ order }) => {
    try {
      logger.info(`observer:order.updated order=${order.id} status=${order.status}`);
    } catch (error) {
      logger.error(`observer:order.updated failed: ${error.message}`);
    }
  });
};


