const request = require('supertest');
const app = require('../server');
const TestHelpers = require('../utils/testHelpers');
const { prisma } = require('../../config/testDatabase');

describe('Warehouse Routes', () => {
  let admin, manager, user, adminToken, managerToken, userToken;

  beforeEach(async () => {
    admin = await TestHelpers.createTestAdmin();
    manager = await TestHelpers.createTestManager();
    user = await TestHelpers.createTestUser();
    
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


  describe('GET /api/warehouses', () => {
    beforeEach(async () => {
      await TestHelpers.createTestWarehouse({ name: 'Warehouse 1', city: 'Kathmandu' });
      await TestHelpers.createTestWarehouse({ name: 'Warehouse 2', city: 'Pokhara' });
      await TestHelpers.createTestWarehouse({ name: 'Warehouse 3', city: 'Chitwan', isActive: false });
    });

    it('should get all warehouses for authenticated user', async () => {
      const response = await request(app)
        .get('/api/warehouses')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(3);
      expect(response.body.pagination).toBeDefined();
    });

    it('should filter warehouses by city', async () => {
      const response = await request(app)
        .get('/api/warehouses?city=Kathmandu')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].city).toBe('Kathmandu');
    });

    it('should filter warehouses by active status', async () => {
      const response = await request(app)
        .get('/api/warehouses?isActive=true')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data.every(warehouse => warehouse.isActive)).toBe(true);
    });

    it('should search warehouses by name', async () => {
      const response = await request(app)
        .get('/api/warehouses?search=Warehouse 1')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].name).toBe('Warehouse 1');
    });

    it('should return 401 without token', async () => {
      await request(app)
        .get('/api/warehouses')
        .expect(401);
    });
  });

  describe('GET /api/warehouses/:id', () => {
    let warehouse;

    beforeEach(async () => {
      warehouse = await TestHelpers.createTestWarehouse();
    });

    it('should get warehouse by id', async () => {
      const response = await request(app)
        .get(`/api/warehouses/${warehouse.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.warehouse).toMatchObject({
        id: warehouse.id,
        name: warehouse.name,
        city: warehouse.city
      });
    });

    it('should return 404 for non-existent warehouse', async () => {
      const response = await request(app)
        .get('/api/warehouses/non-existent-id')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/warehouses', () => {
    const warehouseData = {
      name: 'New Warehouse',
      address: 'New Warehouse Address',
      city: 'Bharatpur',
      state: 'Bagmati',
      country: 'Nepal',
      postalCode: '44200',
      capacity: 15000.00
    };

    it('should create warehouse as manager', async () => {
      const response = await request(app)
        .post('/api/warehouses')
        .set('Authorization', `Bearer ${managerToken}`)
        .send(warehouseData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Warehouse created successfully');
      expect(response.body.data.warehouse).toMatchObject({
        name: warehouseData.name,
        city: warehouseData.city,
        capacity: warehouseData.capacity
      });
    });

    it('should create warehouse as admin', async () => {
      const response = await request(app)
        .post('/api/warehouses')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(warehouseData)
        .expect(201);

      expect(response.body.success).toBe(true);
    });

    it('should return 403 for regular user', async () => {
      const response = await request(app)
        .post('/api/warehouses')
        .set('Authorization', `Bearer ${userToken}`)
        .send(warehouseData)
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 for invalid data', async () => {
      const invalidData = {
        name: 'W',
        address: 'A',
        city: 'C'
      };

      const response = await request(app)
        .post('/api/warehouses')
        .set('Authorization', `Bearer ${managerToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/warehouses/:id', () => {
    let warehouse;

    beforeEach(async () => {
      warehouse = await TestHelpers.createTestWarehouse();
    });

    it('should update warehouse as manager', async () => {
      const updateData = {
        name: 'Updated Warehouse Name',
        city: 'Updated City',
        capacity: 20000.00
      };

      const response = await request(app)
        .put(`/api/warehouses/${warehouse.id}`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.warehouse.name).toBe(updateData.name);
      expect(response.body.data.warehouse.city).toBe(updateData.city);
      expect(response.body.data.warehouse.capacity).toBe(updateData.capacity);
    });

    it('should return 403 for regular user', async () => {
      const updateData = { name: 'Updated Name' };

      await request(app)
        .put(`/api/warehouses/${warehouse.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData)
        .expect(403);
    });

    it('should return 404 for non-existent warehouse', async () => {
      const updateData = { name: 'Updated Name' };

      await request(app)
        .put('/api/warehouses/non-existent-id')
        .set('Authorization', `Bearer ${managerToken}`)
        .send(updateData)
        .expect(404);
    });
  });

  describe('DELETE /api/warehouses/:id', () => {
    let warehouse;

    beforeEach(async () => {
      warehouse = await TestHelpers.createTestWarehouse();
    });

    it('should delete warehouse as admin', async () => {
      const response = await request(app)
        .delete(`/api/warehouses/${warehouse.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Warehouse deleted successfully');
    });

    it('should return 403 for manager', async () => {
      await request(app)
        .delete(`/api/warehouses/${warehouse.id}`)
        .set('Authorization', `Bearer ${managerToken}`)
        .expect(403);
    });

    it('should return 403 for regular user', async () => {
      await request(app)
        .delete(`/api/warehouses/${warehouse.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });
  });

  describe('GET /api/warehouses/city/:city', () => {
    beforeEach(async () => {
      await TestHelpers.createTestWarehouse({ name: 'Warehouse 1', city: 'Kathmandu' });
      await TestHelpers.createTestWarehouse({ name: 'Warehouse 2', city: 'Kathmandu' });
      await TestHelpers.createTestWarehouse({ name: 'Warehouse 3', city: 'Pokhara' });
    });

    it('should get warehouses by city', async () => {
      const response = await request(app)
        .get('/api/warehouses/city/Kathmandu')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.warehouses).toHaveLength(2);
      expect(response.body.data.warehouses.every(warehouse => warehouse.city === 'Kathmandu')).toBe(true);
    });

    it('should return empty array for city with no warehouses', async () => {
      const response = await request(app)
        .get('/api/warehouses/city/NonExistentCity')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.warehouses).toHaveLength(0);
    });
  });
});
