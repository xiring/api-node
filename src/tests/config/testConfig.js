// Test configuration
process.env.NODE_ENV = 'test';
process.env.PORT = '3001';
process.env.JWT_SECRET = 'test-jwt-secret-key';
process.env.JWT_EXPIRES_IN = '1h';
process.env.DATABASE_URL = 'postgresql://postgres@localhost:5433/logistics_test_db';
process.env.TEST_DATABASE_URL = 'postgresql://postgres@localhost:5433/logistics_test_db';
process.env.RATE_LIMIT_WINDOW_MS = '900000';
process.env.RATE_LIMIT_MAX_REQUESTS = '1000';
process.env.LOG_LEVEL = 'error';

module.exports = {
  NODE_ENV: 'test',
  PORT: 3001,
  JWT_SECRET: 'test-jwt-secret-key',
  JWT_EXPIRES_IN: '1h',
  DATABASE_URL: 'postgresql://postgres@localhost:5433/logistics_test_db',
  TEST_DATABASE_URL: 'postgresql://postgres@localhost:5433/logistics_test_db',
  RATE_LIMIT_WINDOW_MS: 900000,
  RATE_LIMIT_MAX_REQUESTS: 1000
};
