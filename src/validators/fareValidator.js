const Joi = require('joi');
const { ValidationHelper, commonSchemas } = require('../utils/validation');

const fareCreateSchema = Joi.object({
  fromCity: Joi.string().min(2).max(50).required().messages({
    'string.min': 'From city must be at least 2 characters long',
    'string.max': 'From city cannot exceed 50 characters',
    'string.empty': 'From city is required',
    'any.required': 'From city is required'
  }),
  toCity: Joi.string().min(2).max(50).required().messages({
    'string.min': 'To city must be at least 2 characters long',
    'string.max': 'To city cannot exceed 50 characters',
    'string.empty': 'To city is required',
    'any.required': 'To city is required'
  }),
  branchDelivery: Joi.number().positive().required().messages({
    'number.positive': 'Branch delivery fare must be a positive number',
    'any.required': 'Branch delivery fare is required'
  }),
  codBranch: Joi.number().positive().required().messages({
    'number.positive': 'COD branch fare must be a positive number',
    'any.required': 'COD branch fare is required'
  }),
  doorDelivery: Joi.number().positive().required().messages({
    'number.positive': 'Door delivery fare must be a positive number',
    'any.required': 'Door delivery fare is required'
  }),
  isActive: Joi.boolean().optional()
});

const fareUpdateSchema = Joi.object({
  fromCity: Joi.string().min(2).max(50).optional(),
  toCity: Joi.string().min(2).max(50).optional(),
  branchDelivery: Joi.number().positive().optional(),
  codBranch: Joi.number().positive().optional(),
  doorDelivery: Joi.number().positive().optional(),
  isActive: Joi.boolean().optional()
});

const fareQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  fromCity: Joi.string().optional(),
  toCity: Joi.string().optional(),
  isActive: Joi.boolean().optional()
});

const validateCreateFare = ValidationHelper.validate(fareCreateSchema);
const validateUpdateFare = ValidationHelper.validate(fareUpdateSchema);
const validateFareQuery = ValidationHelper.validateQuery(fareQuerySchema);

module.exports = {
  validateCreateFare,
  validateUpdateFare,
  validateFareQuery
};
