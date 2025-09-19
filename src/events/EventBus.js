const { EventEmitter } = require('events');
const logger = require('../utils/logger');

class EventBus extends EventEmitter {
  emit(eventName, payload = {}) {
    try {
      logger.info(`event: ${eventName} payload=${JSON.stringify(safePayload(payload))}`);
    } catch (_) {}
    return super.emit(eventName, payload);
  }
}

function safePayload(payload) {
  const cloned = { ...payload };
  if (cloned.password) cloned.password = '[REDACTED]';
  if (cloned.token) cloned.token = '[REDACTED]';
  if (cloned.refreshToken) cloned.refreshToken = '[REDACTED]';
  return cloned;
}

module.exports = new EventBus();


