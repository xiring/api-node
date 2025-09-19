const Redis = require('ioredis');

class RedisConfig {
  constructor() {
    this.redis = null;
    this.isConnected = false;
  }

  async connect() {
    try {
      this.redis = new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD || undefined,
        db: process.env.REDIS_DB || 0,
        retryDelayOnFailover: 100,
        maxRetriesPerRequest: 3,
        lazyConnect: true,
        keepAlive: 30000,
        connectTimeout: 10000,
        commandTimeout: 5000,
        retryDelayOnClusterDown: 300,
        enableOfflineQueue: false,
        maxLoadingTimeout: 5000,
        enableReadyCheck: true,
        maxMemoryPolicy: 'allkeys-lru'
      });

      this.redis.on('connect', () => {
        console.log('✅ Redis connected successfully');
        this.isConnected = true;
      });

      this.redis.on('error', (error) => {
        console.error('❌ Redis connection error:', error.message);
        this.isConnected = false;
      });

      this.redis.on('close', () => {
        console.log('🔌 Redis connection closed');
        this.isConnected = false;
      });

      this.redis.on('reconnecting', () => {
        console.log('🔄 Redis reconnecting...');
      });

      await this.redis.connect();
      return this.redis;
    } catch (error) {
      console.error('Failed to connect to Redis:', error.message);
      throw error;
    }
  }

  getClient() {
    if (!this.redis || !this.isConnected) {
      throw new Error('Redis client not connected');
    }
    return this.redis;
  }

  async disconnect() {
    if (this.redis) {
      await this.redis.disconnect();
      this.isConnected = false;
      console.log('Redis disconnected');
    }
  }

  async healthCheck() {
    try {
      if (!this.redis || !this.isConnected) {
        return { status: 'disconnected', message: 'Redis client not connected' };
      }

      const startTime = Date.now();
      await this.redis.ping();
      const responseTime = Date.now() - startTime;

      return {
        status: 'connected',
        responseTime: `${responseTime}ms`,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

const redisConfig = new RedisConfig();

module.exports = redisConfig;
