# Logistics Management System API

A comprehensive backend API for logistics management built with Node.js, Express, PostgreSQL, and Prisma ORM.

## 🚀 Features

- **User Management**: Authentication and role-based access control (Admin, Manager, User)
- **Warehouse Management**: CRUD operations for warehouse locations
- **Vendor Management**: Vendor information and order processing
- **Order Management**: Order processing and status tracking
- **Shipment Management**: Shipment tracking and delivery management
- **Fare Management**: Shipping fare calculation and management
- **Caching System**: Redis-based response caching with tag-based invalidation
- **Email Queue**: Asynchronous email processing with BullMQ
- **Enhanced Security**: SQL injection prevention, rate limiting, input validation, security headers
- **Database Optimization**: Deadlock prevention and connection pooling
- **API Documentation**: Comprehensive API endpoints with examples

## 🛠 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Caching**: Redis with cache-manager
- **Queue**: BullMQ for job processing
- **Email**: Nodemailer
- **Authentication**: JWT (jsonwebtoken)
  - Access tokens with refresh token rotation (Redis-backed)
- **Validation**: Joi
- **Security**: Helmet, CORS, Rate Limiting, Input Sanitization
- **Logging**: Morgan, Custom Security Logger

## 📋 Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- Redis (v6 or higher) - for caching and queue
- npm or yarn

## 🚀 Quick Start

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd ecommerce_api
npm install
```

### 2. Environment Setup

```bash
# Copy the example environment file
cp env.example .env

# Edit .env with your configuration
DATABASE_URL="postgresql://username@localhost:5432/logistics_db"
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_EXPIRES_IN="7d"
REFRESH_TOKEN_TTL_SECONDS=2592000 # 30 days
PORT=3000

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@ecommerce.com
FRONTEND_URL=http://localhost:3001

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

### 3. Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Push database schema
npm run db:push

# Seed the database with sample data
npm run db:seed
```

### 4. Start Redis (Required for caching and email queue)

```bash
# Using Docker
docker run -d -p 6379:6379 redis:alpine

# Or install Redis locally
# macOS: brew install redis && brew services start redis
# Ubuntu: sudo apt install redis-server && sudo systemctl start redis
```

### 5. Start the Server

```bash
# Development mode
npm run dev

# Production mode
npm start
```

The API will be available at `http://localhost:3000`

## 🆕 New Features

### 🚀 Caching System

The API now includes a comprehensive Redis-based caching system:

- **Automatic Response Caching**: GET requests are automatically cached
- **Tag-based Invalidation**: Smart cache invalidation by business logic tags
- **Flexible TTL**: Configurable cache expiration times
- **Cache Headers**: X-Cache, X-Cache-Key headers for debugging

**Example Usage:**
```javascript
// Cache GET requests for 30 minutes
router.get('/', CacheMiddleware.cache(1800), controller.getAll);

// Cache with tags for easy invalidation
router.get('/', CacheMiddleware.cacheWithTags(['warehouses'], 1800), controller.getAll);
router.post('/', CacheMiddleware.invalidateByTags(['warehouses']), controller.create);
```

### 📧 Email Queue System

Asynchronous email processing with BullMQ:

- **Non-blocking Email Sending**: Emails are processed in background
- **Job Retry Logic**: Automatic retry on failures
- **Queue Monitoring**: Real-time queue status and job tracking
- **Scalable**: Can handle high email volumes

**Example Usage:**
```javascript
// Add email to queue
await QueueService.addEmailJob(
  'user@example.com',
  'Welcome!',
  '<h1>Welcome to our service!</h1>',
  'Welcome to our service!'
);
```

### 🔒 Enhanced Security

Enterprise-grade security features:

- **SQL Injection Prevention**: Input sanitization and parameterized queries
- **XSS Protection**: Content Security Policy and input validation
- **Rate Limiting**: Multi-tier rate limiting (general, auth-specific, speed limiting)
- **Token Refresh**: Opaque refresh tokens stored in Redis with rotation
- **Password Security**: Strong password requirements with bcrypt hashing
- **Security Headers**: Helmet.js with comprehensive security headers
- **Security Logging**: Detailed audit trails and security event logging

### ⚡ Database Optimization

Performance and reliability improvements:

- **Deadlock Prevention**: Retry logic with exponential backoff
- **Connection Pooling**: Optimized database connections
- **Query Optimization**: Efficient database operations

## 📚 API Documentation

Once the server is running, you can access the interactive API documentation:

- **Swagger UI**: `http://localhost:3000/api-docs`
- **API Health Check**: `http://localhost:3000/api/health`
- **Security Monitoring**: `http://localhost:3000/api/security/health`
- **Queue Monitoring**: `http://localhost:3000/api/queue/status`
- **Root Endpoint**: `http://localhost:3000/`

### Base URL
```
http://localhost:3000/api
```

### Authentication

All endpoints (except auth and public tracking) require authentication via JWT token.

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

### Endpoints Overview

