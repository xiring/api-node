const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth');
const warehouseRoutes = require('./warehouses');
const vendorRoutes = require('./vendors');
const fareRoutes = require('./fares');
const orderRoutes = require('./orders');
const shipmentRoutes = require('./shipments');

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Logistics Management API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
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

module.exports = router;
