const { cleanDatabase, closeDatabase } = require('../config/testDatabase');

// Setup before all tests
beforeAll(async () => {
  // Set test environment
  process.env.NODE_ENV = 'test';
  process.env.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || 'postgresql://postgres@localhost:5433/logistics_test_db';
  
  // Clean database before starting tests
  await cleanDatabase();
});

// Cleanup after all tests
afterAll(async () => {
  await cleanDatabase();
  await closeDatabase();
});

// Clean database before each test
beforeEach(async () => {
  await cleanDatabase();
});

// Global test timeout
jest.setTimeout(30000);
