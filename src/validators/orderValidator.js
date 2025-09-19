const Joi = require('joi');
const { ValidationHelper, commonSchemas } = require('../utils/validation');
const { DELIVERY_TYPES } = require('../constants');

const orderCreateSchema = Joi.object({
  vendorId: commonSchemas.id,
  userId: Joi.string().optional(),
  deliveryCity: Joi.string().min(2).max(50).required().messages({
    'string.min': 'Delivery city must be at least 2 characters long',
    'string.max': 'Delivery city cannot exceed 50 characters',
    'string.empty': 'Delivery city is required',
    'any.required': 'Delivery city is required'
  }),
  deliveryAddress: Joi.string().min(5).max(200).required().messages({
    'string.min': 'Delivery address must be at least 5 characters long',
    'string.max': 'Delivery address cannot exceed 200 characters',
    'string.empty': 'Delivery address is required',
    'any.required': 'Delivery address is required'
  }),
  contactNumber: Joi.string().min(10).max(20).required().messages({
    'string.min': 'Contact number must be at least 10 characters long',
    'string.max': 'Contact number cannot exceed 20 characters',
    'string.empty': 'Contact number is required',
    'any.required': 'Contact number is required'
  }),
  name: Joi.string().min(2).max(100).required().messages({
    'string.min': 'Name must be at least 2 characters long',
    'string.max': 'Name cannot exceed 100 characters',
    'string.empty': 'Name is required',
    'any.required': 'Name is required'
  }),
  alternateContactNumber: Joi.string().min(10).max(20).optional().messages({
    'string.min': 'Alternate contact number must be at least 10 characters long',
    'string.max': 'Alternate contact number cannot exceed 20 characters'
  }),
  amountToBeCollected: Joi.number().min(0).optional().messages({
    'number.min': 'Amount to be collected cannot be negative'
  }),
  deliveryType: Joi.string().valid(...Object.values(DELIVERY_TYPES)).required().messages({
    'any.only': `Delivery type must be one of: ${Object.values(DELIVERY_TYPES).join(', ')}`,
    'any.required': 'Delivery type is required'
  }),
  productWeight: Joi.number().positive().required().messages({
    'number.positive': 'Product weight must be a positive number',
    'any.required': 'Product weight is required'
  }),
  productType: Joi.string().min(2).max(100).required().messages({
    'string.min': 'Product type must be at least 2 characters long',
    'string.max': 'Product type cannot exceed 100 characters',
    'string.empty': 'Product type is required',
    'any.required': 'Product type is required'
  }),
  notes: Joi.string().max(500).optional().messages({
    'string.max': 'Notes cannot exceed 500 characters'
  })
});

const orderUpdateSchema = Joi.object({
  status: Joi.string().valid('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED').optional(),
  deliveryCity: Joi.string().min(2).max(50).optional(),
  deliveryAddress: Joi.string().min(5).max(200).optional(),
  contactNumber: Joi.string().min(10).max(20).optional(),
  name: Joi.string().min(2).max(100).optional(),
  alternateContactNumber: Joi.string().min(10).max(20).optional(),
  amountToBeCollected: Joi.number().min(0).optional(),
  deliveryType: Joi.string().valid(...Object.values(DELIVERY_TYPES)).optional(),
  productWeight: Joi.number().positive().optional(),
  productType: Joi.string().min(2).max(100).optional(),
  notes: Joi.string().max(500).optional()
});

const orderQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  status: Joi.string().valid('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED').optional(),
  vendorId: Joi.string().optional(),
  userId: Joi.string().optional(),
  deliveryCity: Joi.string().optional(),
  deliveryType: Joi.string().valid(...Object.values(DELIVERY_TYPES)).optional()
});

const validateCreateOrder = ValidationHelper.validate(orderCreateSchema);
const validateUpdateOrder = ValidationHelper.validate(orderUpdateSchema);
const validateOrderQuery = ValidationHelper.validateQuery(orderQuerySchema);

module.exports = {
  validateCreateOrder,
  validateUpdateOrder,
  validateOrderQuery
};
