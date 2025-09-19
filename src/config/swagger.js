const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Logistics Management API',
      version: '1.0.0',
      description: 'A comprehensive backend API for logistics management system with vendor management, fare calculation, and order processing',
      contact: {
        name: 'API Support',
        email: 'support@logistics.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        ActivityLog: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'log_123' },
            userId: { type: 'string', nullable: true },
            userEmail: { type: 'string', nullable: true },
            method: { type: 'string', example: 'GET' },
            path: { type: 'string', example: '/api/orders' },
            route: { type: 'string', example: '/orders', nullable: true },
            statusCode: { type: 'integer', example: 200 },
            durationMs: { type: 'integer', example: 42 },
            ip: { type: 'string', example: '127.0.0.1', nullable: true },
            userAgent: { type: 'string', example: 'Mozilla/5.0', nullable: true },
            referer: { type: 'string', example: 'http://localhost:3000', nullable: true },
            query: { type: 'object', additionalProperties: true, nullable: true },
            params: { type: 'object', additionalProperties: true, nullable: true },
            body: { type: 'object', additionalProperties: true, nullable: true },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'user123' },
            name: { type: 'string', example: 'John Doe' },
            email: { type: 'string', format: 'email', example: 'john@example.com' },
            role: { type: 'string', enum: ['ADMIN', 'MANAGER', 'USER'], example: 'USER' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Warehouse: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'warehouse123' },
            name: { type: 'string', example: 'Pokhara Main Hub' },
            address: { type: 'string', example: '123 Logistics Ave' },
            city: { type: 'string', example: 'Pokhara' },
            state: { type: 'string', example: 'Gandaki' },
            country: { type: 'string', example: 'Nepal' },
            postalCode: { type: 'string', example: '33700' },
            capacity: { type: 'integer', example: 10000 },
            isActive: { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Vendor: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'vendor123' },
            name: { type: 'string', example: 'Tech Solutions Pvt Ltd' },
            email: { type: 'string', format: 'email', example: 'vendor@example.com' },
            phone: { type: 'string', example: '+977-61-123456' },
            address: { type: 'string', example: '789 Business St' },
            city: { type: 'string', example: 'Pokhara' },
            state: { type: 'string', example: 'Gandaki' },
            country: { type: 'string', example: 'Nepal' },
            postalCode: { type: 'string', example: '33700' },
            isActive: { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Fare: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'fare123' },
            fromCity: { type: 'string', example: 'Pokhara' },
            toCity: { type: 'string', example: 'Kathmandu' },
            branchDelivery: { type: 'number', format: 'float', example: 150.00 },
            codBranch: { type: 'number', format: 'float', example: 200.00 },
            doorDelivery: { type: 'number', format: 'float', example: 300.00 },
            isActive: { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Order: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'order123' },
            orderNumber: { type: 'string', example: 'ORD-1234567890-ABC123' },
            vendorId: { type: 'string', example: 'vendor123' },
            userId: { type: 'string', example: 'user123' },
            status: { type: 'string', enum: ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED'], example: 'CONFIRMED' },
            deliveryCity: { type: 'string', example: 'Kathmandu' },
            deliveryAddress: { type: 'string', example: 'Thamel, Kathmandu 44600' },
            contactNumber: { type: 'string', example: '+977-98-1234567' },
            name: { type: 'string', example: 'Ram Shrestha' },
            alternateContactNumber: { type: 'string', example: '+977-98-7654321' },
            amountToBeCollected: { type: 'number', format: 'float', example: 5000.00 },
            deliveryType: { type: 'string', enum: ['BRANCH_DELIVERY', 'COD_BRANCH', 'DOOR_DELIVERY'], example: 'DOOR_DELIVERY' },
            fareId: { type: 'string', example: 'fare123' },
            productWeight: { type: 'number', format: 'float', example: 2.5 },
            productType: { type: 'string', example: 'Electronics' },
            totalAmount: { type: 'number', format: 'float', example: 5300.00 },
            notes: { type: 'string', example: 'Handle with care' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Shipment: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'shipment123' },
            trackingNumber: { type: 'string', example: 'TRK-1234567890-ABC123' },
            orderId: { type: 'string', example: 'order123' },
            warehouseId: { type: 'string', example: 'warehouse123' },
            userId: { type: 'string', example: 'user123' },
            status: { type: 'string', enum: ['PREPARING', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED_DELIVERY', 'RETURNED'], example: 'PREPARING' },
            carrier: { type: 'string', example: 'FedEx' },
            trackingUrl: { type: 'string', format: 'uri', example: 'https://fedex.com/track/TRK123' },
            estimatedDelivery: { type: 'string', format: 'date-time' },
            actualDelivery: { type: 'string', format: 'date-time' },
            weight: { type: 'number', format: 'float', example: 2.5 },
            dimensions: { type: 'object', example: { length: 40, width: 30, height: 5 } },
            notes: { type: 'string', example: 'Handle with care' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string', example: 'Validation error' },
            message: { type: 'string', example: 'Detailed error message' }
          }
        },
        Pagination: {
          type: 'object',
          properties: {
            page: { type: 'integer', example: 1 },
            limit: { type: 'integer', example: 10 },
            total: { type: 'integer', example: 100 },
            pages: { type: 'integer', example: 10 }
          }
        }
      }
    },
    tags: [
      { name: 'Activity', description: 'Activity logs and audit trail' },
      { name: 'Security', description: 'Security and audit endpoints' },
      { name: 'Orders', description: 'Order management' },
      { name: 'Shipments', description: 'Shipment management' },
      { name: 'Vendors', description: 'Vendor management' },
      { name: 'Warehouses', description: 'Warehouse management' },
      { name: 'Fares', description: 'Fare management' },
      { name: 'Reports', description: 'Reporting and exports' },
      { name: 'Dashboard', description: 'Summary and trends' },
      { name: 'Auth', description: 'Authentication' }
    ],
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./src/routes/*.js', './src/controllers/*.js']
};

const specs = swaggerJSDoc(options);

module.exports = specs;
