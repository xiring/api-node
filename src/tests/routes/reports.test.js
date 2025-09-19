const request = require('supertest');
const fs = require('fs');
const path = require('path');
const app = require('../server');
const TestHelpers = require('../utils/testHelpers');
const { prisma } = require('../../config/testDatabase');
const { USER_ROLES } = require('../../constants');

// Mock QueueService to avoid Redis in tests
jest.mock('../../services/QueueService', () => {
  const path = require('path');
  const fs = require('fs');
  let lastJob = null;
  return {
    addJob: async (queueName, jobType, data) => {
      lastJob = {
        id: 'job-1',
        data,
        state: 'completed',
        progressValue: 100,
        result: null
      };
      // Create a tiny CSV file to download
      const reportsDir = path.resolve(process.cwd(), 'reports');
      if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });
      const fileName = 'test_report.csv';
      const filePath = path.join(reportsDir, fileName);
      fs.writeFileSync(filePath, 'col1,col2\nval1,val2\n');
      lastJob.result = { filePath, fileName, rows: 1 };
      return { id: lastJob.id };
    },
    getJob: async (queueName, jobId) => {
      const job = lastJob || { id: jobId, state: 'completed', progressValue: 100, result: null };
      return {
        id: job.id,
        async getState() { return job.state; },
        progress() { return job.progressValue; },
        returnvalue: job.result
      };
    }
  };
});

describe('Reports Routes', () => {
  afterEach(async () => {
    await prisma.shipment.deleteMany();
    await prisma.order.deleteMany();
    await prisma.fare.deleteMany();
    await prisma.warehouse.deleteMany();
    await prisma.vendor.deleteMany();
    await prisma.user.deleteMany();
  });

  beforeAll(async () => {
    // Ensure reports directory exists/clean
    const reportsDir = path.resolve(process.cwd(), 'reports');
    if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });
  });

  describe('POST /api/reports/export', () => {
    let managerToken;

    beforeEach(async () => {
      const manager = await TestHelpers.createTestManager({ password: 'Password123!' });
      managerToken = TestHelpers.generateAuthToken(manager);
    });

    it('should enqueue a shipments status report job for manager', async () => {
      const payload = {
        type: 'SHIPMENTS_STATUS',
        filters: { status: ['DELIVERED'] },
        delivery: 'download'
      };

      const res = await request(app)
        .post('/api/reports/export')
        .set('Authorization', `Bearer ${managerToken}`)
        .send(payload)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.jobId).toBeDefined();
    });

    it('should enqueue all supported report types', async () => {
      const types = ['SHIPMENTS_STATUS','ORDERS_SUMMARY','COD_RECONCILIATION','WAREHOUSE_UTILIZATION','USER_ACTIVITY'];
      for (const type of types) {
        const res = await request(app)
          .post('/api/reports/export')
          .set('Authorization', `Bearer ${managerToken}`)
          .send({ type })
          .expect(200);

        expect(res.body.success).toBe(true);
        expect(res.body.data.jobId).toBeDefined();
      }
    });

    it('should return 400 for missing type', async () => {
      const res = await request(app)
        .post('/api/reports/export')
        .set('Authorization', `Bearer ${managerToken}`)
        .send({})
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    it('should return 403 for non-manager/user role', async () => {
      const user = await TestHelpers.createTestUser({ password: 'Password123!' });
      const userToken = TestHelpers.generateAuthToken(user);

      await request(app)
        .post('/api/reports/export')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ type: 'SHIPMENTS_STATUS' })
        .expect(403);
    });
  });

  describe('GET /api/reports/:jobId/status & download', () => {
    let managerToken;

    beforeEach(async () => {
      const manager = await TestHelpers.createTestManager({ password: 'Password123!' });
      managerToken = TestHelpers.generateAuthToken(manager);
    });

    it('should return job status and allow download', async () => {
      const enqueueRes = await request(app)
        .post('/api/reports/export')
        .set('Authorization', `Bearer ${managerToken}`)
        .send({ type: 'SHIPMENTS_STATUS' })
        .expect(200);

      const { jobId } = enqueueRes.body.data;

      const statusRes = await request(app)
        .get(`/api/reports/${jobId}/status`)
        .set('Authorization', `Bearer ${managerToken}`)
        .expect(200);

      expect(statusRes.body.success).toBe(true);
      expect(statusRes.body.data.state).toBeDefined();
      expect(typeof statusRes.body.data.progress).toBe('number');

      const downloadRes = await request(app)
        .get(`/api/reports/${jobId}/download`)
        .set('Authorization', `Bearer ${managerToken}`)
        .expect(200);

      expect(downloadRes.headers['content-type']).toMatch(/text\/csv/);
      expect(downloadRes.headers['content-disposition']).toMatch(/attachment/);
      expect(downloadRes.text).toContain('col1,col2');
    });
  });
});


