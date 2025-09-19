const request = require('supertest');
const app = require('../server');
const TestHelpers = require('../utils/testHelpers');
const { prisma } = require('../../config/testDatabase');
const { SHIPMENT_STATUS } = require('../../constants');

describe('Shipment Routes', () => {
  let admin, manager, user, order, warehouse, adminToken, managerToken, userToken;

  beforeEach(async () => {
    admin = await TestHelpers.createTestAdmin();
    manager = await TestHelpers.createTestManager();
    user = await TestHelpers.createTestUser();
    // Always create fresh order and warehouse to avoid stale references
    order = await TestHelpers.createTestOrder();
    warehouse = await TestHelpers.createTestWarehouse();
    
    adminToken = TestHelpers.generateAuthToken(admin);
    managerToken = TestHelpers.generateAuthToken(manager);
    userToken = TestHelpers.generateAuthToken(user);
  });

  afterEach(async () => {
    // Clean up after each test - delete in order of foreign key dependencies
    await prisma.shipment.deleteMany();
    await prisma.order.deleteMany();
    await prisma.fare.deleteMany();
    await prisma.warehouse.deleteMany();
    await prisma.vendor.deleteMany();
    await prisma.user.deleteMany();
  });


  describe('GET /api/shipments', () => {
    beforeEach(async () => {
      // Ensure order exists (it might have been deleted by cleanup)
      if (!order || !order.id) {
        order = await TestHelpers.createTestOrder();
      }
      await TestHelpers.createTestShipment({ status: SHIPMENT_STATUS.PREPARING, orderId: order.id });
      await TestHelpers.createTestShipment({ status: SHIPMENT_STATUS.IN_TRANSIT, orderId: order.id });
      await TestHelpers.createTestShipment({ status: SHIPMENT_STATUS.DELIVERED, orderId: order.id });
    });

    it('should get all shipments for authenticated user', async () => {
      const response = await request(app)
        .get('/api/shipments')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(3);
      expect(response.body.pagination).toBeDefined();
    });

    it('should filter shipments by status', async () => {
      const response = await request(app)
        .get(`/api/shipments?status=${SHIPMENT_STATUS.PREPARING}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].status).toBe(SHIPMENT_STATUS.PREPARING);
    });

    it('should filter shipments by order id', async () => {
      // Ensure order exists (it might have been deleted by cleanup)
      if (!order || !order.id) {
        order = await TestHelpers.createTestOrder();
      }
      const response = await request(app)
        .get(`/api/shipments?orderId=${order.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(3);
      expect(response.body.data.every(shipment => shipment.orderId === order.id)).toBe(true);
    });

    it('should return 401 without token', async () => {
      await request(app)
        .get('/api/shipments')
        .expect(401);
    });
  });

  describe('GET /api/shipments/:id', () => {
    let shipment;

    beforeEach(async () => {
      shipment = await TestHelpers.createTestShipment();
    });

    it('should get shipment by id', async () => {
      const response = await request(app)
        .get(`/api/shipments/${shipment.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.shipment).toMatchObject({
        id: shipment.id,
        trackingNumber: shipment.trackingNumber
      });
    });

    it('should return 404 for non-existent shipment', async () => {
      const response = await request(app)
        .get('/api/shipments/non-existent-id')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/shipments/tracking/:trackingNumber', () => {
    let shipment;

    beforeEach(async () => {
      shipment = await TestHelpers.createTestShipment();
    });

    it('should get shipment by tracking number', async () => {
      const response = await request(app)
        .get(`/api/shipments/tracking/${shipment.trackingNumber}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.shipment).toMatchObject({
        id: shipment.id,
        trackingNumber: shipment.trackingNumber
      });
    });

    it('should return 404 for non-existent tracking number', async () => {
      const response = await request(app)
        .get('/api/shipments/tracking/NON-EXISTENT-TRACKING')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/shipments', () => {
    const shipmentData = {
      orderId: '',
      warehouseId: '',
      estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      notes: 'Test shipment notes'
    };

    beforeEach(async () => {
      // Ensure order and warehouse exist (they might have been deleted by cleanup)
      if (!order || !order.id) {
        order = await TestHelpers.createTestOrder();
      }
      if (!warehouse || !warehouse.id) {
        warehouse = await TestHelpers.createTestWarehouse();
      }
      shipmentData.orderId = order.id;
      shipmentData.warehouseId = warehouse.id;
    });

    it('should create shipment as manager', async () => {
      const response = await request(app)
        .post('/api/shipments')
        .set('Authorization', `Bearer ${managerToken}`)
        .send(shipmentData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Shipment created successfully');
      expect(response.body.data.shipment).toMatchObject({
        orderId: shipmentData.orderId,
        warehouseId: shipmentData.warehouseId,
        status: SHIPMENT_STATUS.PREPARING
      });
      expect(response.body.data.shipment.trackingNumber).toBeDefined();
    });

    it('should create shipment as admin', async () => {
      const response = await request(app)
        .post('/api/shipments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(shipmentData)
        .expect(201);

      expect(response.body.success).toBe(true);
    });

    it('should return 403 for regular user', async () => {
      const response = await request(app)
        .post('/api/shipments')
        .set('Authorization', `Bearer ${userToken}`)
        .send(shipmentData)
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 for invalid data', async () => {
      const invalidData = {
        // Missing required fields
        estimatedDelivery: 'invalid-date-format'
      };

      const response = await request(app)
        .post('/api/shipments')
        .set('Authorization', `Bearer ${managerToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 404 for non-existent order', async () => {
      const invalidData = {
        ...shipmentData,
        orderId: 'non-existent-order-id'
      };

      const response = await request(app)
        .post('/api/shipments')
        .set('Authorization', `Bearer ${managerToken}`)
        .send(invalidData)
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should return 404 for non-existent warehouse', async () => {
      const invalidData = {
        ...shipmentData,
        warehouseId: 'non-existent-warehouse-id'
      };

      const response = await request(app)
        .post('/api/shipments')
        .set('Authorization', `Bearer ${managerToken}`)
        .send(invalidData)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/shipments/:id', () => {
    let shipment;

    beforeEach(async () => {
      shipment = await TestHelpers.createTestShipment();
    });

    it('should update shipment as manager', async () => {
      const updateData = {
        status: SHIPMENT_STATUS.IN_TRANSIT,
        notes: 'Updated shipment notes'
      };

      const response = await request(app)
        .put(`/api/shipments/${shipment.id}`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.shipment.status).toBe(updateData.status);
      expect(response.body.data.shipment.notes).toBe(updateData.notes);
    });

    it('should update shipment with actual delivery date', async () => {
      const updateData = {
        status: SHIPMENT_STATUS.DELIVERED,
        actualDelivery: new Date().toISOString()
      };

      const response = await request(app)
        .put(`/api/shipments/${shipment.id}`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.shipment.status).toBe(SHIPMENT_STATUS.DELIVERED);
      expect(response.body.data.shipment.actualDelivery).toBeDefined();
    });

    it('should return 403 for regular user', async () => {
      const updateData = { status: SHIPMENT_STATUS.IN_TRANSIT };

      await request(app)
        .put(`/api/shipments/${shipment.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData)
        .expect(403);
    });

    it('should return 404 for non-existent shipment', async () => {
      const updateData = { status: SHIPMENT_STATUS.IN_TRANSIT };

      await request(app)
        .put('/api/shipments/non-existent-id')
        .set('Authorization', `Bearer ${managerToken}`)
        .send(updateData)
        .expect(404);
    });
  });

  describe('DELETE /api/shipments/:id', () => {
    let shipment;

    beforeEach(async () => {
      shipment = await TestHelpers.createTestShipment();
    });

    it('should delete shipment as admin', async () => {
      const response = await request(app)
        .delete(`/api/shipments/${shipment.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Shipment deleted successfully');
    });

    it('should return 403 for manager', async () => {
      await request(app)
        .delete(`/api/shipments/${shipment.id}`)
        .set('Authorization', `Bearer ${managerToken}`)
        .expect(403);
    });

    it('should return 403 for regular user', async () => {
      await request(app)
        .delete(`/api/shipments/${shipment.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });
  });
});
