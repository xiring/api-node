const express = require('express');
const SecurityLogger = require('../utils/securityLogger');
const DatabaseOptimization = require('../utils/databaseOptimization');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { BadRequestError } = require('../errors');

const router = express.Router();

/**
 * @swagger
 * /security/health:
 *   get:
 *     summary: Security health check (DB + security metrics)
 *     tags: [Security]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Health status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     database:
 *                       type: object
 *                     security:
 *                       type: object
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *       500:
 *         description: Health check failed
 */
// Security health check endpoint
router.get('/health', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const dbHealth = await DatabaseOptimization.healthCheck();
    const securityMetrics = SecurityLogger.getSecurityMetrics('24h');
    
    res.json({
      success: true,
      data: {
        database: dbHealth,
        security: securityMetrics,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Security health check failed',
      message: error.message
    });
  }
});

/**
 * @swagger
 * /security/metrics:
 *   get:
 *     summary: Get aggregated security metrics
 *     tags: [Security]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: timeframe
 *         schema:
 *           type: string
 *           enum: ["1h","24h","7d","30d"]
 *         description: Metrics timeframe window
 *     responses:
 *       200:
 *         description: Metrics returned
 *       400:
 *         description: Invalid timeframe
 */
// Security metrics endpoint
router.get('/metrics', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { timeframe = '24h' } = req.query;
    
    if (!['1h', '24h', '7d', '30d'].includes(timeframe)) {
      throw new BadRequestError('Invalid timeframe. Must be one of: 1h, 24h, 7d, 30d');
    }
    
    const metrics = SecurityLogger.getSecurityMetrics(timeframe);
    
    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'Failed to get security metrics',
      message: error.message
    });
  }
});

/**
 * @swagger
 * /security/logs:
 *   get:
 *     summary: Get security/audit logs with filters and pagination
 *     tags: [Security]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [security, audit]
 *         description: Log type
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *       - in: query
 *         name: severity
 *         schema:
 *           type: string
 *         description: Filter by severity (e.g., INFO, WARN, ERROR)
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *     responses:
 *       200:
 *         description: Logs returned
 *       400:
 *         description: Validation error
 */
// Security logs endpoint (with pagination)
router.get('/logs', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { 
      type = 'security', 
      page = 1, 
      limit = 50,
      severity,
      startDate,
      endDate
    } = req.query;
    
    if (!['security', 'audit'].includes(type)) {
      throw new BadRequestError('Invalid log type. Must be "security" or "audit"');
    }
    
    const logFile = type === 'security' ? 'security.log' : 'audit.log';
    const logPath = require('path').join(__dirname, '../../logs', logFile);
    
    if (!require('fs').existsSync(logPath)) {
      return res.json({
        success: true,
        data: {
          logs: [],
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: 0,
            pages: 0
          }
        }
      });
    }
    
    const logs = require('fs').readFileSync(logPath, 'utf8')
      .split('\n')
      .filter(line => line.trim())
      .map(line => {
        try {
          return JSON.parse(line);
        } catch {
          return null;
        }
      })
      .filter(log => log && log.timestamp);
    
    // Filter by severity if provided
    let filteredLogs = logs;
    if (severity) {
      filteredLogs = logs.filter(log => log.severity === severity.toUpperCase());
    }
    
    // Filter by date range if provided
    if (startDate || endDate) {
      filteredLogs = filteredLogs.filter(log => {
        const logDate = new Date(log.timestamp);
        if (startDate && logDate < new Date(startDate)) return false;
        if (endDate && logDate > new Date(endDate)) return false;
        return true;
      });
    }
    
    // Sort by timestamp (newest first)
    filteredLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    const paginatedLogs = filteredLogs.slice(skip, skip + limitNum);
    
    res.json({
      success: true,
      data: {
        logs: paginatedLogs,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: filteredLogs.length,
          pages: Math.ceil(filteredLogs.length / limitNum)
        }
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'Failed to get security logs',
      message: error.message
    });
  }
});

/**
 * @swagger
 * /security/cleanup:
 *   post:
 *     summary: Cleanup old security/audit logs
 *     tags: [Security]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               daysToKeep:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 365
 *                 default: 30
 *     responses:
 *       200:
 *         description: Cleanup performed
 *       400:
 *         description: Validation error
 */
// Cleanup old logs endpoint
router.post('/cleanup', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { daysToKeep = 30 } = req.body;
    
    if (daysToKeep < 1 || daysToKeep > 365) {
      throw new BadRequestError('Days to keep must be between 1 and 365');
    }
    
    SecurityLogger.cleanupOldLogs(daysToKeep);
    
    res.json({
      success: true,
      message: `Cleaned up logs older than ${daysToKeep} days`
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'Failed to cleanup logs',
      message: error.message
    });
  }
});

/**
 * @swagger
 * /security/config:
 *   get:
 *     summary: Get security configuration snapshot
 *     tags: [Security]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Configuration returned
 *       500:
 *         description: Failed to fetch configuration
 */
// Security configuration endpoint
router.get('/config', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const config = {
      rateLimiting: {
        enabled: true,
        windowMs: process.env.RATE_LIMIT_WINDOW_MS || '900000', // 15 minutes
        maxRequests: process.env.RATE_LIMIT_MAX_REQUESTS || '100'
      },
      passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
        maxLength: 128
      },
      securityHeaders: {
        helmet: true,
        cors: true,
        csp: true,
        xssProtection: true,
        noSniff: true,
        frameOptions: 'DENY'
      },
      logging: {
        securityEvents: true,
        auditTrail: true,
        logRetentionDays: 30
      }
    };
    
    res.json({
      success: true,
      data: config
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get security configuration',
      message: error.message
    });
  }
});

module.exports = router;
