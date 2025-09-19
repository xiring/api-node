const Joi = require('joi');
const { ValidationHelper, commonSchemas } = require('../utils/validation');
const { SHIPMENT_STATUS } = require('../constants');

const shipmentCreateSchema = Joi.object({
  orderId: commonSchemas.id,
  warehouseId: commonSchemas.id,
  trackingNumber: Joi.string().optional(),
  status: Joi.string().valid(...Object.values(SHIPMENT_STATUS)).optional(),
  estimatedDeliveryDate: Joi.date().optional().messages({
    'date.base': 'Estimated delivery date must be a valid date'
  }),
  actualDeliveryDate: Joi.date().optional().messages({
    'date.base': 'Actual delivery date must be a valid date'
  }),
  notes: Joi.string().max(500).optional().messages({
    'string.max': 'Notes cannot exceed 500 characters'
  })
});

const shipmentUpdateSchema = Joi.object({
  status: Joi.string().valid(...Object.values(SHIPMENT_STATUS)).optional(),
  estimatedDeliveryDate: Joi.date().optional(),
  actualDeliveryDate: Joi.date().optional(),
  notes: Joi.string().max(500).optional()
});

const shipmentQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  status: Joi.string().valid(...Object.values(SHIPMENT_STATUS)).optional(),
  orderId: Joi.string().optional(),
  warehouseId: Joi.string().optional()
});

const validateCreateShipment = ValidationHelper.validate(shipmentCreateSchema);
const validateUpdateShipment = ValidationHelper.validate(shipmentUpdateSchema);
const validateShipmentQuery = ValidationHelper.validateQuery(shipmentQuerySchema);

module.exports = {
  validateCreateShipment,
  validateUpdateShipment,
  validateShipmentQuery
};
