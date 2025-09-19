// HTTP Status Codes
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
};

// User Roles
const USER_ROLES = {
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  USER: 'USER'
};

// Order Status
const ORDER_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  PROCESSING: 'PROCESSING',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
  RETURNED: 'RETURNED'
};

// Delivery Types
const DELIVERY_TYPES = {
  BRANCH_DELIVERY: 'BRANCH_DELIVERY',
  COD_BRANCH: 'COD_BRANCH',
  DOOR_DELIVERY: 'DOOR_DELIVERY'
};

// Shipment Status
const SHIPMENT_STATUS = {
  PREPARING: 'PREPARING',
  PICKED_UP: 'PICKED_UP',
  IN_TRANSIT: 'IN_TRANSIT',
  OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
  DELIVERED: 'DELIVERED',
  FAILED_DELIVERY: 'FAILED_DELIVERY',
  RETURNED: 'RETURNED'
};

// Pagination
const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100
};

// JWT
const JWT = {
  DEFAULT_EXPIRES_IN: '7d',
  ALGORITHM: 'HS256'
};

// Rate Limiting
const RATE_LIMIT = {
  WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  MAX_REQUESTS: 100
};

// Database
const DATABASE = {
  DEFAULT_CITY: 'Pokhara',
  ORDER_NUMBER_PREFIX: 'ORD',
  TRACKING_NUMBER_PREFIX: 'TRK'
};

// Error Messages
const ERROR_MESSAGES = {
  VALIDATION_ERROR: 'Validation error',
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Insufficient permissions',
  NOT_FOUND: 'Resource not found',
  CONFLICT: 'Resource already exists',
  INTERNAL_ERROR: 'Internal server error',
  INVALID_CREDENTIALS: 'Invalid credentials',
  TOKEN_EXPIRED: 'Token has expired',
  INVALID_TOKEN: 'Invalid token',
  USER_NOT_FOUND: 'User not found',
  VENDOR_NOT_FOUND: 'Vendor not found',
  ORDER_NOT_FOUND: 'Order not found',
  FARE_NOT_FOUND: 'Fare not found',
  WAREHOUSE_NOT_FOUND: 'Warehouse not found',
  SHIPMENT_NOT_FOUND: 'Shipment not found',
  DUPLICATE_EMAIL: 'Email already exists',
  DUPLICATE_FARE_ROUTE: 'Fare route already exists',
  INVALID_DELIVERY_TYPE: 'Invalid delivery type',
  FARE_NOT_FOUND_FOR_ROUTE: 'No fare found for this route'
};

// Success Messages
const SUCCESS_MESSAGES = {
  USER_CREATED: 'User created successfully',
  USER_UPDATED: 'User updated successfully',
  USER_DELETED: 'User deleted successfully',
  LOGIN_SUCCESS: 'Login successful',
  VENDOR_CREATED: 'Vendor created successfully',
  VENDOR_UPDATED: 'Vendor updated successfully',
  VENDOR_DELETED: 'Vendor deleted successfully',
  ORDER_CREATED: 'Order created successfully',
  ORDER_UPDATED: 'Order updated successfully',
  ORDER_DELETED: 'Order deleted successfully',
  FARE_CREATED: 'Fare created successfully',
  FARE_UPDATED: 'Fare updated successfully',
  FARE_DELETED: 'Fare deleted successfully',
  WAREHOUSE_CREATED: 'Warehouse created successfully',
  WAREHOUSE_UPDATED: 'Warehouse updated successfully',
  WAREHOUSE_DELETED: 'Warehouse deleted successfully',
  SHIPMENT_CREATED: 'Shipment created successfully',
  SHIPMENT_UPDATED: 'Shipment updated successfully',
  SHIPMENT_DELETED: 'Shipment deleted successfully'
};

module.exports = {
  HTTP_STATUS,
  USER_ROLES,
  ORDER_STATUS,
  DELIVERY_TYPES,
  SHIPMENT_STATUS,
  PAGINATION,
  JWT,
  RATE_LIMIT,
  DATABASE,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES
};
