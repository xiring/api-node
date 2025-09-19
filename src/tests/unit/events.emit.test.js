const EVENTS = require('../../events/types');

jest.mock('../../repositories/OrderRepository');
jest.mock('../../repositories/FareRepository');
jest.mock('../../repositories/VendorRepository');
jest.mock('../../repositories/ShipmentRepository');
jest.mock('../../repositories/WarehouseRepository');
jest.mock('../../repositories/UserRepository');

describe('EventBus emissions in services', () => {
  let EventBus;
  beforeEach(() => {
    jest.resetModules();
    EventBus = require('../../events/EventBus');
    jest.spyOn(EventBus, 'emit').mockImplementation(() => true);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('OrderService emits ORDER_CREATED and ORDER_UPDATED', async () => {
    const OrderRepository = require('../../repositories/OrderRepository');
    const FareRepository = require('../../repositories/FareRepository');
    const VendorRepository = require('../../repositories/VendorRepository');
    OrderRepository.mockImplementation(() => ({
      create: async (data) => ({ id: 'order-1', ...data, createdAt: new Date(), updatedAt: new Date() }),
      update: async (id, data) => ({ id, ...data, createdAt: new Date(), updatedAt: new Date() }),
      findByIdWithRelations: async (id) => ({ id })
    }));
    FareRepository.mockImplementation(() => ({
      findFirst: async () => ({ id: 'fare-1', branchDelivery: 100, codBranch: 150, doorDelivery: 200 })
    }));
    VendorRepository.mockImplementation(() => ({ findById: async () => ({ id: 'vendor-1' }) }));

    const OrderService = require('../../services/OrderService');
    const service = new OrderService();

    const created = await service.createOrder({
      vendorId: 'vendor-1',
      userId: 'user-1',
      deliveryCity: 'Kathmandu',
      deliveryAddress: 'Street',
      contactNumber: '123',
      name: 'Foo',
      deliveryType: 'DOOR_DELIVERY',
      productWeight: 1,
      productType: 'Box'
    });
    expect(EventBus.emit).toHaveBeenCalledWith(EVENTS.ORDER_CREATED, expect.objectContaining({ order: expect.objectContaining({ id: 'order-1' }) }));

    await service.updateOrder('order-1', { status: 'CONFIRMED' });
    expect(EventBus.emit).toHaveBeenCalledWith(EVENTS.ORDER_UPDATED, expect.objectContaining({ order: expect.objectContaining({ id: 'order-1' }) }));
  });

  test('ShipmentService emits SHIPMENT_CREATED and SHIPMENT_UPDATED', async () => {
    const ShipmentRepository = require('../../repositories/ShipmentRepository');
    const OrderRepository = require('../../repositories/OrderRepository');
    const WarehouseRepository = require('../../repositories/WarehouseRepository');
    ShipmentRepository.mockImplementation(() => ({
      create: async (data) => ({ id: 'shipment-1', ...data, createdAt: new Date(), updatedAt: new Date() }),
      update: async (id, data) => ({ id, ...data, createdAt: new Date(), updatedAt: new Date() })
    }));
    OrderRepository.mockImplementation(() => ({ findById: async () => ({ id: 'order-1' }) }));
    WarehouseRepository.mockImplementation(() => ({ findById: async () => ({ id: 'warehouse-1' }) }));

    const ShipmentService = require('../../services/ShipmentService');
    const service = new ShipmentService();

    const created = await service.createShipment({ orderId: 'order-1', warehouseId: 'warehouse-1' });
    expect(EventBus.emit).toHaveBeenCalledWith(EVENTS.SHIPMENT_CREATED, expect.objectContaining({ shipment: expect.objectContaining({ id: 'shipment-1' }) }));

    await service.updateShipment('shipment-1', { status: 'IN_TRANSIT' });
    expect(EventBus.emit).toHaveBeenCalledWith(EVENTS.SHIPMENT_UPDATED, expect.objectContaining({ shipment: expect.objectContaining({ id: 'shipment-1' }) }));
  });

  test('AuthService emits AUTH_REGISTERED and AUTH_LOGIN', async () => {
    const UserRepository = require('../../repositories/UserRepository');
    UserRepository.mockImplementation(() => ({
      findByEmail: async (email) => (email.includes('exists') ? { id: 'u', email: 'exists@example.com', password: '$2a$12$abcdefghijkABCDEFGHIJK12345lmno', role: 'USER', name: 'X' } : null),
      create: async (data) => ({ id: 'user-1', ...data })
    }));

    // Mock password utils to bypass hashing and verification
    jest.mock('../../utils/passwordSecurity', () => ({
      isValidPassword: () => true,
      hashPassword: async (p) => 'hashed',
      verifyPassword: async () => true
    }));

    // Mock CacheService to avoid Redis dependency
    jest.mock('../../services/CacheService', () => ({
      set: async () => true,
      get: async () => null,
      delete: async () => true
    }));

    const AuthService = require('../../services/AuthService');
    const service = new AuthService();

    await service.register({ email: 'new@example.com', password: 'Password123!', name: 'New', role: 'USER' }, { get: () => 'jest' });
    expect(EventBus.emit).toHaveBeenCalledWith(EVENTS.AUTH_REGISTERED, expect.objectContaining({ user: expect.objectContaining({ id: 'user-1' }) }));

    await service.login({ email: 'exists@example.com', password: 'Password123!' }, { get: () => 'jest' });
    expect(EventBus.emit).toHaveBeenCalledWith(EVENTS.AUTH_LOGIN, expect.objectContaining({ user: expect.objectContaining({ id: expect.any(String) }) }));
  });
});


