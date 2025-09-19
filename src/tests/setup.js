const { cleanDatabase, closeDatabase } = require('../config/testDatabase');
require('./config/testConfig');

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
