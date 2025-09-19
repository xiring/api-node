const request = require('supertest');
const app = require('../server');
const TestHelpers = require('../utils/testHelpers');
const { prisma } = require('../../config/testDatabase');
const { DELIVERY_TYPES } = require('../../constants');

describe('Order Routes', () => {
  let admin, manager, user, vendor, fare, adminToken, managerToken, userToken;

  beforeAll(async () => {
    // Clean up any existing data before starting the test suite
    await prisma.shipment.deleteMany();
    await prisma.order.deleteMany();
    await prisma.warehouse.deleteMany();
    await prisma.vendor.deleteMany();
    await prisma.fare.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    // Clean up after the entire test suite
    await prisma.shipment.deleteMany();
    await prisma.order.deleteMany();
    await prisma.warehouse.deleteMany();
    await prisma.vendor.deleteMany();
    await prisma.fare.deleteMany();
    await prisma.user.deleteMany();
  });

  beforeEach(async () => {
    // Create fresh users for each test
    admin = await TestHelpers.createTestAdmin();
    manager = await TestHelpers.createTestManager();
    user = await TestHelpers.createTestUser();
    vendor = await TestHelpers.createTestVendor();
    
    // Create test fares for different cities
    await TestHelpers.createTestFare({ toCity: 'Kathmandu' });
    await TestHelpers.createTestFare({ toCity: 'Pokhara' });
    await TestHelpers.createTestFare({ toCity: 'Chitwan' });
    
    adminToken = TestHelpers.generateAuthToken(admin);
    managerToken = TestHelpers.generateAuthToken(manager);
    userToken = TestHelpers.generateAuthToken(user);
  });

  afterEach(async () => {
    // Clean up after each test - delete in order of foreign key dependencies
    // First delete shipments (they reference orders and warehouses)
    await prisma.shipment.deleteMany();
    // Then delete orders (they reference fares, vendors, and users)
    await prisma.order.deleteMany();
    // Then delete warehouses, vendors, and fares (no dependencies)
    await prisma.warehouse.deleteMany();
    await prisma.vendor.deleteMany();
    await prisma.fare.deleteMany();
    // Finally delete users
    await prisma.user.deleteMany();
  });

  describe('GET /api/orders', () => {
    it('should get all orders for authenticated user', async () => {
      // Create test orders with different statuses
      await TestHelpers.createTestOrder({ status: 'PENDING', deliveryCity: 'Kathmandu' });
      await TestHelpers.createTestOrder({ status: 'CONFIRMED', deliveryCity: 'Pokhara' });
      await TestHelpers.createTestOrder({ status: 'DELIVERED', deliveryCity: 'Chitwan' });

      const response = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(3);
      expect(response.body.pagination).toBeDefined();
    });

    it('should filter orders by status', async () => {
      // Create a PENDING order
      await TestHelpers.createTestOrder({ status: 'PENDING', deliveryCity: 'Kathmandu' });

      const response = await request(app)
        .get('/api/orders?status=PENDING')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(1);
      expect(response.body.data[0].status).toBe('PENDING');
    });

    it('should filter orders by delivery city', async () => {
      // Create an order for Kathmandu
      await TestHelpers.createTestOrder({ status: 'PENDING', deliveryCity: 'Kathmandu' });

      const response = await request(app)
        .get('/api/orders?deliveryCity=Kathmandu')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(1);
      expect(response.body.data[0].deliveryCity).toBe('Kathmandu');
    });

    it('should filter orders by delivery type', async () => {
      // Create 3 orders with DOOR_DELIVERY type
      await TestHelpers.createTestOrder({ status: 'PENDING', deliveryCity: 'Kathmandu' });
      await TestHelpers.createTestOrder({ status: 'CONFIRMED', deliveryCity: 'Pokhara' });
      await TestHelpers.createTestOrder({ status: 'DELIVERED', deliveryCity: 'Chitwan' });

      const response = await request(app)
        .get(`/api/orders?deliveryType=${DELIVERY_TYPES.DOOR_DELIVERY}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(3);
      expect(response.body.data.every(order => order.deliveryType === DELIVERY_TYPES.DOOR_DELIVERY)).toBe(true);
    });

    it('should return 401 without token', async () => {
      await request(app)
        .get('/api/orders')
        .expect(401);
    });
  });

  describe('GET /api/orders/:id', () => {
    let order;

    beforeEach(async () => {
      order = await TestHelpers.createTestOrder();
    });

    it('should get order by id', async () => {
      const response = await request(app)
        .get(`/api/orders/${order.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.order).toMatchObject({
        id: order.id,
        orderNumber: order.orderNumber
      });
    });

    it('should return 404 for non-existent order', async () => {
      const response = await request(app)
        .get('/api/orders/non-existent-id')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/orders', () => {
    let fare;
    const orderData = {
      vendorId: '',
      deliveryCity: 'Kathmandu',
      deliveryAddress: 'Test Delivery Address',
      contactNumber: '+977-98-1234567',
      name: 'Test Customer',
      alternateContactNumber: '+977-98-7654321',
      amountToBeCollected: 5000.00,
      deliveryType: DELIVERY_TYPES.DOOR_DELIVERY,
      productWeight: 2.5,
      productType: 'Electronics',
      notes: 'Test order notes'
    };

    beforeEach(async () => {
      // Create fresh vendor and fare for each test
      const testVendor = await TestHelpers.createTestVendor();
      orderData.vendorId = testVendor.id;
      // Create a fare for Kathmandu to match the order
      fare = await TestHelpers.createTestFare({ toCity: 'Kathmandu' });
    });

    it('should create order successfully', async () => {
      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send(orderData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Order created successfully');
      expect(response.body.data.order).toMatchObject({
        deliveryCity: orderData.deliveryCity,
        contactNumber: orderData.contactNumber,
        name: orderData.name,
        deliveryType: orderData.deliveryType,
        productWeight: orderData.productWeight,
        productType: orderData.productType
      });
      expect(response.body.data.order.orderNumber).toBeDefined();
      expect(response.body.data.order.totalAmount).toBeDefined();
    });

    it('should create order with branch delivery', async () => {
      const branchOrderData = {
        ...orderData,
        deliveryType: DELIVERY_TYPES.BRANCH_DELIVERY
      };

      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send(branchOrderData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.order.deliveryType).toBe(DELIVERY_TYPES.BRANCH_DELIVERY);
    });

    it('should create order with COD branch delivery', async () => {
      const codOrderData = {
        ...orderData,
        deliveryType: DELIVERY_TYPES.COD_BRANCH
      };

      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send(codOrderData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.order.deliveryType).toBe(DELIVERY_TYPES.COD_BRANCH);
    });

    it('should return 400 for invalid data', async () => {
      const invalidData = {
        vendorId: 'invalid-id',
        deliveryCity: 'K',
        contactNumber: '123'
      };

      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 for invalid delivery type', async () => {
      const invalidData = {
        ...orderData,
        deliveryType: 'INVALID_TYPE'
      };

      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 404 for non-existent vendor', async () => {
      const invalidData = {
        ...orderData,
        vendorId: 'non-existent-vendor-id'
      };

      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send(invalidData)
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 for city without fare', async () => {
      const invalidData = {
        ...orderData,
        deliveryCity: 'NonExistentCity'
      };

      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/orders/:id', () => {
    let order;

    beforeEach(async () => {
      order = await TestHelpers.createTestOrder();
    });

    it('should update order as manager', async () => {
      const updateData = {
        status: 'CONFIRMED',
        notes: 'Updated notes'
      };

      const response = await request(app)
        .put(`/api/orders/${order.id}`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.order.status).toBe(updateData.status);
      expect(response.body.data.order.notes).toBe(updateData.notes);
    });

    it('should return 403 for regular user', async () => {
      const updateData = { status: 'CONFIRMED' };

      await request(app)
        .put(`/api/orders/${order.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData)
        .expect(403);
    });

    it('should return 404 for non-existent order', async () => {
      const updateData = { status: 'CONFIRMED' };

      await request(app)
        .put('/api/orders/non-existent-id')
        .set('Authorization', `Bearer ${managerToken}`)
        .send(updateData)
        .expect(404);
    });
  });

  describe('DELETE /api/orders/:id', () => {
    let order;

    beforeEach(async () => {
      order = await TestHelpers.createTestOrder();
    });

    it('should delete order as admin', async () => {
      const response = await request(app)
        .delete(`/api/orders/${order.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Order deleted successfully');
    });

    it('should return 403 for manager', async () => {
      await request(app)
        .delete(`/api/orders/${order.id}`)
        .set('Authorization', `Bearer ${managerToken}`)
        .expect(403);
    });

    it('should return 403 for regular user', async () => {
      await request(app)
        .delete(`/api/orders/${order.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });
  });
});
