const Joi = require('joi');
const { ValidationError } = require('../errors');

class ValidationHelper {
  static validate(schema) {
    return (req, res, next) => {
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
