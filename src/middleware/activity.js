const SecurityLogger = require('../utils/securityLogger');
const ActivityLogService = require('../services/ActivityLogService');

class ActivityMiddleware {
  static requestActivityLogger(options = {}) {
    const defaultOptions = {
      redactFields: ['password', 'token', 'accessToken', 'refreshToken', 'authorization', 'secret', 'apiKey'],
      maxFieldLength: 500,
      maxBodySize: 2048
    };

    const settings = { ...defaultOptions, ...options };

    return (req, res, next) => {
      const startHrTime = process.hrtime();

      const redactObject = (obj) => {
        try {
          if (!obj || typeof obj !== 'object') return obj;

          const traverse = (value) => {
            if (Array.isArray(value)) {
              return value.map(traverse);
            }
            if (value && typeof value === 'object') {
              const out = {};
              for (const [key, val] of Object.entries(value)) {
                if (settings.redactFields.includes(key)) {
                  out[key] = '***REDACTED***';
                } else {
                  out[key] = traverse(val);
                }
              }
              return out;
            }
            if (typeof value === 'string') {
              return value.substring(0, settings.maxFieldLength);
            }
            return value;
          };

          const result = traverse(obj);
          const serialized = JSON.stringify(result);
          if (serialized.length > settings.maxBodySize) {
            return JSON.parse(serialized.substring(0, settings.maxBodySize));
          }
          return result;
        } catch {
          return undefined;
        }
      };

      res.on('finish', () => {
        try {
          const diff = process.hrtime(startHrTime);
          const durationMs = Math.round((diff[0] * 1e9 + diff[1]) / 1e6);

          const user = req.user || null;
          const details = {
            method: req.method,
            path: req.originalUrl,
            route: req.route?.path || null,
            statusCode: res.statusCode,
            durationMs,
            ip: req.ip || req.connection?.remoteAddress || 'unknown',
            userAgent: req.get('user-agent') || 'unknown',
            referer: req.get('referer') || undefined,
            query: redactObject(req.query),
            params: redactObject(req.params),
            body: redactObject(req.body)
          };

          SecurityLogger.logAuditEvent('HTTP_REQUEST', user, 'http', details);

          // Additionally log data-changing actions explicitly
          const method = req.method.toUpperCase();
          if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
            SecurityLogger.logDataAccess(user, req.originalUrl, `${method}_RESOURCE`, details);
          }

          // Persist to database (best effort, fire-and-forget)
          ActivityLogService.createActivityLog({ user, ...details });
        } catch (_) {
          // Best-effort logging; never throw from logger
        }
      });

      next();
    };
  }
}

module.exports = ActivityMiddleware;


