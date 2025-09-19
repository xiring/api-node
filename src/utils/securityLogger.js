const fs = require('fs');
const path = require('path');
const { createWriteStream } = require('fs');

class SecurityLogger {
  constructor() {
    this.logDir = path.join(__dirname, '../../logs');
    this.securityLogFile = path.join(this.logDir, 'security.log');
    this.auditLogFile = path.join(this.logDir, 'audit.log');
    
    // Ensure log directory exists
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  // Log security events
  static logSecurityEvent(event, details = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      event,
      details: this.sanitizeLogData(details),
      severity: this.getSeverityLevel(event)
    };

    const logLine = JSON.stringify(logEntry) + '\n';
    
    // Get log file path
    const logDir = path.join(__dirname, '../../logs');
    const securityLogFile = path.join(logDir, 'security.log');
    
    // Ensure log directory exists
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    
    // Write to security log
    fs.appendFileSync(securityLogFile, logLine);
    
    // Also log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[SECURITY] ${event}:`, details);
    }
  }

  // Log audit events
  static logAuditEvent(action, user, resource, details = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      action,
      user: this.sanitizeUserData(user),
      resource,
      details: this.sanitizeLogData(details),
      ip: details.ip || 'unknown',
      userAgent: details.userAgent || 'unknown'
    };

    const logLine = JSON.stringify(logEntry) + '\n';
    
    // Get log file path
    const logDir = path.join(__dirname, '../../logs');
    const auditLogFile = path.join(logDir, 'audit.log');
    
    // Ensure log directory exists
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    
    // Write to audit log
    fs.appendFileSync(auditLogFile, logLine);
  }

  // Log authentication events
  static logAuthEvent(event, user, details = {}) {
    this.logSecurityEvent(`AUTH_${event}`, {
      userId: user?.id,
      email: user?.email,
      ip: details.ip,
      userAgent: details.userAgent,
      success: details.success,
      failureReason: details.failureReason
    });
  }

  // Log authorization events
  static logAuthzEvent(event, user, resource, details = {}) {
    this.logSecurityEvent(`AUTHZ_${event}`, {
      userId: user?.id,
      email: user?.email,
      resource,
      action: details.action,
      allowed: details.allowed,
      reason: details.reason,
      ip: details.ip
    });
  }

  // Log data access events
  static logDataAccess(user, resource, action, details = {}) {
    this.logAuditEvent(action, user, resource, {
      ...details,
      timestamp: new Date().toISOString()
    });
  }

  // Log suspicious activities
  static logSuspiciousActivity(activity, details = {}) {
    this.logSecurityEvent('SUSPICIOUS_ACTIVITY', {
      activity,
      ...details,
      severity: 'HIGH'
    });
  }

  // Log SQL injection attempts
  static logSQLInjectionAttempt(query, user, details = {}) {
    this.logSecurityEvent('SQL_INJECTION_ATTEMPT', {
      query: this.sanitizeQuery(query),
      userId: user?.id,
      email: user?.email,
      ip: details.ip,
      userAgent: details.userAgent,
      severity: 'CRITICAL'
    });
  }

  // Log rate limiting events
  static logRateLimitExceeded(ip, endpoint, details = {}) {
    this.logSecurityEvent('RATE_LIMIT_EXCEEDED', {
      ip,
      endpoint,
      ...details,
      severity: 'MEDIUM'
    });
  }

  // Log file upload events
  static logFileUpload(user, file, details = {}) {
    this.logAuditEvent('FILE_UPLOAD', user, 'file', {
      fileName: file.originalname,
      fileSize: file.size,
      mimeType: file.mimetype,
      ...details
    });
  }

  // Log configuration changes
  static logConfigChange(user, configKey, oldValue, newValue, details = {}) {
    this.logAuditEvent('CONFIG_CHANGE', user, 'configuration', {
      configKey,
      oldValue: this.sanitizeValue(oldValue),
      newValue: this.sanitizeValue(newValue),
      ...details
    });
  }

  // Log system errors
  static logSystemError(error, context = {}) {
    this.logSecurityEvent('SYSTEM_ERROR', {
      error: error.message,
      stack: error.stack,
      context,
      severity: 'HIGH'
    });
  }

  // Sanitize log data to prevent log injection
  static sanitizeLogData(data) {
    if (!data || typeof data !== 'object') {
      return this.sanitizeValue(data);
    }

    const sanitized = {};
    for (const [key, value] of Object.entries(data)) {
      sanitized[this.sanitizeKey(key)] = this.sanitizeValue(value);
    }
    return sanitized;
  }

  // Sanitize user data
  static sanitizeUserData(user) {
    if (!user) return null;
    
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      // Don't log sensitive data like passwords
    };
  }

  // Sanitize values
  static sanitizeValue(value) {
    if (typeof value === 'string') {
      // Remove newlines and control characters to prevent log injection
      return value.replace(/[\r\n\t]/g, ' ').substring(0, 1000);
    }
    return value;
  }

  // Sanitize keys
  static sanitizeKey(key) {
    if (typeof key === 'string') {
      return key.replace(/[^a-zA-Z0-9_]/g, '_');
    }
    return key;
  }

  // Sanitize SQL queries
  static sanitizeQuery(query) {
    if (typeof query === 'string') {
      // Remove sensitive information and limit length
      return query
        .replace(/password\s*=\s*['"][^'"]*['"]/gi, "password='***'")
        .replace(/token\s*=\s*['"][^'"]*['"]/gi, "token='***'")
        .substring(0, 500);
    }
    return query;
  }

  // Get severity level
  static getSeverityLevel(event) {
    const criticalEvents = [
      'SQL_INJECTION_ATTEMPT',
      'AUTH_LOGIN_FAILED_MULTIPLE',
      'SUSPICIOUS_ACTIVITY'
    ];
    
    const highEvents = [
      'AUTH_LOGIN_FAILED',
      'AUTHZ_ACCESS_DENIED',
      'SYSTEM_ERROR'
    ];
    
    const mediumEvents = [
      'RATE_LIMIT_EXCEEDED',
      'AUTHZ_ACCESS_GRANTED'
    ];

    if (criticalEvents.some(e => event.includes(e))) return 'CRITICAL';
    if (highEvents.some(e => event.includes(e))) return 'HIGH';
    if (mediumEvents.some(e => event.includes(e))) return 'MEDIUM';
    return 'LOW';
  }

  // Get security metrics
  static getSecurityMetrics(timeframe = '24h') {
    try {
      const logFile = this.securityLogFile;
      if (!fs.existsSync(logFile)) {
        return { error: 'Security log file not found' };
      }

      const logs = fs.readFileSync(logFile, 'utf8')
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

      const cutoffTime = new Date(Date.now() - this.parseTimeframe(timeframe));
      const recentLogs = logs.filter(log => new Date(log.timestamp) > cutoffTime);

      const metrics = {
        totalEvents: recentLogs.length,
        criticalEvents: recentLogs.filter(log => log.severity === 'CRITICAL').length,
        highEvents: recentLogs.filter(log => log.severity === 'HIGH').length,
        mediumEvents: recentLogs.filter(log => log.severity === 'MEDIUM').length,
        lowEvents: recentLogs.filter(log => log.severity === 'LOW').length,
        eventsByType: this.groupEventsByType(recentLogs),
        topIPs: this.getTopIPs(recentLogs),
        timeframe
      };

      return metrics;
    } catch (error) {
      return { error: error.message };
    }
  }

  // Parse timeframe string
  static parseTimeframe(timeframe) {
    const match = timeframe.match(/^(\d+)([hmd])$/);
    if (!match) return 24 * 60 * 60 * 1000; // Default to 24 hours

    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
      case 'h': return value * 60 * 60 * 1000;
      case 'm': return value * 60 * 1000;
      case 'd': return value * 24 * 60 * 60 * 1000;
      default: return 24 * 60 * 60 * 1000;
    }
  }

  // Group events by type
  static groupEventsByType(logs) {
    const groups = {};
    logs.forEach(log => {
      const eventType = log.event.split('_')[0];
      groups[eventType] = (groups[eventType] || 0) + 1;
    });
    return groups;
  }

  // Get top IPs
  static getTopIPs(logs) {
    const ipCounts = {};
    logs.forEach(log => {
      const ip = log.details?.ip;
      if (ip && ip !== 'unknown') {
        ipCounts[ip] = (ipCounts[ip] || 0) + 1;
      }
    });

    return Object.entries(ipCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([ip, count]) => ({ ip, count }));
  }

  // Cleanup old logs
  static cleanupOldLogs(daysToKeep = 30) {
    const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);
    
    [this.securityLogFile, this.auditLogFile].forEach(logFile => {
      if (fs.existsSync(logFile)) {
        const logs = fs.readFileSync(logFile, 'utf8')
          .split('\n')
          .filter(line => line.trim())
          .map(line => {
            try {
              return JSON.parse(line);
            } catch {
              return null;
            }
          })
          .filter(log => log && log.timestamp && new Date(log.timestamp) > cutoffDate);

        const newLogContent = logs.map(log => JSON.stringify(log)).join('\n') + '\n';
        fs.writeFileSync(logFile, newLogContent);
      }
    });
  }
}

module.exports = SecurityLogger;
