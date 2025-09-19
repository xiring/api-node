const request = require('supertest');
const app = require('../server');
const TestHelpers = require('../utils/testHelpers');
const { prisma } = require('../../config/testDatabase');

describe('Dashboard Routes', () => {
  afterEach(async () => {
    await prisma.shipment.deleteMany();
    await prisma.order.deleteMany();
    await prisma.fare.deleteMany();
    await prisma.warehouse.deleteMany();
    await prisma.vendor.deleteMany();
    await prisma.user.deleteMany();
  });

  describe('GET /api/dashboard/summary', () => {
    it('should return summary for manager', async () => {
      const manager = await TestHelpers.createTestManager({ password: 'Password123!' });
      const token = TestHelpers.generateAuthToken(manager);

      const res = await request(app)
        .get('/api/dashboard/summary?range=7d')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.totals).toBeDefined();
      expect(res.body.data.trends).toBeDefined();
    });

    it('should allow vendor/user role', async () => {
      const user = await TestHelpers.createTestUser({ password: 'Password123!' });
      const token = TestHelpers.generateAuthToken(user);
      const res = await request(app)
        .get('/api/dashboard/summary')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/dashboard/trends', () => {
    it('should return trends for orders', async () => {
      const manager = await TestHelpers.createTestManager({ password: 'Password123!' });
      const token = TestHelpers.generateAuthToken(manager);

      const res = await request(app)
        .get('/api/dashboard/trends?metric=orders&range=14d')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.metric).toBe('orders');
      expect(res.body.data.series).toBeDefined();
    });
  });
});


