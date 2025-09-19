const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss');
const validator = require('validator');
const { ForbiddenError, BadRequestError } = require('../errors');

class SecurityMiddleware {
  // Enhanced rate limiting with different tiers
  static createRateLimit(options = {}) {
    const defaultOptions = {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      message: {
        error: 'Too many requests',
        message: 'Too many requests from this IP, please try again later'
      },
      standardHeaders: true,
      legacyHeaders: false,
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
      keyGenerator: (req) => {
        // Use IP + User ID for more granular rate limiting
        return `${req.ip}-${req.user?.id || 'anonymous'}`;
      }
    };

    return rateLimit({ ...defaultOptions, ...options });
  }

  // Strict rate limiting for auth endpoints
  static createAuthRateLimit() {
    return rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 5, // limit each IP to 5 auth requests per windowMs
      message: {
        error: 'Too many authentication attempts',
        message: 'Too many authentication attempts from this IP, please try again later'
      },
      standardHeaders: true,
      legacyHeaders: false,
      skipSuccessfulRequests: true, // Don't count successful requests
    });
  }

  // Speed limiting to prevent brute force
  static createSpeedLimit() {
    return slowDown({
      windowMs: 15 * 60 * 1000, // 15 minutes
      delayAfter: 2, // allow 2 requests per 15 minutes, then...
      delayMs: 500, // add 500ms delay per request above delayAfter
      maxDelayMs: 20000, // max delay of 20 seconds
    });
  }

  // Input sanitization middleware
  static sanitizeInput() {
    return (req, res, next) => {
      // Sanitize body
      if (req.body) {
        req.body = this.sanitizeObject(req.body);
      }

      // Sanitize query parameters
      if (req.query) {
        req.query = this.sanitizeObject(req.query);
      }

      // Sanitize URL parameters
      if (req.params) {
        req.params = this.sanitizeObject(req.params);
      }

      next();
    };
  }

  // Recursively sanitize objects
  static sanitizeObject(obj) {
    if (typeof obj === 'string') {
      // Remove XSS attacks
      return xss(validator.escape(obj.trim()));
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item));
    }
    
    if (obj && typeof obj === 'object') {
      const sanitized = {};
      for (const [key, value] of Object.entries(obj)) {
        // Sanitize key names
        const sanitizedKey = validator.escape(key.trim());
        sanitized[sanitizedKey] = this.sanitizeObject(value);
      }
      return sanitized;
    }
    
    return obj;
  }

  // SQL injection prevention
  static preventSQLInjection() {
    return mongoSanitize({
      replaceWith: '_',
      onSanitize: ({ req, key }) => {
        console.warn(`SQL injection attempt detected: ${key} in ${req.originalUrl}`);
      }
    });
  }

  // Validate and sanitize file uploads
  static validateFileUpload(options = {}) {
    const {
      maxSize = 5 * 1024 * 1024, // 5MB
      allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
      maxFiles = 5
    } = options;

    return (req, res, next) => {
      if (!req.files || req.files.length === 0) {
        return next();
      }

      // Check number of files
      if (req.files.length > maxFiles) {
        throw new BadRequestError(`Maximum ${maxFiles} files allowed`);
      }

      // Validate each file
      for (const file of req.files) {
        // Check file size
        if (file.size > maxSize) {
          throw new BadRequestError(`File ${file.originalname} exceeds maximum size of ${maxSize / 1024 / 1024}MB`);
        }

        // Check file type
        if (!allowedTypes.includes(file.mimetype)) {
          throw new BadRequestError(`File type ${file.mimetype} not allowed`);
        }

        // Check file extension
        const allowedExtensions = allowedTypes.map(type => type.split('/')[1]);
        const fileExtension = file.originalname.split('.').pop().toLowerCase();
        if (!allowedExtensions.includes(fileExtension)) {
          throw new BadRequestError(`File extension .${fileExtension} not allowed`);
        }
      }

      next();
    };
  }

  // Content Security Policy
  static setCSP() {
    return (req, res, next) => {
      res.setHeader('Content-Security-Policy', 
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
        "style-src 'self' 'unsafe-inline'; " +
        "img-src 'self' data: https:; " +
        "font-src 'self' data:; " +
        "connect-src 'self'; " +
        "frame-ancestors 'none'; " +
        "base-uri 'self'; " +
        "form-action 'self'"
      );
      next();
    };
  }

  // Additional security headers
  static setSecurityHeaders() {
    return (req, res, next) => {
      // Prevent clickjacking
      res.setHeader('X-Frame-Options', 'DENY');
      
      // Prevent MIME type sniffing
      res.setHeader('X-Content-Type-Options', 'nosniff');
      
      // Enable XSS protection
      res.setHeader('X-XSS-Protection', '1; mode=block');
      
      // Referrer policy
      res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
      
      // Permissions policy
      res.setHeader('Permissions-Policy', 
        'camera=(), microphone=(), geolocation=(), payment=()'
      );
      
      // Remove server information
      res.removeHeader('X-Powered-By');
      
      next();
    };
  }

  // Request size limiting
  static limitRequestSize(maxSize = '10mb') {
    return (req, res, next) => {
      const contentLength = parseInt(req.get('content-length') || '0');
      const maxSizeBytes = this.parseSize(maxSize);
      
      if (contentLength > maxSizeBytes) {
        throw new BadRequestError(`Request size exceeds maximum allowed size of ${maxSize}`);
      }
      
      next();
    };
  }

  // Parse size string to bytes
  static parseSize(size) {
    const units = { b: 1, kb: 1024, mb: 1024 * 1024, gb: 1024 * 1024 * 1024 };
    const match = size.toLowerCase().match(/^(\d+(?:\.\d+)?)\s*(b|kb|mb|gb)$/);
    
    if (!match) {
      throw new Error(`Invalid size format: ${size}`);
    }
    
    const [, value, unit] = match;
    return parseFloat(value) * units[unit];
  }

  // IP whitelist/blacklist
  static ipFilter(allowedIPs = [], blockedIPs = []) {
    return (req, res, next) => {
      const clientIP = req.ip || req.connection.remoteAddress;
      
      // Check blacklist first
      if (blockedIPs.length > 0 && blockedIPs.includes(clientIP)) {
        throw new ForbiddenError('Access denied from this IP address');
      }
      
      // Check whitelist if provided
      if (allowedIPs.length > 0 && !allowedIPs.includes(clientIP)) {
        throw new ForbiddenError('Access denied from this IP address');
      }
      
      next();
    };
  }

  // Request timeout
  static requestTimeout(timeout = 30000) {
    return (req, res, next) => {
      req.setTimeout(timeout, () => {
        if (!res.headersSent) {
          res.status(408).json({
            error: 'Request timeout',
            message: 'Request took too long to process'
          });
        }
      });
      next();
    };
  }
}

module.exports = SecurityMiddleware;
