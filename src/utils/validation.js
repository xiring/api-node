const Joi = require('joi');
const validator = require('validator');
const { ValidationError } = require('../errors');

class ValidationHelper {
  static validate(schema) {
    return (req, res, next) => {
      // Sanitize input before validation
      req.body = this.sanitizeInput(req.body);
      
      const { error } = schema.validate(req.body);
      if (error) {
        const details = error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message,
          value: detail.context?.value
        }));
        
        throw new ValidationError('Validation failed', details);
      }
      next();
    };
  }

  // Enhanced input sanitization
  static sanitizeInput(input, isPassword = false) {
    if (typeof input === 'string') {
      // Don't sanitize passwords to preserve special characters
      if (isPassword) {
        return input.trim();
      }
      
      // Remove potential SQL injection patterns
      let sanitized = input
        .replace(/['";\\]/g, '') // Remove quotes and backslashes
        .replace(/--/g, '') // Remove SQL comments
        .replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
        .replace(/(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi, '') // Remove SQL keywords
        .trim();
      
      // Escape HTML entities
      sanitized = validator.escape(sanitized);
      
      return sanitized;
    }
    
    if (Array.isArray(input)) {
      return input.map(item => this.sanitizeInput(item, isPassword));
    }
    
    if (input && typeof input === 'object') {
      const sanitized = {};
      for (const [key, value] of Object.entries(input)) {
        // Sanitize key names
        const sanitizedKey = validator.escape(key.trim());
        // Check if this is a password field
        const isPasswordField = key.toLowerCase().includes('password');
        sanitized[sanitizedKey] = this.sanitizeInput(value, isPasswordField);
      }
      return sanitized;
    }
    
    return input;
  }

  static validateQuery(schema) {
    return (req, res, next) => {
      const { error } = schema.validate(req.query);
      if (error) {
        const details = error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message,
          value: detail.context?.value
        }));
        
        throw new ValidationError('Query validation failed', details);
      }
      next();
    };
  }

  static validateParams(schema) {
    return (req, res, next) => {
      const { error } = schema.validate(req.params);
      if (error) {
        const details = error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message,
          value: detail.context?.value
        }));
        
        throw new ValidationError('Parameter validation failed', details);
      }
      next();
    };
  }
}

// Common validation schemas
const commonSchemas = {
  id: Joi.string().required().messages({
    'string.empty': 'ID is required',
    'any.required': 'ID is required'
  }),
  
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'string.empty': 'Email is required',
    'any.required': 'Email is required'
  }),
  
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters long',
    'string.empty': 'Password is required',
    'any.required': 'Password is required'
  }),
  
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10)
  })
};

module.exports = {
  ValidationHelper,
  commonSchemas
};
