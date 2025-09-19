const Joi = require('joi');
const { ValidationHelper } = require('../utils/validation');

const reportTypes = [
  'SHIPMENTS_STATUS',
  'ORDERS_SUMMARY',
  'COD_RECONCILIATION',
  'WAREHOUSE_UTILIZATION',
  'USER_ACTIVITY'
];

const exportSchema = Joi.object({
  type: Joi.string().valid(...reportTypes).required(),
  delivery: Joi.string().valid('download', 'email').default('download'),
  filters: Joi.object({
    dateFrom: Joi.date().iso().optional(),
    dateTo: Joi.date().iso().optional(),
    status: Joi.array().items(Joi.string()).optional(),
    warehouseIds: Joi.array().items(Joi.string()).optional(),
    vendorIds: Joi.array().items(Joi.string()).optional(),
    cities: Joi.array().items(Joi.string()).optional(),
    users: Joi.array().items(Joi.string()).optional()
  }).default({})
});

const validateExport = ValidationHelper.validate(exportSchema);

module.exports = {
  validateExport
};


