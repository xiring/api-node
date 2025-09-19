const redisConfig = require('../config/redis');
const { AppError } = require('../errors');

class CacheService {
  constructor() {
    this.redis = null;
    this.defaultTTL = 3600; // 1 hour in seconds
    this.prefix = process.env.CACHE_PREFIX || 'ecommerce_api';
  }

  async initialize() {
    try {
      this.redis = await redisConfig.connect();
      console.log('Cache service initialized');
    } catch (error) {
      console.error('Failed to initialize cache service:', error.message);
      throw error;
    }
  }

  getRedis() {
    if (!this.redis) {
      throw new AppError('Cache service not initialized', 500);
    }
    return this.redis;
  }

  // Generate cache key with prefix
  generateKey(key) {
    return `${this.prefix}:${key}`;
  }

  // Set cache with TTL
  async set(key, value, ttl = this.defaultTTL) {
    try {
      const redis = this.getRedis();
      const cacheKey = this.generateKey(key);
      
      const serializedValue = JSON.stringify({
        data: value,
        timestamp: Date.now(),
        ttl: ttl
      });

      await redis.setex(cacheKey, ttl, serializedValue);
      return true;
    } catch (error) {
      console.error('Cache set error:', error.message);
      return false;
    }
  }

  // Get cache value
  async get(key) {
    try {
      const redis = this.getRedis();
      const cacheKey = this.generateKey(key);
      
      const cached = await redis.get(cacheKey);
      if (!cached) {
        return null;
      }

      const parsed = JSON.parse(cached);
      return parsed.data;
    } catch (error) {
      console.error('Cache get error:', error.message);
      return null;
    }
  }

  // Get cache with metadata
  async getWithMetadata(key) {
    try {
      const redis = this.getRedis();
      const cacheKey = this.generateKey(key);
      
      const cached = await redis.get(cacheKey);
      if (!cached) {
        return null;
      }

      return JSON.parse(cached);
    } catch (error) {
      console.error('Cache get metadata error:', error.message);
      return null;
    }
  }

  // Delete cache
  async delete(key) {
    try {
      const redis = this.getRedis();
      const cacheKey = this.generateKey(key);
      
      const result = await redis.del(cacheKey);
      return result > 0;
    } catch (error) {
      console.error('Cache delete error:', error.message);
      return false;
    }
  }

  // Delete multiple keys
  async deleteMany(keys) {
    try {
      const redis = this.getRedis();
      const cacheKeys = keys.map(key => this.generateKey(key));
      
      const result = await redis.del(...cacheKeys);
      return result;
    } catch (error) {
      console.error('Cache delete many error:', error.message);
      return 0;
    }
  }

  // Check if key exists
  async exists(key) {
    try {
      const redis = this.getRedis();
      const cacheKey = this.generateKey(key);
      
      const result = await redis.exists(cacheKey);
      return result === 1;
    } catch (error) {
      console.error('Cache exists error:', error.message);
      return false;
    }
  }

  // Set cache with expiration
  async setex(key, value, ttl) {
    return this.set(key, value, ttl);
  }

  // Increment counter
  async incr(key, ttl = this.defaultTTL) {
    try {
      const redis = this.getRedis();
      const cacheKey = this.generateKey(key);
      
      const result = await redis.incr(cacheKey);
      if (result === 1) {
        await redis.expire(cacheKey, ttl);
      }
      return result;
    } catch (error) {
      console.error('Cache incr error:', error.message);
      return 0;
    }
  }

  // Decrement counter
  async decr(key) {
    try {
      const redis = this.getRedis();
      const cacheKey = this.generateKey(key);
      
      const result = await redis.decr(cacheKey);
      return result;
    } catch (error) {
      console.error('Cache decr error:', error.message);
      return 0;
    }
  }

