# Logistics Management System API

A comprehensive backend API for logistics management built with Node.js, Express, PostgreSQL, and Prisma ORM.

## 🚀 Features

- **User Management**: Authentication and role-based access control (Admin, Manager, User)
- **Warehouse Management**: CRUD operations for warehouse locations
- **Product Management**: Product catalog with SKU tracking
- **Customer Management**: Customer information and order history
- **Order Management**: Order processing and status tracking
- **Shipment Management**: Shipment tracking and delivery management
- **Inventory Management**: Real-time inventory tracking across warehouses
- **Security**: JWT authentication, rate limiting, input validation
- **API Documentation**: Comprehensive API endpoints with examples

## 🛠 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: Joi
- **Security**: Helmet, CORS, Rate Limiting
- **Logging**: Morgan

## 📋 Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
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

# Edit .env with your database credentials
DATABASE_URL="postgresql://username@localhost:5432/logistics_db"
JWT_SECRET="your-super-secret-jwt-key-here"
PORT=3000
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

### 4. Start the Server

```bash
# Development mode
npm run dev

# Production mode
npm start
```

The API will be available at `http://localhost:3000`

### 📚 API Documentation

Once the server is running, you can access the interactive API documentation:

- **Swagger UI**: `http://localhost:3000/api-docs`
- **API Health Check**: `http://localhost:3000/api/health`
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
| GET | `/profile` | Get user profile | Yes |

**Register Example:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "USER"
  }'
```

**Login Example:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

#### 🏢 Warehouses (`/api/warehouses`)

| Method | Endpoint | Description | Auth Required | Role Required |
|--------|----------|-------------|---------------|---------------|
| GET | `/` | Get all warehouses | Yes | Any |
| GET | `/:id` | Get warehouse by ID | Yes | Any |
| POST | `/` | Create warehouse | Yes | Admin/Manager |
| PUT | `/:id` | Update warehouse | Yes | Admin/Manager |
| DELETE | `/:id` | Delete warehouse | Yes | Admin |

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

#### 📦 Products (`/api/products`)

| Method | Endpoint | Description | Auth Required | Role Required |
|--------|----------|-------------|---------------|---------------|
| GET | `/` | Get all products | Yes | Any |
| GET | `/:id` | Get product by ID | Yes | Any |
| POST | `/` | Create product | Yes | Admin/Manager |
| PUT | `/:id` | Update product | Yes | Admin/Manager |
| DELETE | `/:id` | Delete product | Yes | Admin |

**Create Product Example:**
```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "name": "Wireless Headphones",
    "description": "High-quality wireless headphones",
    "sku": "HEADPHONES-001",
    "category": "Electronics",
    "weight": 0.3,
    "dimensions": {"length": 20, "width": 15, "height": 8},
    "unitPrice": 199.99
  }'
```

#### 👥 Customers (`/api/customers`)

| Method | Endpoint | Description | Auth Required | Role Required |
|--------|----------|-------------|---------------|---------------|
| GET | `/` | Get all customers | Yes | Any |
| GET | `/:id` | Get customer by ID | Yes | Any |
| POST | `/` | Create customer | Yes | Admin/Manager |
| PUT | `/:id` | Update customer | Yes | Admin/Manager |
| DELETE | `/:id` | Delete customer | Yes | Admin |

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
    "customerId": "customer-id",
    "notes": "Rush delivery",
    "orderItems": [
      {
        "productId": "product-id",
        "quantity": 2,
        "unitPrice": 99.99
      }
    ]
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
| GET | `/track/:trackingNumber` | Track shipment | No | Public |

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

#### 📊 Inventory (`/api/inventory`)

| Method | Endpoint | Description | Auth Required | Role Required |
|--------|----------|-------------|---------------|---------------|
| GET | `/` | Get all inventory | Yes | Any |
| GET | `/:id` | Get inventory by ID | Yes | Any |
| POST | `/` | Create inventory record | Yes | Admin/Manager |
| PUT | `/:id` | Update inventory record | Yes | Admin/Manager |
| DELETE | `/:id` | Delete inventory record | Yes | Admin |
| POST | `/:id/adjust` | Adjust inventory quantity | Yes | Admin/Manager |

**Adjust Inventory Example:**
```bash
curl -X POST http://localhost:3000/api/inventory/inventory-id/adjust \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "adjustment": -5,
    "reason": "Order fulfillment"
  }'
```

### Query Parameters

Most GET endpoints support pagination and filtering:

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `search`: Search term for text fields
- `isActive`: Filter by active status (true/false)
- `status`: Filter by specific status
- `warehouseId`: Filter by warehouse
- `customerId`: Filter by customer
- `lowStock`: Show only low stock items (inventory)

**Example:**
```bash
GET /api/products?page=1&limit=20&search=laptop&category=Electronics
GET /api/orders?status=PENDING&customerId=customer-123
GET /api/inventory?warehouseId=warehouse-1&lowStock=true
```

## 🔐 User Roles

- **ADMIN**: Full access to all operations
- **MANAGER**: Can manage warehouses, products, customers, orders, shipments, and inventory
- **USER**: Can view all data and create orders

## 📊 Database Schema

The system uses the following main entities:

- **Users**: System users with role-based access
- **Warehouses**: Physical storage locations
- **Products**: Product catalog with SKU tracking
- **Customers**: Customer information
- **Orders**: Customer orders with items
- **OrderItems**: Individual items within orders
- **Shipments**: Shipment tracking and delivery
- **Inventory**: Stock levels across warehouses

## 🚀 Deployment

### Environment Variables

```bash
# Database
DATABASE_URL="postgresql://username@localhost:5432/logistics_db"

# JWT
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_EXPIRES_IN="7d"

# Server
PORT=3000
NODE_ENV="production"

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Production Setup

1. Set up PostgreSQL database
2. Configure environment variables
3. Run database migrations: `npm run db:push`
4. Start the server: `npm start`

## 🧪 Testing

The API includes sample data seeded by default. Use these credentials for testing:

- **Admin**: admin@logistics.com / admin123
- **Manager**: manager@logistics.com / manager123
- **User**: user@logistics.com / user123

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

## 🔧 Development

### Available Scripts

- `npm start`: Start production server
- `npm run dev`: Start development server with nodemon
- `npm run db:generate`: Generate Prisma client
- `npm run db:push`: Push schema changes to database
- `npm run db:migrate`: Create and run migrations
- `npm run db:seed`: Seed database with sample data

### Project Structure

```
src/
├── config/          # Configuration files
├── controllers/     # Route controllers
├── middleware/      # Custom middleware
├── routes/          # API routes
├── seed.js          # Database seeding
└── server.js        # Main server file
```

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
