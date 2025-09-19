const Queue = require('bull');
const redisConfig = require('../config/redis');
const EmailService = require('./EmailService');
const CacheService = require('./CacheService');
const { AppError } = require('../errors');

class QueueService {
  constructor() {
    this.queues = new Map();
    this.isInitialized = false;
  }

  async initialize() {
    try {
      // Initialize Redis connection
      await redisConfig.connect();
      
      // Create queues
      this.createEmailQueue();
      this.createCacheQueue();
      this.createNotificationQueue();
      
      this.isInitialized = true;
      console.log('✅ Queue service initialized successfully');
    } catch (error) {
      console.error('❌ Queue service initialization failed:', error.message);
      throw error;
    }
  }

  createEmailQueue() {
    const emailQueue = new Queue('email processing', {
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD || undefined,
        db: process.env.REDIS_DB || 0
      },
      defaultJobOptions: {
        removeOnComplete: 10,
        removeOnFail: 5,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000
        }
      }
    });

    // Process email jobs
    emailQueue.process('send-welcome-email', async (job) => {
      const { user } = job.data;
      return await EmailService.sendWelcomeEmail(user);
    });

    emailQueue.process('send-password-reset-email', async (job) => {
      const { user, resetToken } = job.data;
      return await EmailService.sendPasswordResetEmail(user, resetToken);
    });

    emailQueue.process('send-order-confirmation-email', async (job) => {
      const { user, order } = job.data;
      return await EmailService.sendOrderConfirmationEmail(user, order);
    });

    emailQueue.process('send-shipment-notification-email', async (job) => {
      const { user, shipment } = job.data;
      return await EmailService.sendShipmentNotificationEmail(user, shipment);
    });

    emailQueue.process('send-admin-notification-email', async (job) => {
      const { adminEmails, subject, message, data } = job.data;
      return await EmailService.sendAdminNotificationEmail(adminEmails, subject, message, data);
    });

    // Queue event handlers
    emailQueue.on('completed', (job, result) => {
      console.log(`📧 Email job ${job.id} completed:`, result.messageId);
    });

    emailQueue.on('failed', (job, err) => {
      console.error(`❌ Email job ${job.id} failed:`, err.message);
    });

    emailQueue.on('stalled', (job) => {
      console.warn(`⚠️ Email job ${job.id} stalled`);
    });

    this.queues.set('email', emailQueue);
  }

  createCacheQueue() {
    const cacheQueue = new Queue('cache processing', {
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD || undefined,
        db: process.env.REDIS_DB || 0
      },
      defaultJobOptions: {
        removeOnComplete: 20,
        removeOnFail: 10,
        attempts: 2,
        backoff: {
          type: 'fixed',
          delay: 1000
        }
      }
    });

    // Process cache jobs
    cacheQueue.process('invalidate-cache', async (job) => {
      const { keys, tags } = job.data;
      
      if (keys && keys.length > 0) {
        await CacheService.deleteMany(keys);
      }
      
      if (tags && tags.length > 0) {
        await CacheService.invalidateByTags(tags);
      }
      
      return { success: true, keys, tags };
    });

    cacheQueue.process('warm-cache', async (job) => {
      const { key, fetchFunction, ttl } = job.data;
      return await CacheService.getOrSet(key, fetchFunction, ttl);
    });

    cacheQueue.process('clear-cache', async (job) => {
      const { pattern } = job.data;
      if (pattern) {
        // Clear specific pattern
        const keys = await CacheService.getRedis().keys(pattern);
        if (keys.length > 0) {
          await CacheService.deleteMany(keys);
        }
        return { cleared: keys.length };
      } else {
        // Clear all cache
        return await CacheService.clearAll();
      }
    });

    this.queues.set('cache', cacheQueue);
  }

  createNotificationQueue() {
    const notificationQueue = new Queue('notification processing', {
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD || undefined,
        db: process.env.REDIS_DB || 0
      },
      defaultJobOptions: {
        removeOnComplete: 15,
        removeOnFail: 8,
        attempts: 2,
        backoff: {
          type: 'exponential',
          delay: 3000
        }
      }
    });

    // Process notification jobs
    notificationQueue.process('send-notification', async (job) => {
      const { type, data } = job.data;
      
      switch (type) {
        case 'email':
          return await this.processEmailNotification(data);
        case 'sms':
          return await this.processSMSNotification(data);
        case 'push':
          return await this.processPushNotification(data);
        default:
          throw new Error(`Unknown notification type: ${type}`);
      }
    });

    this.queues.set('notification', notificationQueue);
  }

  async processEmailNotification(data) {
    const { template, recipients, variables } = data;
    
    // Process email template and send
    const emailData = {
      to: recipients,
      subject: variables.subject || 'Notification',
      html: this.processEmailTemplate(template, variables),
      text: variables.text || 'Notification'
    };
    
    return await EmailService.sendEmail(emailData);
  }

  async processSMSNotification(data) {
    // Placeholder for SMS processing
    console.log('SMS notification:', data);
    return { success: true, message: 'SMS notification processed' };
  }

  async processPushNotification(data) {
    // Placeholder for push notification processing
    console.log('Push notification:', data);
    return { success: true, message: 'Push notification processed' };
  }

  processEmailTemplate(template, variables) {
    let html = template;
    
    // Replace variables in template
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      html = html.replace(regex, value);
    }
    
    return html;
  }

  // Add job to queue
  async addJob(queueName, jobType, data, options = {}) {
    if (!this.isInitialized) {
      throw new AppError('Queue service not initialized', 500);
    }

    const queue = this.queues.get(queueName);
    if (!queue) {
      throw new AppError(`Queue ${queueName} not found`, 400);
    }

    const job = await queue.add(jobType, data, options);
    return job;
  }

  // Add email jobs
  async addWelcomeEmailJob(user, options = {}) {
    return this.addJob('email', 'send-welcome-email', { user }, options);
  }

  async addPasswordResetEmailJob(user, resetToken, options = {}) {
    return this.addJob('email', 'send-password-reset-email', { user, resetToken }, options);
  }

  async addOrderConfirmationEmailJob(user, order, options = {}) {
    return this.addJob('email', 'send-order-confirmation-email', { user, order }, options);
  }

  async addShipmentNotificationEmailJob(user, shipment, options = {}) {
    return this.addJob('email', 'send-shipment-notification-email', { user, shipment }, options);
  }

  async addAdminNotificationEmailJob(adminEmails, subject, message, data = {}, options = {}) {
    return this.addJob('email', 'send-admin-notification-email', { adminEmails, subject, message, data }, options);
  }

  // Add cache jobs
  async addCacheInvalidationJob(keys = [], tags = [], options = {}) {
    return this.addJob('cache', 'invalidate-cache', { keys, tags }, options);
  }

  async addCacheWarmJob(key, fetchFunction, ttl = 3600, options = {}) {
    return this.addJob('cache', 'warm-cache', { key, fetchFunction, ttl }, options);
  }

  async addCacheClearJob(pattern = null, options = {}) {
    return this.addJob('cache', 'clear-cache', { pattern }, options);
  }

  // Add notification jobs
  async addNotificationJob(type, data, options = {}) {
    return this.addJob('notification', 'send-notification', { type, data }, options);
  }

  // Get queue statistics
  async getQueueStats(queueName) {
    if (!this.isInitialized) {
      throw new AppError('Queue service not initialized', 500);
    }

    const queue = this.queues.get(queueName);
    if (!queue) {
      throw new AppError(`Queue ${queueName} not found`, 400);
    }

    const [waiting, active, completed, failed, delayed] = await Promise.all([
      queue.getWaiting(),
      queue.getActive(),
      queue.getCompleted(),
      queue.getFailed(),
      queue.getDelayed()
    ]);

    return {
      queueName,
      waiting: waiting.length,
      active: active.length,
      completed: completed.length,
      failed: failed.length,
      delayed: delayed.length,
      timestamp: new Date().toISOString()
    };
  }

  // Get all queue statistics
  async getAllQueueStats() {
    const stats = {};
    
    for (const [queueName] of this.queues) {
      stats[queueName] = await this.getQueueStats(queueName);
    }
    
    return stats;
  }

  // Pause queue
  async pauseQueue(queueName) {
    const queue = this.queues.get(queueName);
    if (!queue) {
      throw new AppError(`Queue ${queueName} not found`, 400);
    }
    
    await queue.pause();
    return { success: true, message: `Queue ${queueName} paused` };
  }

  // Resume queue
  async resumeQueue(queueName) {
    const queue = this.queues.get(queueName);
    if (!queue) {
      throw new AppError(`Queue ${queueName} not found`, 400);
    }
    
    await queue.resume();
    return { success: true, message: `Queue ${queueName} resumed` };
  }

  // Clean queue
  async cleanQueue(queueName, grace = 0) {
    const queue = this.queues.get(queueName);
    if (!queue) {
      throw new AppError(`Queue ${queueName} not found`, 400);
    }
    
    await queue.clean(grace);
    return { success: true, message: `Queue ${queueName} cleaned` };
  }

  // Get job by ID
  async getJob(queueName, jobId) {
    const queue = this.queues.get(queueName);
    if (!queue) {
      throw new AppError(`Queue ${queueName} not found`, 400);
    }
    
    const job = await queue.getJob(jobId);
    if (!job) {
      throw new AppError(`Job ${jobId} not found in queue ${queueName}`, 404);
    }
    
    return job;
  }

  // Retry failed job
  async retryJob(queueName, jobId) {
    const job = await this.getJob(queueName, jobId);
    await job.retry();
    return { success: true, message: `Job ${jobId} retried` };
  }

  // Remove job
  async removeJob(queueName, jobId) {
    const job = await this.getJob(queueName, jobId);
    await job.remove();
    return { success: true, message: `Job ${jobId} removed` };
  }

  // Health check
  async healthCheck() {
    try {
      if (!this.isInitialized) {
        return { status: 'not_initialized', message: 'Queue service not initialized' };
      }

      const stats = await this.getAllQueueStats();
      
      return {
        status: 'healthy',
        message: 'Queue service is working properly',
        queues: Object.keys(stats).length,
        stats,
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

  // Graceful shutdown
  async shutdown() {
    console.log('Shutting down queue service...');
    
    for (const [queueName, queue] of this.queues) {
      await queue.close();
      console.log(`Queue ${queueName} closed`);
    }
    
    await redisConfig.disconnect();
    this.isInitialized = false;
    console.log('Queue service shutdown complete');
  }
}

module.exports = new QueueService();
