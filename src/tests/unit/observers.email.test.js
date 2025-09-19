jest.mock('../../services/EmailService', () => ({
  sendWelcomeEmail: jest.fn().mockResolvedValue(true),
  sendOrderConfirmationEmail: jest.fn().mockResolvedValue(true),
  sendShipmentNotificationEmail: jest.fn().mockResolvedValue(true)
}));

describe('Observers invoke EmailService', () => {
  let EventBus;
  let EmailService;

  beforeEach(() => {
    jest.resetModules();
    EventBus = require('../../events/EventBus');
    EmailService = require('../../services/EmailService');
    const registerAuthObservers = require('../../observers/AuthObservers');
    const registerOrderObservers = require('../../observers/OrderObservers');
    const registerShipmentObservers = require('../../observers/ShipmentObservers');
    registerAuthObservers(EventBus);
    registerOrderObservers(EventBus);
    registerShipmentObservers(EventBus);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('auth.registered triggers welcome email', async () => {
    const user = { id: 'u1', email: 'u@example.com', name: 'U' };
    EventBus.emit('auth.registered', { user });
    await new Promise((r) => setImmediate(r));
    expect(EmailService.sendWelcomeEmail).toHaveBeenCalledWith(user);
  });

  test('order.created triggers order confirmation when user present', async () => {
    const user = { id: 'u1', email: 'u@example.com', name: 'U' };
    const order = { id: 'o1', orderNumber: 'ORD-1' };
    EventBus.emit('order.created', { order, user });
    await new Promise((r) => setImmediate(r));
    expect(EmailService.sendOrderConfirmationEmail).toHaveBeenCalledWith(user, order);
  });

  test('shipment.updated triggers shipment email when user present', async () => {
    const user = { id: 'u1', email: 'u@example.com', name: 'U' };
    const shipment = { id: 's1', trackingNumber: 'TRK-1', status: 'IN_TRANSIT' };
    EventBus.emit('shipment.updated', { shipment, user });
    await new Promise((r) => setImmediate(r));
    expect(EmailService.sendShipmentNotificationEmail).toHaveBeenCalledWith(user, shipment);
  });
});