#### 🔐 Authentication (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/register` | Register new user | No |
| POST | `/login` | User login | No |
| POST | `/refresh` | Refresh access token (rotates refresh) | No |
| GET | `/profile` | Get user profile | Yes |

**Register Example:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "Password123!",
    "role": "USER"
  }'
```

**Login Example:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "Password123!"
  }'
```

**Refresh Example:**
```bash
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "<opaque-refresh-token>"
  }'
```

#### 🏢 Warehouses (`/api/warehouses`)

| Method | Endpoint | Description | Auth Required | Role Required | Cached |
|--------|----------|-------------|---------------|---------------|--------|
| GET | `/` | Get all warehouses | Yes | Any | ✅ (30min) |
| GET | `/:id` | Get warehouse by ID | Yes | Any | ✅ (1hr) |
| POST | `/` | Create warehouse | Yes | Admin/Manager | ❌ |
| PUT | `/:id` | Update warehouse | Yes | Admin/Manager | ❌ |
| DELETE | `/:id` | Delete warehouse | Yes | Admin | ❌ |
| GET | `/city/:city` | Get warehouses by city | Yes | Any | ✅ (30min) |

**Create Warehouse Example:**
```bash
curl -X POST http://localhost:3000/api/warehouses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "name": "East Coast Hub",
    "address": "123 Distribution St",
    "city": "Boston",
    "state": "MA",
    "country": "USA",
    "postalCode": "02101",
    "capacity": 5000
  }'
```

#### 🏪 Vendors (`/api/vendors`)

| Method | Endpoint | Description | Auth Required | Role Required |
|--------|----------|-------------|---------------|---------------|
| GET | `/` | Get all vendors | Yes | Any |
| GET | `/:id` | Get vendor by ID | Yes | Any |
| POST | `/` | Create vendor | Yes | Admin/Manager |
| PUT | `/:id` | Update vendor | Yes | Admin/Manager |
| DELETE | `/:id` | Delete vendor | Yes | Admin |
| GET | `/city/:city` | Get vendors by city | Yes | Any |

#### 📋 Orders (`/api/orders`)

| Method | Endpoint | Description | Auth Required | Role Required |
|--------|----------|-------------|---------------|---------------|
| GET | `/` | Get all orders | Yes | Any |
| GET | `/:id` | Get order by ID | Yes | Any |
| POST | `/` | Create order | Yes | Any |
| PUT | `/:id` | Update order | Yes | Admin/Manager |
| DELETE | `/:id` | Delete order | Yes | Admin |

**Create Order Example:**
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "vendorId": "vendor-id",
    "deliveryCity": "Kathmandu",
    "deliveryAddress": "123 Main St",
    "deliveryType": "DOOR_DELIVERY",
    "paymentMethod": "CASH_ON_DELIVERY",
    "notes": "Rush delivery"
  }'
```

#### 🚚 Shipments (`/api/shipments`)

| Method | Endpoint | Description | Auth Required | Role Required |
|--------|----------|-------------|---------------|---------------|
| GET | `/` | Get all shipments | Yes | Any |
| GET | `/:id` | Get shipment by ID | Yes | Any |
| POST | `/` | Create shipment | Yes | Admin/Manager |
| PUT | `/:id` | Update shipment | Yes | Admin/Manager |
| DELETE | `/:id` | Delete shipment | Yes | Admin |
| GET | `/tracking/:trackingNumber` | Track shipment | No | Public |

**Create Shipment Example:**
```bash
curl -X POST http://localhost:3000/api/shipments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "orderId": "order-id",
    "warehouseId": "warehouse-id",
    "carrier": "UPS",
    "estimatedDelivery": "2024-01-15T10:00:00Z",
    "weight": 2.5,
    "dimensions": {"length": 30, "width": 20, "height": 10}
  }'
