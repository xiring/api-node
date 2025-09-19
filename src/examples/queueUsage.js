/**
 * Example usage of the Queue and Cache system
 * This file demonstrates how to use the implemented queue and caching features
 */

const QueueService = require('../services/QueueService');
const CacheService = require('../services/CacheService');
const EmailService = require('../services/EmailService');

class QueueUsageExamples {
  
  // Example 1: Send welcome email when user registers
  static async sendWelcomeEmailExample() {
    const user = {
      id: 'user123',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'USER'
    };

    try {
      // Add job to email queue
      const job = await QueueService.addWelcomeEmailJob(user, {
        priority: 1,
        delay: 0, // Send immediately
        attempts: 3
      });

      console.log('Welcome email job added:', job.id);
      return job;
    } catch (error) {
      console.error('Failed to add welcome email job:', error.message);
    }
  }

  // Example 2: Send order confirmation email
  static async sendOrderConfirmationExample() {
    const user = {
      id: 'user123',
      name: 'John Doe',
      email: 'john@example.com'
    };

    const order = {
      id: 'order456',
      orderNumber: 'ORD-2024-001',
      status: 'CONFIRMED',
      deliveryCity: 'Kathmandu',
      totalAmount: 150.00
    };

    try {
      const job = await QueueService.addOrderConfirmationEmailJob(user, order, {
        priority: 2,
        delay: 5000, // Send after 5 seconds
        attempts: 3
      });

      console.log('Order confirmation email job added:', job.id);
      return job;
    } catch (error) {
      console.error('Failed to add order confirmation email job:', error.message);
    }
  }

  // Example 3: Cache data with tags for easy invalidation
  static async cacheDataExample() {
    try {
      // Cache user data with tags
      const userData = {
        id: 'user123',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'USER'
      };

      await CacheService.setWithTags('user:123', userData, ['users', 'user:123'], 3600);
      console.log('User data cached with tags');

      // Cache warehouse data
      const warehouseData = [
        { id: 'wh1', name: 'Warehouse 1', city: 'Kathmandu' },
        { id: 'wh2', name: 'Warehouse 2', city: 'Pokhara' }
      ];

      await CacheService.setWithTags('warehouses:all', warehouseData, ['warehouses'], 1800);
      console.log('Warehouse data cached with tags');

      // Get cached data
      const cachedUser = await CacheService.get('user:123');
      console.log('Cached user:', cachedUser);

      // Invalidate cache by tags
      const deletedCount = await CacheService.invalidateByTags(['warehouses']);
      console.log(`Invalidated ${deletedCount} cache entries for warehouses tag`);

    } catch (error) {
      console.error('Cache example failed:', error.message);
    }
  }

  // Example 4: Cache with automatic invalidation
  static async cacheWithInvalidationExample() {
    try {
      // Cache warehouse list
      await CacheService.set('warehouses:list', [
        { id: 'wh1', name: 'Warehouse 1' },
        { id: 'wh2', name: 'Warehouse 2' }
      ], 1800);

      console.log('Warehouse list cached');

      // Simulate warehouse creation (this would invalidate cache)
      const newWarehouse = { id: 'wh3', name: 'Warehouse 3' };
      
      // Add cache invalidation job
      await QueueService.addCacheInvalidationJob(['warehouses:list'], ['warehouses'], {
        priority: 1,
        delay: 1000
      });

      console.log('Cache invalidation job added');

    } catch (error) {
      console.error('Cache invalidation example failed:', error.message);
    }
  }

  // Example 5: Warm cache with background job
  static async warmCacheExample() {
    try {
      // Define a function to fetch data
      const fetchWarehouses = async () => {
        console.log('Fetching warehouses from database...');
        // Simulate database call
        return [
          { id: 'wh1', name: 'Warehouse 1', city: 'Kathmandu' },
          { id: 'wh2', name: 'Warehouse 2', city: 'Pokhara' }
        ];
      };

      // Add cache warm job
      const job = await QueueService.addCacheWarmJob('warehouses:all', fetchWarehouses, 3600, {
        priority: 3,
        delay: 0
      });

      console.log('Cache warm job added:', job.id);

    } catch (error) {
      console.error('Cache warm example failed:', error.message);
    }
  }

