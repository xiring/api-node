const request = require('supertest');
const app = require('../server');
const TestHelpers = require('../utils/testHelpers');
const { prisma } = require('../../config/testDatabase');

describe('Activity Logs Routes', () => {
  afterEach(async () => {
    await prisma.activityLog.deleteMany();
    await prisma.shipment.deleteMany();
    await prisma.order.deleteMany();
    await prisma.fare.deleteMany();
    await prisma.warehouse.deleteMany();
    await prisma.vendor.deleteMany();
    await prisma.user.deleteMany();
  });

  describe('GET /api/activity/logs', () => {
    let adminToken;
    let userToken;
    let user;

    beforeEach(async () => {
      const admin = await TestHelpers.createTestAdmin({ password: 'Password123!' });
      adminToken = TestHelpers.generateAuthToken(admin);

      user = await TestHelpers.createTestUser({ password: 'Password123!' });
      userToken = TestHelpers.generateAuthToken(user);
    });

    it('should require admin role', async () => {
      await request(app)
        .get('/api/activity/logs')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });

    it('should return paginated activity logs for admin', async () => {
      // Generate some activity logs by making requests
      await request(app)
        .get('/api/health')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const res = await request(app)
        .get('/api/activity/logs?page=1&limit=10')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.pagination).toBeDefined();
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should support filters (method, path, statusCode, userId)', async () => {
      // Create one custom log for the user to ensure predictable filter hit
      await prisma.activityLog.create({
        data: {
          userId: user.id,
          userEmail: user.email,
          method: 'GET',
          path: '/api/custom',
          route: '/api/custom',
          statusCode: 200,
          durationMs: 12,
          ip: '127.0.0.1',
          userAgent: 'jest',
          referer: null
        }
      });

      const res = await request(app)
        .get(`/api/activity/logs?method=GET&statusCode=200&path=custom&userId=${user.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      const items = res.body.data;
      expect(items.length).toBeGreaterThan(0);
      const found = items.find(i => i.path.includes('custom') && i.userId === user.id);
      expect(found).toBeTruthy();
    });
  });
});


