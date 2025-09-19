const request = require('supertest');
const app = require('../server');
const TestHelpers = require('../utils/testHelpers');
const { prisma } = require('../../config/testDatabase');

describe('Fare Routes', () => {
  let admin, manager, user, adminToken, managerToken, userToken;

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

  describe('GET /api/fares', () => {
    it('should get all fares for authenticated user', async () => {
      // Create test fares
      await TestHelpers.createTestFare({ fromCity: 'Pokhara', toCity: 'Kathmandu' });
      await TestHelpers.createTestFare({ fromCity: 'Pokhara', toCity: 'Chitwan' });
      await TestHelpers.createTestFare({ fromCity: 'Pokhara', toCity: 'Bharatpur', isActive: false });

      const response = await request(app)
        .get('/api/fares')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(3);
      expect(response.body.pagination).toBeDefined();
    });

    it('should filter fares by from city', async () => {
      // Create 3 fares from Pokhara
      await TestHelpers.createTestFare({ fromCity: 'Pokhara', toCity: 'Kathmandu' });
      await TestHelpers.createTestFare({ fromCity: 'Pokhara', toCity: 'Chitwan' });
      await TestHelpers.createTestFare({ fromCity: 'Pokhara', toCity: 'Bharatpur' });

      const response = await request(app)
        .get('/api/fares?fromCity=Pokhara')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(3);
      expect(response.body.data.every(fare => fare.fromCity === 'Pokhara')).toBe(true);
    });

    it('should filter fares by to city', async () => {
      // Create a fare to Kathmandu
      await TestHelpers.createTestFare({ fromCity: 'Pokhara', toCity: 'Kathmandu' });

      const response = await request(app)
        .get('/api/fares?toCity=Kathmandu')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(1);
      expect(response.body.data[0].toCity).toBe('Kathmandu');
    });

    it('should filter fares by active status', async () => {
      // Create 2 active fares
      await TestHelpers.createTestFare({ fromCity: 'Pokhara', toCity: 'Kathmandu' });
      await TestHelpers.createTestFare({ fromCity: 'Pokhara', toCity: 'Chitwan' });

      const response = await request(app)
        .get('/api/fares?isActive=true')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(2);
      expect(response.body.data.every(fare => fare.isActive)).toBe(true);
    });

    it('should return 401 without token', async () => {
      await request(app)
        .get('/api/fares')
        .expect(401);
    });
  });

  describe('GET /api/fares/:id', () => {
    let fare;

    beforeEach(async () => {
      fare = await TestHelpers.createTestFare();
    });

    it('should get fare by id', async () => {
      const response = await request(app)
        .get(`/api/fares/${fare.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.fare).toMatchObject({
        id: fare.id,
        fromCity: fare.fromCity,
        toCity: fare.toCity
      });
    });

    it('should return 404 for non-existent fare', async () => {
      const response = await request(app)
        .get('/api/fares/non-existent-id')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/fares', () => {
    const fareData = {
      fromCity: 'Pokhara',
      toCity: 'Bharatpur',
      branchDelivery: 400.00,
      codBranch: 600.00,
      doorDelivery: 800.00
    };

    it('should create fare as manager', async () => {
      const response = await request(app)
        .post('/api/fares')
        .set('Authorization', `Bearer ${managerToken}`)
        .send(fareData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Fare created successfully');
      expect(response.body.data.fare).toMatchObject({
        fromCity: fareData.fromCity,
        toCity: fareData.toCity,
        branchDelivery: fareData.branchDelivery
      });
    });

    it('should create fare as admin', async () => {
      const response = await request(app)
        .post('/api/fares')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(fareData)
        .expect(201);

      expect(response.body.success).toBe(true);
    });

    it('should return 403 for regular user', async () => {
      const response = await request(app)
        .post('/api/fares')
        .set('Authorization', `Bearer ${userToken}`)
        .send(fareData)
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 for invalid data', async () => {
      const invalidData = {
        fromCity: 'P',
        toCity: 'K',
        branchDelivery: -100
      };

      const response = await request(app)
        .post('/api/fares')
        .set('Authorization', `Bearer ${managerToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 409 for duplicate route', async () => {
      await TestHelpers.createTestFare({ fromCity: 'Pokhara', toCity: 'Bharatpur' });

      const response = await request(app)
        .post('/api/fares')
        .set('Authorization', `Bearer ${managerToken}`)
        .send(fareData)
        .expect(409);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/fares/:id', () => {
    let fare;

    beforeEach(async () => {
      fare = await TestHelpers.createTestFare();
    });

    it('should update fare as manager', async () => {
      const updateData = {
        branchDelivery: 600.00,
        doorDelivery: 1200.00
      };

      const response = await request(app)
        .put(`/api/fares/${fare.id}`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.fare.branchDelivery).toBe(updateData.branchDelivery);
      expect(response.body.data.fare.doorDelivery).toBe(updateData.doorDelivery);
    });

    it('should return 403 for regular user', async () => {
      const updateData = { branchDelivery: 600.00 };

      await request(app)
        .put(`/api/fares/${fare.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData)
        .expect(403);
    });

    it('should return 404 for non-existent fare', async () => {
      const updateData = { branchDelivery: 600.00 };

      await request(app)
        .put('/api/fares/non-existent-id')
        .set('Authorization', `Bearer ${managerToken}`)
        .send(updateData)
        .expect(404);
    });
  });

  describe('DELETE /api/fares/:id', () => {
    let fare;

    beforeEach(async () => {
      fare = await TestHelpers.createTestFare();
    });

    it('should delete fare as admin', async () => {
      const response = await request(app)
        .delete(`/api/fares/${fare.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Fare deleted successfully');
    });

    it('should return 403 for manager', async () => {
      await request(app)
        .delete(`/api/fares/${fare.id}`)
        .set('Authorization', `Bearer ${managerToken}`)
        .expect(403);
    });

    it('should return 403 for regular user', async () => {
      await request(app)
        .delete(`/api/fares/${fare.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });
  });

  describe('GET /api/fares/route/:fromCity/:toCity', () => {
    it('should get fare by route', async () => {
      // Create a fare for Pokhara to Kathmandu route
      await TestHelpers.createTestFare({ fromCity: 'Pokhara', toCity: 'Kathmandu' });

      const response = await request(app)
        .get('/api/fares/route/Pokhara/Kathmandu')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.fare.fromCity).toBe('Pokhara');
      expect(response.body.data.fare.toCity).toBe('Kathmandu');
    });

    it('should return 404 for non-existent route', async () => {
      const response = await request(app)
        .get('/api/fares/route/Pokhara/NonExistentCity')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });
});
