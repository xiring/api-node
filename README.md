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
- **CSV Reporting**: Asynchronous CSV exports via queue (downloadable)
- **Dashboards**: Summary metrics and trends (role-aware)
- **Enhanced Security**: SQL injection prevention, rate limiting, input validation, security headers
- **Activity Logs**: Database-backed request activity logs with filters and pagination
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
- **Logging**: Morgan, Custom Security Logger & Activity Logger

## 📋 Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- Redis (v6 or higher) - for caching and queue
- npm or yarn

## 🚀 Quick Start

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd api-node
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

# Run database migrations (Laravel-like)
npm run db:migrate

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

The API will be available at `http://localhost:3000`.

## 🆕 New Features

### 🧭 Database Migrations (Laravel-like)

Commands:

```bash
# Create a new migration from schema changes (dev)
npx prisma migrate dev --name your_change

# Run dev migrations
npm run db:migrate

# Deploy migrations (prod/CI)
npm run db:deploy

# Reset database and auto-seed (dangerous: drops data)
npm run db:reset

# Show migration status
npm run db:status
```

Notes:
- Initial migration has been created and baselined.
- Seeding runs via Prisma's seed hook and `src/seed.js`.

More details: `./docs/migrations.md`.

### 📝 Activity Logs

### 🔔 Domain Events & Observers

An internal EventBus publishes domain events; observers react asynchronously (similar to Laravel Events/Listeners).

Events:
- `auth.registered` — emitted after successful registration
- `auth.login` — emitted after successful login
- `order.created` — after order creation
- `order.updated` — after order update
- `shipment.created` — after shipment creation
- `shipment.updated` — after shipment update

Observers are registered in `src/server.js` and implemented under `src/observers/`.

Add a new observer:
```javascript
// src/observers/CustomObservers.js
module.exports = function registerCustom(eventBus) {
  eventBus.on('order.created', ({ order }) => {
    // do something
  });
};
```

Register it:
```javascript
// src/server.js
const registerCustom = require('./observers/CustomObservers');
registerCustom(EventBus);
```

See detailed docs: `./docs/events-observers.md`.

- Every HTTP request is captured by middleware and stored in the database (`activity_logs`).
- Fields: `userId`, `userEmail`, `method`, `path`, `route`, `statusCode`, `durationMs`, `ip`, `userAgent`, `referer`, `query`, `params`, `body`, `createdAt`.
- Sensitive fields are redacted in logs.
- View logs via the endpoint below.

Endpoint (Admin only):
```bash
GET /api/activity/logs?userId=&method=&statusCode=&path=&ip=&startDate=&endDate=&minDurationMs=&maxDurationMs=&page=1&limit=50
```

Example:
```bash
curl -G 'http://localhost:3000/api/activity/logs' \
  -H 'Authorization: Bearer <admin-token>' \
  --data-urlencode 'method=GET' \
  --data-urlencode 'statusCode=200' \
  --data-urlencode 'path=/api/orders' \
  --data-urlencode 'page=1' \
  --data-urlencode 'limit=20'
```

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
- **Security Logging**: Detailed audit trails and security event logging

### ⚡ Database Optimization

Performance and reliability improvements:

- **Deadlock Prevention**: Retry logic with exponential backoff
- **Connection Pooling**: Optimized database connections
- **Query Optimization**: Efficient database operations

## 📚 API Documentation

- **Swagger UI**: `http://localhost:3000/api-docs`
- **API Health Check**: `http://localhost:3000/api/health`
- **Security Monitoring**: `http://localhost:3000/api/security/health`
- **Queue Monitoring**: `http://localhost:3000/api/queue/status`
- **Root Endpoint**: `http://localhost:3000/`

### Base URL
`http://localhost:3000/api`

### 📊 CSV Report Export

Generate large CSV reports asynchronously using the queue, then download when ready.

- Supported report types:
  - `SHIPMENTS_STATUS`
  - `ORDERS_SUMMARY`
  - `COD_RECONCILIATION`
  - `WAREHOUSE_UTILIZATION`
  - `USER_ACTIVITY`

Enqueue export:
```bash
curl -X POST http://localhost:3000/api/reports/export \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "SHIPMENTS_STATUS",
    "filters": { "dateFrom": "2025-09-01", "dateTo": "2025-09-19", "status": ["DELIVERED"] },
    "delivery": "download"
  }'
```

