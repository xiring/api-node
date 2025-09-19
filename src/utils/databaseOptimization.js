const { prisma } = require('../config/database');

class DatabaseOptimization {
  // Transaction with retry logic for deadlock prevention
  static async executeWithRetry(operation, maxRetries = 3, delay = 100) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        // Check if it's a deadlock or serialization failure
        if (this.isRetryableError(error)) {
          if (attempt < maxRetries) {
            // Exponential backoff with jitter
            const backoffDelay = delay * Math.pow(2, attempt - 1) + Math.random() * 100;
            await this.sleep(backoffDelay);
            continue;
          }
        }
        
        // If it's not retryable or we've exhausted retries, throw the error
        throw error;
      }
    }
    
    throw lastError;
  }

  // Check if error is retryable (deadlock, serialization failure, etc.)
  static isRetryableError(error) {
    if (!error) return false;
    
    const errorMessage = error.message?.toLowerCase() || '';
    const errorCode = error.code || '';
    
    // PostgreSQL specific retryable errors
    const retryableErrors = [
      'deadlock detected',
      'serialization failure',
      'could not serialize access',
      'lock timeout',
      'connection timeout',
      'connection reset',
      'connection refused',
      'timeout',
      'temporary failure'
    ];
    
    // Check error message
    for (const retryableError of retryableErrors) {
      if (errorMessage.includes(retryableError)) {
        return true;
      }
    }
    
    // Check error codes
    const retryableCodes = ['40001', '40P01', '55P03', '08006', '08003', '08001'];
    if (retryableCodes.includes(errorCode)) {
      return true;
    }
    
    return false;
  }

  // Optimized batch operations
  static async batchCreate(model, dataArray, batchSize = 100) {
    const results = [];
    
    for (let i = 0; i < dataArray.length; i += batchSize) {
      const batch = dataArray.slice(i, i + batchSize);
      
      try {
        const result = await prisma.$transaction(
          batch.map(item => model.create({ data: item })),
          { timeout: 30000 } // 30 second timeout
        );
        results.push(...result);
      } catch (error) {
        console.error(`Batch create error at batch ${Math.floor(i / batchSize) + 1}:`, error.message);
        throw error;
      }
    }
    
    return results;
  }

  // Optimized batch updates
  static async batchUpdate(model, updates) {
    return await prisma.$transaction(
      updates.map(update => 
        model.update({
          where: { id: update.id },
          data: update.data
        })
      ),
      { timeout: 30000 }
    );
  }

  // Optimized batch deletes
  static async batchDelete(model, ids) {
    return await prisma.$transaction(
      ids.map(id => model.delete({ where: { id } })),
      { timeout: 30000 }
    );
  }

  // Query optimization with proper indexing hints
  static async findManyOptimized(model, where = {}, options = {}) {
    const {
      select,
      include,
      orderBy,
      skip,
      take,
      distinct
    } = options;

    // Build optimized query
    const query = {
      where: this.optimizeWhereClause(where),
      ...(select && { select }),
      ...(include && { include }),
      ...(orderBy && { orderBy }),
      ...(skip !== undefined && { skip }),
      ...(take !== undefined && { take }),
      ...(distinct && { distinct })
    };

    return await model.findMany(query);
  }

  // Optimize where clauses for better performance
  static optimizeWhereClause(where) {
    if (!where || typeof where !== 'object') {
      return where;
    }

    const optimized = { ...where };

    // Convert case-insensitive searches to use proper indexes
    if (optimized.OR) {
      optimized.OR = optimized.OR.map(condition => {
        if (condition.name?.contains) {
          return {
            ...condition,
            name: {
              contains: condition.name.contains,
              mode: 'insensitive'
            }
          };
        }
        return condition;
      });
    }

    // Optimize date range queries
    if (optimized.createdAt) {
      if (optimized.createdAt.gte && optimized.createdAt.lte) {
        // Use compound index for date ranges
        optimized.createdAt = {
          gte: new Date(optimized.createdAt.gte),
          lte: new Date(optimized.createdAt.lte)
        };
      }
    }

    return optimized;
  }

  // Connection pooling optimization
  static async optimizeConnectionPool() {
    // This would typically be done in the Prisma client configuration
    // For now, we'll ensure proper connection management
    try {
      await prisma.$connect();
      console.log('Database connection optimized');
    } catch (error) {
      console.error('Database connection optimization failed:', error.message);
      throw error;
    }
  }

  // Query performance monitoring
  static async monitorQueryPerformance(queryName, queryFunction) {
    const startTime = Date.now();
    
    try {
      const result = await queryFunction();
      const executionTime = Date.now() - startTime;
      
      // Log slow queries
      if (executionTime > 1000) { // 1 second threshold
        console.warn(`Slow query detected: ${queryName} took ${executionTime}ms`);
      }
      
      return result;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      console.error(`Query failed: ${queryName} after ${executionTime}ms`, error.message);
      throw error;
    }
  }

  // Database health check
  static async healthCheck() {
    try {
      const startTime = Date.now();
      
      // Simple query to test connection
      await prisma.$queryRaw`SELECT 1`;
      
      const responseTime = Date.now() - startTime;
      
      return {
        status: 'healthy',
        responseTime: `${responseTime}ms`,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Cleanup and connection management
  static async cleanup() {
    try {
      await prisma.$disconnect();
      console.log('Database connections cleaned up');
    } catch (error) {
      console.error('Database cleanup failed:', error.message);
    }
  }

  // Utility function for delays
  static sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Optimized pagination with cursor-based approach for large datasets
  static async paginateWithCursor(model, where = {}, options = {}) {
    const {
      cursor,
      take = 20,
      orderBy = { id: 'asc' },
      select,
      include
    } = options;

    const query = {
      where: this.optimizeWhereClause(where),
      take: take + 1, // Take one extra to check if there are more records
      orderBy,
      ...(select && { select }),
      ...(include && { include })
    };

    if (cursor) {
      query.cursor = { id: cursor };
      query.skip = 1; // Skip the cursor record
    }

    const records = await model.findMany(query);
    const hasNextPage = records.length > take;
    const hasPreviousPage = !!cursor;

    if (hasNextPage) {
      records.pop(); // Remove the extra record
    }

    return {
      data: records,
      pagination: {
        hasNextPage,
        hasPreviousPage,
        nextCursor: hasNextPage ? records[records.length - 1]?.id : null,
        previousCursor: hasPreviousPage ? records[0]?.id : null
      }
    };
  }

  // Bulk operations with proper error handling
  static async bulkUpsert(model, dataArray, uniqueFields = ['id']) {
    const results = [];
    const errors = [];

    for (const data of dataArray) {
      try {
        const whereClause = uniqueFields.reduce((acc, field) => {
          acc[field] = data[field];
          return acc;
        }, {});

        const result = await model.upsert({
          where: whereClause,
          update: data,
          create: data
        });

        results.push(result);
      } catch (error) {
        errors.push({
          data,
          error: error.message
        });
      }
    }

    return {
      results,
      errors,
      successCount: results.length,
      errorCount: errors.length
    };
  }
}

module.exports = DatabaseOptimization;
