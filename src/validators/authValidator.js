const Joi = require('joi');
const { ValidationHelper, commonSchemas } = require('../utils/validation');
const { USER_ROLES } = require('../constants');

const userRegistrationSchema = Joi.object({
  name: Joi.string().min(2).max(50).required().messages({
    'string.min': 'Name must be at least 2 characters long',
    'string.max': 'Name cannot exceed 50 characters',
    'string.empty': 'Name is required',
    'any.required': 'Name is required'
  }),
  email: commonSchemas.email,
  password: commonSchemas.password,
  role: Joi.string().valid(...Object.values(USER_ROLES)).optional().messages({
    'any.only': 'Role must be one of: ADMIN, MANAGER, USER'
  })
});

const userLoginSchema = Joi.object({
  email: commonSchemas.email,
  password: commonSchemas.password
});

const refreshSchema = Joi.object({
  refreshToken: Joi.string().min(20).required().messages({
    'string.empty': 'refreshToken is required',
    'any.required': 'refreshToken is required'
  })
});

const validateRegistration = ValidationHelper.validate(userRegistrationSchema);
const validateLogin = ValidationHelper.validate(userLoginSchema);
const validateRefresh = ValidationHelper.validate(refreshSchema);

module.exports = {
  validateRegistration,
  validateLogin,
  validateRefresh
};
