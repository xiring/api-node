const logger = require('../utils/logger');
const EmailService = require('../services/EmailService');

module.exports = function registerAuthObservers(eventBus) {
  eventBus.on('auth.registered', async ({ user }) => {
    try {
      logger.info(`observer:auth.registered user=${user.id}`);
      await EmailService.sendWelcomeEmail(user);
    } catch (error) {
      logger.error(`observer:auth.registered failed: ${error.message}`);
    }
  });

  eventBus.on('auth.login', async ({ user }) => {
    try {
      logger.info(`observer:auth.login user=${user.id}`);
    } catch (error) {
      logger.error(`observer:auth.login failed: ${error.message}`);
    }
  });
};


