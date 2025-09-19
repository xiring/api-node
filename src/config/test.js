const config = require('./index');

// Test configuration overrides
const testConfig = {
  ...config,
  cache: {
    ...config.cache,
    enabled: false, // Disable caching in tests
    ttl: 0
  },
  redis: {
    ...config.redis,
    enabled: false // Disable Redis in tests
  },
  email: {
    ...config.email,
    enabled: false // Disable email in tests
  },
  queue: {
    ...config.queue,
    enabled: false // Disable queue in tests
  }
};

module.exports = testConfig;
