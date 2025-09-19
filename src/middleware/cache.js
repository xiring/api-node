const CacheService = require('../services/CacheService');
const config = require('../config');

class CacheMiddleware {
  // Cache GET requests
  static cache(ttl = 3600, keyGenerator = null) {
    return async (req, res, next) => {
      // Only cache GET requests and if caching is enabled
      if (req.method !== 'GET' || !config.cache.enabled) {
        return next();
      }

      try {
        // Generate cache key
        const cacheKey = keyGenerator ? keyGenerator(req) : this.generateDefaultKey(req);
        
        // Try to get from cache
        const cached = await CacheService.get(cacheKey);
        
        if (cached !== null) {
          // Set cache headers
          res.set('X-Cache', 'HIT');
          res.set('X-Cache-Key', cacheKey);
          
          return res.json(cached);
        }

        // Store original res.json
        const originalJson = res.json.bind(res);
        
        // Override res.json to cache the response
        res.json = (data) => {
          // Cache the response
          CacheService.set(cacheKey, data, ttl).catch(error => {
            console.error('Cache set error:', error.message);
          });
          
          // Set cache headers
          res.set('X-Cache', 'MISS');
          res.set('X-Cache-Key', cacheKey);
          
          // Call original json method
          return originalJson(data);
        };

        next();
      } catch (error) {
        console.error('Cache middleware error:', error.message);
        next();
      }
    };
  }

  // Cache with tags for easy invalidation
  static cacheWithTags(tags = [], ttl = 3600, keyGenerator = null) {
    return async (req, res, next) => {
      if (req.method !== 'GET' || !config.cache.enabled) {
        return next();
      }

      try {
        const cacheKey = keyGenerator ? keyGenerator(req) : this.generateDefaultKey(req);
        
        const cached = await CacheService.get(cacheKey);
        
        if (cached !== null) {
          res.set('X-Cache', 'HIT');
          res.set('X-Cache-Key', cacheKey);
          return res.json(cached);
        }

        const originalJson = res.json.bind(res);
        
        res.json = (data) => {
          // Cache with tags
          CacheService.setWithTags(cacheKey, data, tags, ttl).catch(error => {
            console.error('Cache set with tags error:', error.message);
          });
          
          res.set('X-Cache', 'MISS');
          res.set('X-Cache-Key', cacheKey);
          res.set('X-Cache-Tags', tags.join(','));
          
          return originalJson(data);
        };

        next();
      } catch (error) {
        console.error('Cache with tags middleware error:', error.message);
        next();
      }
    };
  }

  // Invalidate cache by tags
  static invalidateByTags(tags = []) {
    return async (req, res, next) => {
      if (!config.cache.enabled) {
        return next();
      }

      try {
        // Invalidate cache after response
        const originalJson = res.json.bind(res);
        
        res.json = (data) => {
          // Invalidate cache asynchronously
          CacheService.invalidateByTags(tags).then(deleted => {
            console.log(`Cache invalidated: ${deleted} keys deleted for tags: ${tags.join(', ')}`);
          }).catch(error => {
            console.error('Cache invalidation error:', error.message);
          });
          
          return originalJson(data);
        };

        next();
      } catch (error) {
        console.error('Cache invalidation middleware error:', error.message);
        next();
      }
    };
  }

  // Invalidate specific cache keys
  static invalidateKeys(keyGenerator = null) {
    return async (req, res, next) => {
      try {
        const originalJson = res.json.bind(res);
        
        res.json = (data) => {
          // Generate keys to invalidate
          const keys = keyGenerator ? keyGenerator(req) : [this.generateDefaultKey(req)];
          
          // Invalidate cache asynchronously
          CacheService.deleteMany(keys).then(deleted => {
            console.log(`Cache invalidated: ${deleted} keys deleted`);
          }).catch(error => {
            console.error('Cache invalidation error:', error.message);
          });
          
          return originalJson(data);
        };

        next();
      } catch (error) {
        console.error('Cache invalidation middleware error:', error.message);
        next();
      }
    };
  }

