const express = require('express');
const QueueService = require('../services/QueueService');
const CacheService = require('../services/CacheService');
const EmailService = require('../services/EmailService');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { BadRequestError } = require('../errors');

const router = express.Router();

// Queue health check
router.get('/health', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const queueHealth = await QueueService.healthCheck();
    const cacheHealth = await CacheService.getStats();
    const emailHealth = await EmailService.healthCheck();
    
    res.json({
      success: true,
      data: {
        queue: queueHealth,
        cache: cacheHealth,
        email: emailHealth,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Queue health check failed',
      message: error.message
    });
  }
});

// Get queue statistics
router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const stats = await QueueService.getAllQueueStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get queue statistics',
      message: error.message
    });
  }
});

// Get specific queue statistics
router.get('/stats/:queueName', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { queueName } = req.params;
    const stats = await QueueService.getQueueStats(queueName);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'Failed to get queue statistics',
      message: error.message
    });
  }
});

// Pause queue
router.post('/:queueName/pause', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { queueName } = req.params;
    const result = await QueueService.pauseQueue(queueName);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'Failed to pause queue',
      message: error.message
    });
  }
});

// Resume queue
router.post('/:queueName/resume', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { queueName } = req.params;
    const result = await QueueService.resumeQueue(queueName);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'Failed to resume queue',
      message: error.message
    });
  }
});

// Clean queue
router.post('/:queueName/clean', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { queueName } = req.params;
    const { grace = 0 } = req.body;
    
    const result = await QueueService.cleanQueue(queueName, grace);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'Failed to clean queue',
      message: error.message
    });
  }
});

// Get job by ID
router.get('/:queueName/jobs/:jobId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { queueName, jobId } = req.params;
    const job = await QueueService.getJob(queueName, jobId);
    
    res.json({
      success: true,
      data: {
        id: job.id,
        name: job.name,
        data: job.data,
        progress: job.progress(),
        returnvalue: job.returnvalue,
        failedReason: job.failedReason,
        processedOn: job.processedOn,
        finishedOn: job.finishedOn,
        timestamp: job.timestamp,
        attemptsMade: job.attemptsMade,
        opts: job.opts
      }
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      error: 'Job not found',
      message: error.message
    });
  }
});

// Retry failed job
router.post('/:queueName/jobs/:jobId/retry', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { queueName, jobId } = req.params;
    const result = await QueueService.retryJob(queueName, jobId);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'Failed to retry job',
      message: error.message
    });
  }
});

// Remove job
router.delete('/:queueName/jobs/:jobId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { queueName, jobId } = req.params;
    const result = await QueueService.removeJob(queueName, jobId);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'Failed to remove job',
      message: error.message
    });
  }
});

// Add email job
router.post('/email/welcome', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { user, options = {} } = req.body;
    
    if (!user || !user.email) {
      throw new BadRequestError('User data with email is required');
    }
    
    const job = await QueueService.addWelcomeEmailJob(user, options);
    
    res.json({
      success: true,
      data: {
        jobId: job.id,
        message: 'Welcome email job added to queue'
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'Failed to add welcome email job',
      message: error.message
    });
  }
});

// Add password reset email job
router.post('/email/password-reset', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { user, resetToken, options = {} } = req.body;
    
    if (!user || !user.email || !resetToken) {
      throw new BadRequestError('User data, email, and reset token are required');
    }
    
    const job = await QueueService.addPasswordResetEmailJob(user, resetToken, options);
    
    res.json({
      success: true,
      data: {
        jobId: job.id,
        message: 'Password reset email job added to queue'
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'Failed to add password reset email job',
      message: error.message
    });
  }
});

// Add order confirmation email job
router.post('/email/order-confirmation', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { user, order, options = {} } = req.body;
    
    if (!user || !user.email || !order) {
      throw new BadRequestError('User data, email, and order are required');
    }
    
    const job = await QueueService.addOrderConfirmationEmailJob(user, order, options);
    
    res.json({
      success: true,
      data: {
        jobId: job.id,
        message: 'Order confirmation email job added to queue'
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'Failed to add order confirmation email job',
      message: error.message
    });
  }
});

// Add shipment notification email job
router.post('/email/shipment-notification', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { user, shipment, options = {} } = req.body;
    
    if (!user || !user.email || !shipment) {
      throw new BadRequestError('User data, email, and shipment are required');
    }
    
    const job = await QueueService.addShipmentNotificationEmailJob(user, shipment, options);
    
    res.json({
      success: true,
      data: {
        jobId: job.id,
        message: 'Shipment notification email job added to queue'
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'Failed to add shipment notification email job',
      message: error.message
    });
  }
});

// Add admin notification email job
router.post('/email/admin-notification', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { adminEmails, subject, message, data = {}, options = {} } = req.body;
    
    if (!adminEmails || !subject || !message) {
      throw new BadRequestError('Admin emails, subject, and message are required');
    }
    
    const job = await QueueService.addAdminNotificationEmailJob(adminEmails, subject, message, data, options);
    
    res.json({
      success: true,
      data: {
        jobId: job.id,
        message: 'Admin notification email job added to queue'
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'Failed to add admin notification email job',
      message: error.message
    });
  }
});

// Add cache invalidation job
router.post('/cache/invalidate', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { keys = [], tags = [], options = {} } = req.body;
    
    const job = await QueueService.addCacheInvalidationJob(keys, tags, options);
    
    res.json({
      success: true,
      data: {
        jobId: job.id,
        message: 'Cache invalidation job added to queue'
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'Failed to add cache invalidation job',
      message: error.message
    });
  }
});

// Add cache warm job
router.post('/cache/warm', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { key, fetchFunction, ttl = 3600, options = {} } = req.body;
    
    if (!key || !fetchFunction) {
      throw new BadRequestError('Cache key and fetch function are required');
    }
    
    const job = await QueueService.addCacheWarmJob(key, fetchFunction, ttl, options);
    
    res.json({
      success: true,
      data: {
        jobId: job.id,
        message: 'Cache warm job added to queue'
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'Failed to add cache warm job',
      message: error.message
    });
  }
});

// Add cache clear job
router.post('/cache/clear', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { pattern = null, options = {} } = req.body;
    
    const job = await QueueService.addCacheClearJob(pattern, options);
    
    res.json({
      success: true,
      data: {
        jobId: job.id,
        message: 'Cache clear job added to queue'
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'Failed to add cache clear job',
      message: error.message
    });
  }
});

// Add notification job
router.post('/notification', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { type, data, options = {} } = req.body;
    
    if (!type || !data) {
      throw new BadRequestError('Notification type and data are required');
    }
    
    const job = await QueueService.addNotificationJob(type, data, options);
    
    res.json({
      success: true,
      data: {
        jobId: job.id,
        message: 'Notification job added to queue'
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'Failed to add notification job',
      message: error.message
    });
  }
});

module.exports = router;
