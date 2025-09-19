const Joi = require('joi');
const { ValidationHelper, commonSchemas } = require('../utils/validation');

const warehouseCreateSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    'string.min': 'Name must be at least 2 characters long',
    'string.max': 'Name cannot exceed 100 characters',
    'string.empty': 'Name is required',
    'any.required': 'Name is required'
  }),
  address: Joi.string().min(5).max(200).required().messages({
    'string.min': 'Address must be at least 5 characters long',
    'string.max': 'Address cannot exceed 200 characters',
    'string.empty': 'Address is required',
    'any.required': 'Address is required'
  }),
  city: Joi.string().min(2).max(50).required().messages({
    'string.min': 'City must be at least 2 characters long',
    'string.max': 'City cannot exceed 50 characters',
    'string.empty': 'City is required',
    'any.required': 'City is required'
  }),
  state: Joi.string().min(2).max(50).required().messages({
    'string.min': 'State must be at least 2 characters long',
    'string.max': 'State cannot exceed 50 characters',
    'string.empty': 'State is required',
    'any.required': 'State is required'
  }),
  country: Joi.string().min(2).max(50).required().messages({
    'string.min': 'Country must be at least 2 characters long',
    'string.max': 'Country cannot exceed 50 characters',
    'string.empty': 'Country is required',
    'any.required': 'Country is required'
  }),
  postalCode: Joi.string().min(3).max(20).required().messages({
    'string.min': 'Postal code must be at least 3 characters long',
    'string.max': 'Postal code cannot exceed 20 characters',
    'string.empty': 'Postal code is required',
    'any.required': 'Postal code is required'
  }),
  capacity: Joi.number().positive().optional().messages({
    'number.positive': 'Capacity must be a positive number'
  }),
  isActive: Joi.boolean().optional()
});

const warehouseUpdateSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  address: Joi.string().min(5).max(200).optional(),
  city: Joi.string().min(2).max(50).optional(),
  state: Joi.string().min(2).max(50).optional(),
  country: Joi.string().min(2).max(50).optional(),
  postalCode: Joi.string().min(3).max(20).optional(),
  capacity: Joi.number().positive().optional(),
  isActive: Joi.boolean().optional()
});

const warehouseQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().optional(),
  city: Joi.string().optional(),
  isActive: Joi.boolean().optional()
});

const validateCreateWarehouse = ValidationHelper.validate(warehouseCreateSchema);
const validateUpdateWarehouse = ValidationHelper.validate(warehouseUpdateSchema);
const validateWarehouseQuery = ValidationHelper.validateQuery(warehouseQuerySchema);

module.exports = {
  validateCreateWarehouse,
  validateUpdateWarehouse,
  validateWarehouseQuery
};