  // Get or set cache (cache-aside pattern)
  async getOrSet(key, fetchFunction, ttl = this.defaultTTL) {
    try {
      // Try to get from cache first
      let cached = await this.get(key);
      if (cached !== null) {
        return cached;
      }

      // If not in cache, fetch from source
      const data = await fetchFunction();
      
      // Store in cache
      await this.set(key, data, ttl);
      
      return data;
    } catch (error) {
      console.error('Cache getOrSet error:', error.message);
      // If cache fails, try to fetch from source
      try {
        return await fetchFunction();
      } catch (fetchError) {
        throw fetchError;
      }
    }
  }

  // Clear all cache with prefix
  async clearAll() {
    try {
      const redis = this.getRedis();
      const pattern = `${this.prefix}:*`;
      
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
      
      return keys.length;
    } catch (error) {
      console.error('Cache clear all error:', error.message);
      return 0;
    }
  }

  // Get cache statistics
  async getStats() {
    try {
      const redis = this.getRedis();
      const pattern = `${this.prefix}:*`;
      
      const keys = await redis.keys(pattern);
      const info = await redis.info('memory');
      
      return {
        totalKeys: keys.length,
        memoryInfo: info,
        prefix: this.prefix,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Cache stats error:', error.message);
      return {
        totalKeys: 0,
        memoryInfo: null,
        prefix: this.prefix,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Set hash field
  async hset(key, field, value, ttl = this.defaultTTL) {
    try {
      const redis = this.getRedis();
      const cacheKey = this.generateKey(key);
      
      await redis.hset(cacheKey, field, JSON.stringify(value));
      await redis.expire(cacheKey, ttl);
      
      return true;
    } catch (error) {
      console.error('Cache hset error:', error.message);
      return false;
    }
  }

  // Get hash field
  async hget(key, field) {
    try {
      const redis = this.getRedis();
      const cacheKey = this.generateKey(key);
      
      const value = await redis.hget(cacheKey, field);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Cache hget error:', error.message);
      return null;
    }
  }

  // Get all hash fields
  async hgetall(key) {
    try {
      const redis = this.getRedis();
      const cacheKey = this.generateKey(key);
      
      const hash = await redis.hgetall(cacheKey);
      const result = {};
      
      for (const [field, value] of Object.entries(hash)) {
        result[field] = JSON.parse(value);
      }
      
      return result;
    } catch (error) {
      console.error('Cache hgetall error:', error.message);
      return {};
    }
  }

  // Delete hash field
  async hdel(key, field) {
    try {
      const redis = this.getRedis();
      const cacheKey = this.generateKey(key);
      
      const result = await redis.hdel(cacheKey, field);
      return result > 0;
    } catch (error) {
      console.error('Cache hdel error:', error.message);
      return false;
    }
  }

  // Set with tags for easy invalidation
  async setWithTags(key, value, tags = [], ttl = this.defaultTTL) {
    try {
      // Set the main cache
      await this.set(key, value, ttl);
      
      // Set tag references
      for (const tag of tags) {
        const tagKey = `tags:${tag}`;
        await redis.sadd(this.generateKey(tagKey), key);
        await redis.expire(this.generateKey(tagKey), ttl);
      }
      
      return true;
    } catch (error) {
      console.error('Cache setWithTags error:', error.message);
      return false;
    }
  }

  // Invalidate by tags
  async invalidateByTags(tags) {
    try {
      const redis = this.getRedis();
      let totalDeleted = 0;
      
      for (const tag of tags) {
        const tagKey = this.generateKey(`tags:${tag}`);
        const keys = await redis.smembers(tagKey);
        
        if (keys.length > 0) {
          const cacheKeys = keys.map(key => this.generateKey(key));
          const deleted = await redis.del(...cacheKeys);
          totalDeleted += deleted;
        }
        
        // Clean up tag set
        await redis.del(tagKey);
      }
      
      return totalDeleted;
    } catch (error) {
      console.error('Cache invalidateByTags error:', error.message);
      return 0;
    }
  }
}

module.exports = new CacheService();
