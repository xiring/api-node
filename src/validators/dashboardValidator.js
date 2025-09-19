const Joi = require('joi');
const { ValidationHelper } = require('../utils/validation');

const rangeSchema = Joi.string().valid('7d','14d','30d','90d').default('30d');
const metricSchema = Joi.string().valid('orders','shipments','delivered').default('orders');

const validateSummary = ValidationHelper.validate(Joi.object({
  range: rangeSchema
}));

const validateTrends = ValidationHelper.validate(Joi.object({
  range: rangeSchema,
  metric: metricSchema
}));

module.exports = {
  validateSummary,
  validateTrends
};


