const { cleanDatabase, closeDatabase } = require('../config/testDatabase');
require('./config/testConfig');

// Override config for tests
process.env.NODE_ENV = 'test';
const testConfig = require('../config/test');
const originalConfig = require('../config');

// Replace the config module with test config
Object.keys(testConfig).forEach(key => {
  if (originalConfig[key] && typeof originalConfig[key] === 'object') {
    Object.assign(originalConfig[key], testConfig[key]);
  } else {
    originalConfig[key] = testConfig[key];
  }
});

// Setup before all tests
beforeAll(async () => {
  // Clean database before starting tests
  await cleanDatabase();
});

// Cleanup after all tests
afterAll(async () => {
  await cleanDatabase();
  await closeDatabase();
});

// Global test timeout
jest.setTimeout(30000);
