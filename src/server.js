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
const DatabaseOptimization = require('./utils/databaseOptimization');

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

// Start server
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`🚀 Logistics Management API server running on port ${PORT}`);
  console.log(`📊 Environment: ${config.nodeEnv}`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
  console.log(`📖 Health Check: http://localhost:${PORT}/api/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

module.exports = app;
