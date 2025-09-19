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
  // Mock CacheService with in-memory store for tests (avoids Redis dependency)
  const CacheService = require('../services/CacheService');
  const inMemory = new Map();
  CacheService.set = async (key, value, ttlSeconds = 0) => {
    const expiresAt = ttlSeconds > 0 ? Date.now() + ttlSeconds * 1000 : 0;
    inMemory.set(key, { value, expiresAt });
    return true;
  };
  CacheService.get = async (key) => {
    const entry = inMemory.get(key);
    if (!entry) return null;
    if (entry.expiresAt && entry.expiresAt > 0 && Date.now() > entry.expiresAt) {
      inMemory.delete(key);
      return null;
    }
    return entry.value;
  };
  CacheService.getWithMetadata = async (key) => {
    const entry = inMemory.get(key);
    if (!entry) return null;
    return { data: entry.value, ttl: entry.expiresAt ? Math.max(0, entry.expiresAt - Date.now()) / 1000 : null };
  };
  CacheService.delete = async (key) => {
    return inMemory.delete(key);
  };
  CacheService.clearAll = async () => {
    const count = inMemory.size;
    inMemory.clear();
    return count;
  };
});

// Cleanup after all tests
afterAll(async () => {
  await cleanDatabase();
  await closeDatabase();
});

// Global test timeout
jest.setTimeout(30000);