Check status:
```bash
curl -X GET http://localhost:3000/api/reports/<jobId>/status \
  -H "Authorization: Bearer <token>"
```

Download CSV when ready:
```bash
curl -L -X GET http://localhost:3000/api/reports/<jobId>/download \
  -H "Authorization: Bearer <token>" -o report.csv
```

Notes:
- Access: Manager/Admin only
- Processing is chunked and streamed to a file in `reports/`

### 📈 Dashboard

Role-aware dashboard with summary totals, distributions, and daily trends.

- Access: Any authenticated user
- Vendor scope: Vendors see only their own data

Examples:
```bash
# Summary for last 7 days
curl -X GET 'http://localhost:3000/api/dashboard/summary?range=7d' \
  -H "Authorization: Bearer <token>"

# Trends (orders) for last 30 days
curl -X GET 'http://localhost:3000/api/dashboard/trends?metric=orders&range=30d' \
  -H "Authorization: Bearer <token>"
```

### Authentication

All endpoints (except auth and public tracking) require authentication via JWT token.

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

### Endpoints Overview

#### 📝 Activity (`/api/activity`)

| Method | Endpoint | Description | Auth Required | Role Required |
|--------|----------|-------------|---------------|---------------|
| GET | `/logs` | List activity logs with filters | Yes | Admin |

Filters: `userId`, `method`, `statusCode`, `path`, `ip`, `startDate`, `endDate`, `minDurationMs`, `maxDurationMs`, `page`, `limit`.

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

#### 🗂 Reports (`/api/reports`)

| Method | Endpoint | Description | Auth Required | Role Required |
|--------|----------|-------------|---------------|---------------|
| POST | `/export` | Enqueue CSV report export | Yes | Manager/Admin |
| GET | `/:jobId/status` | Get export job status | Yes | Manager/Admin |
| GET | `/:jobId/download` | Download generated CSV | Yes | Manager/Admin |

#### 📊 Dashboard (`/api/dashboard`)

| Method | Endpoint | Description | Auth Required | Role Required |
|--------|----------|-------------|---------------|---------------|
| GET | `/summary` | Summary metrics and distributions | Yes | Any |
| GET | `/trends` | Trend series (orders/shipments/delivered) | Yes | Any |

#### 🏢 Warehouses (`/api/warehouses`)

| Method | Endpoint | Description | Auth Required | Role Required | Cached |
|--------|----------|-------------|---------------|---------------|--------|
| GET | `/` | Get all warehouses | Yes | Any | ✅ (30min) |
| GET | `/:id` | Get warehouse by ID | Yes | Any | ✅ (1hr) |
| POST | `/` | Create warehouse | Yes | Admin/Manager | ❌ |
| PUT | `/:id` | Update warehouse | Yes | Admin/Manager | ❌ |
| DELETE | `/:id` | Delete warehouse | Yes | Admin | ❌ |
| GET | `/city/:city` | Get warehouses by city | Yes | Any | ✅ (30min) |

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

#### 🚚 Shipments (`/api/shipments`)

| Method | Endpoint | Description | Auth Required | Role Required |
|--------|----------|-------------|---------------|---------------|
| GET | `/` | Get all shipments | Yes | Any |
| GET | `/:id` | Get shipment by ID | Yes | Any |
| POST | `/` | Create shipment | Yes | Admin/Manager |
| PUT | `/:id` | Update shipment | Yes | Admin/Manager |
| DELETE | `/:id` | Delete shipment | Yes | Admin |
| GET | `/tracking/:trackingNumber` | Track shipment | No | Public |

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

Key entities include Users, Warehouses, Vendors, Orders, Shipments, Fares, and Activity Logs.

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
CACHE_PREFIX=api_node

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
4. Deploy database migrations: `npm run db:deploy`
5. Start the server: `npm start`

## 🧪 Testing

The API includes comprehensive test coverage with 125 passing tests:

```bash
# Run all tests
npm test

# Run specific test file
npm test -- src/tests/routes/warehouses.test.js

# Run with coverage
npm run test:coverage
```

## 🆕 Recent Updates

- ✅ Database-backed Activity Logs with admin endpoint `/api/activity/logs`
- ✅ Tests and CI-ready test DB setup

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.