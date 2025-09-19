// Test server without database connection
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./src/config/swagger');
const config = require('./src/config');
const { errorHandler, notFound } = require('./src/middleware/errorHandler');

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] 
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: {
    error: 'Too many requests',
    message: 'Too many requests from this IP, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

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

// Test routes import
try {
  console.log('Loading routes...');
  const routes = require('./src/routes');
  app.use('/api', routes);
  console.log('Routes loaded successfully');
} catch (error) {
  console.error('Error loading routes:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
}

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Logistics Management API',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
    documentation: 'http://localhost:3001/api-docs',
    health: 'http://localhost:3001/api/health'
  });
});

// 404 handler
app.use(notFound);

// Error handling middleware
app.use(errorHandler);

// Start server
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🚀 Logistics Management API server running on port ${PORT}`);
  console.log(`📊 Environment: ${config.nodeEnv}`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
  console.log(`📖 Health Check: http://localhost:${PORT}/api/health`);
  console.log('Server started successfully!');
  process.exit(0);
});