```

#### 💰 Fares (`/api/fares`)

| Method | Endpoint | Description | Auth Required | Role Required |
|--------|----------|-------------|---------------|---------------|
| GET | `/` | Get all fares | Yes | Any |
| GET | `/:id` | Get fare by ID | Yes | Any |
| POST | `/` | Create fare | Yes | Admin/Manager |
| PUT | `/:id` | Update fare | Yes | Admin/Manager |
| DELETE | `/:id` | Delete fare | Yes | Admin |
| GET | `/route/:fromCity/:toCity` | Get fare by route | Yes | Any |

#### 🔒 Security (`/api/security`)

| Method | Endpoint | Description | Auth Required | Role Required |
|--------|----------|-------------|---------------|---------------|
| GET | `/health` | Security health check | Yes | Admin |
| GET | `/metrics` | Security metrics | Yes | Admin |
| GET | `/logs` | Security logs | Yes | Admin |
| POST | `/cleanup` | Cleanup old logs | Yes | Admin |
| GET | `/config` | Security configuration | Yes | Admin |

#### 📧 Queue (`/api/queue`)

| Method | Endpoint | Description | Auth Required | Role Required |
|--------|----------|-------------|---------------|---------------|
| GET | `/status` | Queue status | Yes | Admin |
| GET | `/jobs` | Queue jobs | Yes | Admin |
| POST | `/clear` | Clear queue | Yes | Admin |

### Query Parameters

Most GET endpoints support pagination and filtering:

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `search`: Search term for text fields
- `isActive`: Filter by active status (true/false)
- `status`: Filter by specific status
- `city`: Filter by city
- `deliveryType`: Filter by delivery type (orders)
- `carrier`: Filter by carrier (shipments)

**Example:**
```bash
GET /api/warehouses?page=1&limit=20&search=hub&city=Boston
GET /api/orders?status=PENDING&deliveryCity=Kathmandu
GET /api/shipments?carrier=UPS&status=IN_TRANSIT
```

## 🔐 User Roles

- **ADMIN**: Full access to all operations
- **MANAGER**: Can manage warehouses, vendors, orders, shipments, and fares
- **USER**: Can view all data and create orders

## 📊 Database Schema

The system uses the following main entities:

- **Users**: System users with role-based access
- **Warehouses**: Physical storage locations
- **Vendors**: Vendor information and order processing
- **Orders**: Customer orders with delivery information
- **Shipments**: Shipment tracking and delivery
- **Fares**: Shipping fare calculation and management

## 🚀 Deployment

### Environment Variables

```bash
# Database
DATABASE_URL="postgresql://username@localhost:5432/logistics_db"

# JWT
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_EXPIRES_IN="7d"
REFRESH_TOKEN_TTL_SECONDS=2592000

# Server
PORT=3000
NODE_ENV="production"

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
CACHE_PREFIX=ecommerce_api

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@ecommerce.com
FRONTEND_URL=http://localhost:3001

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Production Setup

1. Set up PostgreSQL database
2. Set up Redis server
3. Configure environment variables
4. Run database migrations: `npm run db:push`
5. Start the server: `npm start`

## 🧪 Testing

The API includes comprehensive test coverage with 111 passing tests:

```bash
# Run all tests
npm test

# Run specific test file
npm test -- src/tests/routes/warehouses.test.js

# Run with coverage
npm run test:coverage
```

**Test Credentials:**
- **Admin**: admin@logistics.com / Password123!
- **Manager**: manager@logistics.com / Password123!
- **User**: user@logistics.com / Password123!

## 📝 API Response Format

All API responses follow this format:

**Success:**
```json
{
  "message": "Operation successful",
  "data": { ... },
  "pagination": { ... } // For paginated responses
}
```

**Error:**
```json
{
  "error": "Error type",
  "message": "Detailed error message"
}
```

**Cached Response Headers:**
```
X-Cache: HIT|MISS
X-Cache-Key: req:1234567890
X-Cache-Tags: warehouses,products
```

## 🔧 Development

### Available Scripts

- `npm start`: Start production server
- `npm run dev`: Start development server with nodemon
- `npm test`: Run test suite
- `npm run test:coverage`: Run tests with coverage
- `npm run db:generate`: Generate Prisma client
- `npm run db:push`: Push schema changes to database
- `npm run db:migrate`: Create and run migrations
- `npm run db:seed`: Seed database with sample data

### Project Structure

```
src/
├── config/          # Configuration files
│   ├── index.js     # Main configuration
│   ├── redis.js     # Redis configuration
│   └── test.js      # Test configuration
├── controllers/     # Route controllers
├── middleware/      # Custom middleware
│   ├── auth.js      # Authentication middleware
│   ├── cache.js     # Caching middleware
│   └── security.js  # Security middleware
├── routes/          # API routes
│   ├── auth.js      # Authentication routes
│   ├── warehouses.js # Warehouse routes
│   ├── vendors.js   # Vendor routes
│   ├── orders.js    # Order routes
│   ├── shipments.js # Shipment routes
│   ├── fares.js     # Fare routes
│   ├── security.js  # Security monitoring routes
│   └── queue.js     # Queue monitoring routes
├── services/        # Business logic services
│   ├── AuthService.js      # Authentication service
│   ├── CacheService.js     # Caching service
│   ├── EmailService.js     # Email service
│   └── QueueService.js     # Queue service
├── utils/           # Utility functions
│   ├── passwordSecurity.js # Password security
│   ├── securityLogger.js   # Security logging
│   └── databaseOptimization.js # Database optimization
├── tests/           # Test files
├── examples/        # Usage examples
└── server.js        # Main server file
```

## 🆕 Recent Updates

### v2.0.0 - Enterprise Features
- ✅ Redis-based caching system with tag invalidation
- ✅ BullMQ email queue for asynchronous processing
- ✅ Enhanced security with SQL injection prevention
- ✅ Strong password requirements and validation
- ✅ Multi-tier rate limiting and speed limiting
- ✅ Security headers and CSP protection
- ✅ Database optimization with deadlock prevention
- ✅ Comprehensive security logging and monitoring
- ✅ Queue monitoring and management endpoints
- ✅ Test configuration for development

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions, please open an issue in the repository.