  // Example 6: Send admin notification
  static async sendAdminNotificationExample() {
    try {
      const adminEmails = ['admin1@example.com', 'admin2@example.com'];
      const subject = 'System Alert';
      const message = 'High memory usage detected';
      const data = {
        memoryUsage: '85%',
        timestamp: new Date().toISOString(),
        server: 'web-01'
      };

      const job = await QueueService.addAdminNotificationEmailJob(
        adminEmails, 
        subject, 
        message, 
        data,
        {
          priority: 1,
          delay: 0,
          attempts: 2
        }
      );

      console.log('Admin notification job added:', job.id);

    } catch (error) {
      console.error('Admin notification example failed:', error.message);
    }
  }

  // Example 7: Monitor queue statistics
  static async monitorQueuesExample() {
    try {
      // Get all queue statistics
      const stats = await QueueService.getAllQueueStats();
      console.log('Queue Statistics:', JSON.stringify(stats, null, 2));

      // Get specific queue stats
      const emailStats = await QueueService.getQueueStats('email');
      console.log('Email Queue Stats:', emailStats);

    } catch (error) {
      console.error('Queue monitoring example failed:', error.message);
    }
  }

  // Example 8: Handle failed jobs
  static async handleFailedJobsExample() {
    try {
      // Get failed jobs from email queue
      const emailQueue = QueueService.queues.get('email');
      const failedJobs = await emailQueue.getFailed();

      console.log(`Found ${failedJobs.length} failed jobs`);

      // Retry first failed job
      if (failedJobs.length > 0) {
        const job = failedJobs[0];
        console.log(`Retrying job ${job.id}:`, job.failedReason);
        
        await QueueService.retryJob('email', job.id);
        console.log('Job retried successfully');
      }

    } catch (error) {
      console.error('Failed job handling example failed:', error.message);
    }
  }

  // Example 9: Cache with conditional logic
  static async conditionalCacheExample() {
    try {
      // Cache only for specific conditions
      const shouldCache = (req) => {
        return req.query.cache === 'true' && req.user && req.user.role === 'ADMIN';
      };

      // This would be used in middleware
      console.log('Conditional cache logic defined');

    } catch (error) {
      console.error('Conditional cache example failed:', error.message);
    }
  }

  // Example 10: Complete workflow
  static async completeWorkflowExample() {
    try {
      console.log('=== Complete Workflow Example ===');

      // 1. Cache initial data
      await CacheService.set('system:status', { status: 'running', uptime: 3600 }, 300);
      console.log('1. System status cached');

      // 2. Send welcome email
      const user = { id: 'user123', name: 'John Doe', email: 'john@example.com' };
      await QueueService.addWelcomeEmailJob(user);
      console.log('2. Welcome email queued');

      // 3. Send order confirmation
      const order = { id: 'order456', orderNumber: 'ORD-001', totalAmount: 100 };
      await QueueService.addOrderConfirmationEmailJob(user, order);
      console.log('3. Order confirmation queued');

      // 4. Monitor queues
      const stats = await QueueService.getAllQueueStats();
      console.log('4. Queue stats:', stats);

      // 5. Clean up old cache
      await QueueService.addCacheClearJob('system:*');
      console.log('5. Cache cleanup queued');

      console.log('=== Workflow Complete ===');

    } catch (error) {
      console.error('Complete workflow example failed:', error.message);
    }
  }
}

// Export for use in other files
module.exports = QueueUsageExamples;

// If running this file directly, run examples
if (require.main === module) {
  async function runExamples() {
    console.log('Running Queue and Cache Examples...\n');

    try {
      // Initialize services
      await QueueService.initialize();
      await CacheService.initialize();
      await EmailService.initialize();

      // Run examples
      await QueueUsageExamples.cacheDataExample();
      await QueueUsageExamples.sendWelcomeEmailExample();
      await QueueUsageExamples.sendOrderConfirmationExample();
      await QueueUsageExamples.warmCacheExample();
      await QueueUsageExamples.monitorQueuesExample();
      await QueueUsageExamples.completeWorkflowExample();

      console.log('\nAll examples completed successfully!');

    } catch (error) {
      console.error('Examples failed:', error.message);
    } finally {
      // Cleanup
      await QueueService.shutdown();
    }
  }

  runExamples();
}
