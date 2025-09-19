const request = require('supertest');
const app = require('../server');
const TestHelpers = require('../utils/testHelpers');
const { prisma } = require('../../config/testDatabase');

describe('Vendor Routes', () => {
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

  describe('GET /api/vendors', () => {
    beforeEach(async () => {
      await TestHelpers.createTestVendor({ name: 'Vendor 1', city: 'Kathmandu' });
      await TestHelpers.createTestVendor({ name: 'Vendor 2', city: 'Pokhara' });
      await TestHelpers.createTestVendor({ name: 'Vendor 3', city: 'Chitwan', isActive: false });
    });

    it('should get all vendors for authenticated user', async () => {
      const response = await request(app)
        .get('/api/vendors')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(3);
      expect(response.body.pagination).toBeDefined();
    });

    it('should filter vendors by city', async () => {
      const response = await request(app)
        .get('/api/vendors?city=Kathmandu')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].city).toBe('Kathmandu');
    });

    it('should filter vendors by active status', async () => {
      const response = await request(app)
        .get('/api/vendors?isActive=true')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data.every(vendor => vendor.isActive)).toBe(true);
    });

    it('should search vendors by name', async () => {
      const response = await request(app)
        .get('/api/vendors?search=Vendor 1')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].name).toBe('Vendor 1');
    });

    it('should return 401 without token', async () => {
      await request(app)
        .get('/api/vendors')
        .expect(401);
    });
  });

  describe('GET /api/vendors/:id', () => {
    let vendor;

    beforeEach(async () => {
      vendor = await TestHelpers.createTestVendor();
    });

    it('should get vendor by id', async () => {
      const response = await request(app)
        .get(`/api/vendors/${vendor.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.vendor).toMatchObject({
        id: vendor.id,
        name: vendor.name,
        email: vendor.email
      });
    });

    it('should return 404 for non-existent vendor', async () => {
      const response = await request(app)
        .get('/api/vendors/non-existent-id')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/vendors', () => {
    const vendorData = {
      name: 'New Vendor',
      email: 'newvendor@example.com',
      phone: '+977-1-9876543',
      address: 'New Vendor Address',
      city: 'Bharatpur',
      state: 'Bagmati',
      country: 'Nepal',
      postalCode: '44200'
    };

    it('should create vendor as manager', async () => {
      const response = await request(app)
        .post('/api/vendors')
        .set('Authorization', `Bearer ${managerToken}`)
        .send(vendorData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Vendor created successfully');
      expect(response.body.data.vendor).toMatchObject({
        name: vendorData.name,
        email: vendorData.email,
        city: vendorData.city
      });
    });

    it('should create vendor as admin', async () => {
      const response = await request(app)
        .post('/api/vendors')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(vendorData)
        .expect(201);

      expect(response.body.success).toBe(true);
    });

    it('should return 403 for regular user', async () => {
      const response = await request(app)
        .post('/api/vendors')
        .set('Authorization', `Bearer ${userToken}`)
        .send(vendorData)
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 for invalid data', async () => {
      const invalidData = {
        name: 'V',
        email: 'invalid-email'
      };

      const response = await request(app)
        .post('/api/vendors')
        .set('Authorization', `Bearer ${managerToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 409 for duplicate email', async () => {
      await TestHelpers.createTestVendor({ email: 'duplicate@example.com' });

      const response = await request(app)
        .post('/api/vendors')
        .set('Authorization', `Bearer ${managerToken}`)
        .send({ ...vendorData, email: 'duplicate@example.com' })
        .expect(409);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/vendors/:id', () => {
    let vendor;

    beforeEach(async () => {
      vendor = await TestHelpers.createTestVendor();
    });

    it('should update vendor as manager', async () => {
      const updateData = {
        name: 'Updated Vendor Name',
        city: 'Updated City'
      };

      const response = await request(app)
        .put(`/api/vendors/${vendor.id}`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.vendor.name).toBe(updateData.name);
      expect(response.body.data.vendor.city).toBe(updateData.city);
    });

    it('should return 403 for regular user', async () => {
      const updateData = { name: 'Updated Name' };

      await request(app)
        .put(`/api/vendors/${vendor.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData)
        .expect(403);
    });

    it('should return 404 for non-existent vendor', async () => {
      const updateData = { name: 'Updated Name' };

      await request(app)
        .put('/api/vendors/non-existent-id')
        .set('Authorization', `Bearer ${managerToken}`)
        .send(updateData)
        .expect(404);
    });
  });

  describe('DELETE /api/vendors/:id', () => {
    let vendor;

    beforeEach(async () => {
      vendor = await TestHelpers.createTestVendor();
    });

    it('should delete vendor as admin', async () => {
      const response = await request(app)
        .delete(`/api/vendors/${vendor.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Vendor deleted successfully');
    });

    it('should return 403 for manager', async () => {
      await request(app)
        .delete(`/api/vendors/${vendor.id}`)
        .set('Authorization', `Bearer ${managerToken}`)
        .expect(403);
    });

    it('should return 403 for regular user', async () => {
      await request(app)
        .delete(`/api/vendors/${vendor.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });
  });

  describe('GET /api/vendors/city/:city', () => {
    beforeEach(async () => {
      await TestHelpers.createTestVendor({ name: 'Vendor 1', city: 'Kathmandu' });
      await TestHelpers.createTestVendor({ name: 'Vendor 2', city: 'Kathmandu' });
      await TestHelpers.createTestVendor({ name: 'Vendor 3', city: 'Pokhara' });
    });

    it('should get vendors by city', async () => {
      const response = await request(app)
        .get('/api/vendors/city/Kathmandu')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.vendors).toHaveLength(2);
      expect(response.body.data.vendors.every(vendor => vendor.city === 'Kathmandu')).toBe(true);
    });

    it('should return empty array for city with no vendors', async () => {
      const response = await request(app)
        .get('/api/vendors/city/NonExistentCity')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.vendors).toHaveLength(0);
    });
  });
});
