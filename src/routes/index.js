const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth');
const warehouseRoutes = require('./warehouses');
const vendorRoutes = require('./vendors');
const fareRoutes = require('./fares');
const orderRoutes = require('./orders');
const shipmentRoutes = require('./shipments');
const securityRoutes = require('./security');
const queueRoutes = require('./queue');
const reportRoutes = require('./reports');
const dashboardRoutes = require('./dashboard');
const activityRoutes = require('./activity');

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Logistics Management API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Readiness probe with dependencies
router.get('/ready', async (req, res) => {
  const prisma = require('../config/database');
  const redisConfig = require('../config/redis');
  const QueueService = require('../services/QueueService');
  const EmailService = require('../services/EmailService');

  const checks = {
    db: false,
    redis: false,
    queue: false,
    email: false
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.db = true;
  } catch (_) {}

  try {
    const r = await redisConfig.healthCheck();
    checks.redis = r.status === 'connected';
  } catch (_) {}

  try {
    const health = await QueueService.healthCheck();
    checks.queue = health.status === 'healthy';
  } catch (_) {}

  try {
    const emailHealth = await EmailService.healthCheck();
    checks.email = emailHealth.status === 'healthy';
  } catch (_) {}

  const allOk = Object.values(checks).every(Boolean);
  return res.status(allOk ? 200 : 503).json({ status: allOk ? 'ready' : 'degraded', checks, timestamp: new Date().toISOString() });
});

// API documentation endpoint
router.get('/', (req, res) => {
  res.json({
    message: 'Logistics Management API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      warehouses: '/api/warehouses',
      vendors: '/api/vendors',
      fares: '/api/fares',
      orders: '/api/orders',
      shipments: '/api/shipments'
    },
    documentation: 'See README.md for detailed API documentation'
  });
});

// Mount route modules
router.use('/auth', authRoutes);
router.use('/warehouses', warehouseRoutes);
router.use('/vendors', vendorRoutes);
router.use('/fares', fareRoutes);
router.use('/orders', orderRoutes);
router.use('/shipments', shipmentRoutes);
router.use('/security', securityRoutes);
router.use('/queue', queueRoutes);
router.use('/reports', reportRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/activity', activityRoutes);

module.exports = router;
