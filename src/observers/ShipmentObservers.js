const logger = require('../utils/logger');
const EmailService = require('../services/EmailService');

module.exports = function registerShipmentObservers(eventBus) {
  eventBus.on('shipment.created', async ({ shipment }) => {
    try {
      logger.info(`observer:shipment.created shipment=${shipment.id}`);
    } catch (error) {
      logger.error(`observer:shipment.created failed: ${error.message}`);
    }
  });

  eventBus.on('shipment.updated', async ({ shipment, user }) => {
    try {
      logger.info(`observer:shipment.updated shipment=${shipment.id} status=${shipment.status}`);
      if (user && user.email) {
        await EmailService.sendShipmentNotificationEmail(user, shipment);
      }
    } catch (error) {
      logger.error(`observer:shipment.updated failed: ${error.message}`);
    }
  });
};


