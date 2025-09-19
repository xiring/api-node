const CacheService = require('../services/CacheService');
const { AppError } = require('../errors');

// Simple idempotency middleware using Redis
// Stores response payload keyed by Idempotency-Key and route+method
function idempotency(ttlSeconds = 24 * 60 * 60) {
  return async (req, res, next) => {
    try {
      const key = req.get('Idempotency-Key') || req.get('X-Idempotency-Key');
      if (!key) return next();

      const cacheKey = `idemp:${req.method}:${req.originalUrl}:${key}`;
      const cached = await CacheService.get(cacheKey);
      if (cached) {
        res.setHeader('Idempotent-Replay', 'true');
        return res.status(cached.statusCode).json(cached.body);
      }

      // Wrap res.json to capture output
      const originalJson = res.json.bind(res);
      res.json = async (body) => {
        try {
          await CacheService.set(cacheKey, { statusCode: res.statusCode, body }, ttlSeconds);
        } catch (_) {}
        return originalJson(body);
      };

      return next();
    } catch (error) {
      return next(new AppError(`Idempotency middleware error: ${error.message}`, 500));
    }
  };
}

module.exports = { idempotency };