  // Cache user-specific data
  static cacheUserData(ttl = 1800) {
    return async (req, res, next) => {
      if (req.method !== 'GET' || !req.user) {
        return next();
      }

      try {
        const cacheKey = `user:${req.user.id}:${this.generateDefaultKey(req)}`;
        
        const cached = await CacheService.get(cacheKey);
        
        if (cached !== null) {
          res.set('X-Cache', 'HIT');
          res.set('X-Cache-Key', cacheKey);
          return res.json(cached);
        }

        const originalJson = res.json.bind(res);
        
        res.json = (data) => {
          CacheService.set(cacheKey, data, ttl).catch(error => {
            console.error('User cache set error:', error.message);
          });
          
          res.set('X-Cache', 'MISS');
          res.set('X-Cache-Key', cacheKey);
          
          return originalJson(data);
        };

        next();
      } catch (error) {
        console.error('User cache middleware error:', error.message);
        next();
      }
    };
  }

  // Generate default cache key
  static generateDefaultKey(req) {
    const { method, originalUrl, query, user } = req;
    
    // Create a hash of the request
    const keyData = {
      method,
      url: originalUrl,
      query: JSON.stringify(query),
      user: user ? user.id : null
    };
    
    // Simple hash function
    const keyString = JSON.stringify(keyData);
    let hash = 0;
    
    for (let i = 0; i < keyString.length; i++) {
      const char = keyString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return `req:${Math.abs(hash)}`;
  }

  // Generate cache key for specific routes
  static generateRouteKey(routePattern) {
    return (req) => {
      const { method, originalUrl, query, user } = req;
      
      // Extract route parameters
      const routeParams = this.extractRouteParams(routePattern, originalUrl);
      
      const keyData = {
        method,
        route: routePattern,
        params: routeParams,
        query: JSON.stringify(query),
        user: user ? user.id : null
      };
      
      const keyString = JSON.stringify(keyData);
      let hash = 0;
      
      for (let i = 0; i < keyString.length; i++) {
        const char = keyString.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      
      return `route:${routePattern}:${Math.abs(hash)}`;
    };
  }

  // Extract route parameters from URL
  static extractRouteParams(pattern, url) {
    const patternParts = pattern.split('/');
    const urlParts = url.split('/');
    const params = {};
    
    for (let i = 0; i < patternParts.length; i++) {
      const patternPart = patternParts[i];
      const urlPart = urlParts[i];
      
      if (patternPart.startsWith(':')) {
        const paramName = patternPart.substring(1);
        params[paramName] = urlPart;
      }
    }
    
    return params;
  }

  // Cache with conditional logic
  static conditionalCache(condition, ttl = 3600) {
    return async (req, res, next) => {
      if (req.method !== 'GET' || !condition(req)) {
        return next();
      }

      return this.cache(ttl)(req, res, next);
    };
  }

  // Cache with custom key generator
  static customCache(keyGenerator, ttl = 3600) {
    return async (req, res, next) => {
      if (req.method !== 'GET') {
        return next();
      }

      try {
        const cacheKey = keyGenerator(req);
        
        if (!cacheKey) {
          return next();
        }

        const cached = await CacheService.get(cacheKey);
        
        if (cached !== null) {
          res.set('X-Cache', 'HIT');
          res.set('X-Cache-Key', cacheKey);
          return res.json(cached);
        }

        const originalJson = res.json.bind(res);
        
        res.json = (data) => {
          CacheService.set(cacheKey, data, ttl).catch(error => {
            console.error('Custom cache set error:', error.message);
          });
          
          res.set('X-Cache', 'MISS');
          res.set('X-Cache-Key', cacheKey);
          
          return originalJson(data);
        };

        next();
      } catch (error) {
        console.error('Custom cache middleware error:', error.message);
        next();
      }
    };
  }
}

module.exports = CacheMiddleware;
