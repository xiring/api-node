const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./config/swagger');
const config = require('./config');
const routes = require('./routes');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const SecurityMiddleware = require('./middleware/security');
const SecurityLogger = require('./utils/securityLogger');
const ActivityMiddleware = require('./middleware/activity');
const DatabaseOptimization = require('./utils/databaseOptimization');
const CacheService = require('./services/CacheService');
const EmailService = require('./services/EmailService');
const QueueService = require('./services/QueueService');

const app = express();

// Enhanced security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false
}));

// Additional security headers
app.use(SecurityMiddleware.setSecurityHeaders());
app.use(SecurityMiddleware.setCSP());

// CORS configuration with enhanced security
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.ALLOWED_ORIGINS?.split(',') || ['https://yourdomain.com']
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  maxAge: 86400 // 24 hours
}));

// Input sanitization and SQL injection prevention
app.use(SecurityMiddleware.sanitizeInput());
app.use(SecurityMiddleware.preventSQLInjection());

// Request size limiting
app.use(SecurityMiddleware.limitRequestSize('10mb'));

// Request timeout
app.use(SecurityMiddleware.requestTimeout(30000));

// Enhanced rate limiting
const generalLimiter = SecurityMiddleware.createRateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max
});
app.use(generalLimiter);

// Strict rate limiting for auth endpoints
const authLimiter = SecurityMiddleware.createAuthRateLimit();
app.use('/api/auth', authLimiter);

// Speed limiting to prevent brute force
app.use(SecurityMiddleware.createSpeedLimit());

// Logging
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Activity logging (must be before routes to capture all requests)
app.use(ActivityMiddleware.requestActivityLogger());

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Logistics Management API Documentation'
}));

// API routes
app.use('/api', routes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Logistics Management API',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
    documentation: 'http://localhost:3000/api-docs',
    health: 'http://localhost:3000/api/health'
  });
});

// 404 handler
app.use(notFound);

// Error handling middleware
app.use(errorHandler);

// Initialize services
async function initializeServices() {
  try {
    console.log('🔄 Initializing services...');
    
    // Initialize cache service
    await CacheService.initialize();
    console.log('✅ Cache service initialized');
    
    // Initialize email service
    await EmailService.initialize();
    console.log('✅ Email service initialized');
    
    // Initialize queue service
    await QueueService.initialize();
    console.log('✅ Queue service initialized');
    
    console.log('🎉 All services initialized successfully');
  } catch (error) {
    console.error('❌ Service initialization failed:', error.message);
    process.exit(1);
  }
}

// Start server
const PORT = config.port;
app.listen(PORT, async () => {
  console.log(`🚀 Logistics Management API server running on port ${PORT}`);
  console.log(`📊 Environment: ${config.nodeEnv}`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
  console.log(`📖 Health Check: http://localhost:${PORT}/api/health`);
  
  // Initialize services
  await initializeServices();
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await QueueService.shutdown();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await QueueService.shutdown();
  process.exit(0);
});

module.exports = app;
