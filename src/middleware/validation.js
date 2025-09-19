const Joi = require('joi');

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.details.map(detail => detail.message)
      });
    }
    next();
  };
};

// User validation schemas
const userRegistrationSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('ADMIN', 'MANAGER', 'USER').optional()
});

const userLoginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

// Warehouse validation schemas
const warehouseSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  address: Joi.string().min(5).max(200).required(),
  city: Joi.string().min(2).max(50).required(),
  state: Joi.string().min(2).max(50).required(),
  country: Joi.string().min(2).max(50).required(),
  postalCode: Joi.string().min(3).max(20).required(),
  capacity: Joi.number().integer().min(1).required(),
  isActive: Joi.boolean().optional()
});

// Vendor validation schemas
const vendorSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().min(10).max(20).optional(),
  address: Joi.string().min(5).max(200).required(),
  city: Joi.string().min(2).max(50).required(),
  state: Joi.string().min(2).max(50).required(),
  country: Joi.string().min(2).max(50).required(),
  postalCode: Joi.string().min(3).max(20).required(),
  isActive: Joi.boolean().optional()
});

// Fare validation schemas
const fareSchema = Joi.object({
  fromCity: Joi.string().min(2).max(50).required(),
  toCity: Joi.string().min(2).max(50).required(),
  branchDelivery: Joi.number().positive().required(),
  codBranch: Joi.number().positive().required(),
  doorDelivery: Joi.number().positive().required(),
  isActive: Joi.boolean().optional()
});

// Order validation schemas
const orderSchema = Joi.object({
  vendorId: Joi.string().required(),
  userId: Joi.string().optional(),
  deliveryCity: Joi.string().min(2).max(50).required(),
  deliveryAddress: Joi.string().min(5).max(200).required(),
  contactNumber: Joi.string().min(10).max(20).required(),
  name: Joi.string().min(2).max(100).required(),
  alternateContactNumber: Joi.string().min(10).max(20).optional(),
  amountToBeCollected: Joi.number().min(0).optional(),
  deliveryType: Joi.string().valid('BRANCH_DELIVERY', 'COD_BRANCH', 'DOOR_DELIVERY').required(),
  productWeight: Joi.number().positive().required(),
  productType: Joi.string().min(2).max(100).required(),
  status: Joi.string().valid('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED').optional(),
  notes: Joi.string().max(500).optional()
});

// Shipment validation schemas
const shipmentSchema = Joi.object({
  orderId: Joi.string().required(),
  warehouseId: Joi.string().required(),
  userId: Joi.string().optional(),
  status: Joi.string().valid('PREPARING', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED_DELIVERY', 'RETURNED').optional(),
  carrier: Joi.string().max(100).optional(),
  trackingUrl: Joi.string().uri().optional(),
  estimatedDelivery: Joi.date().optional(),
  weight: Joi.number().positive().optional(),
  dimensions: Joi.object({
    length: Joi.number().positive().required(),
    width: Joi.number().positive().required(),
    height: Joi.number().positive().required()
  }).optional(),
  notes: Joi.string().max(500).optional()
});

module.exports = {
  validate,
  userRegistrationSchema,
  userLoginSchema,
  warehouseSchema,
  vendorSchema,
  fareSchema,
  orderSchema,
  shipmentSchema,
};
