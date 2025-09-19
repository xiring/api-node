# Testing Documentation

## Overview

This project includes comprehensive unit tests for all API routes using Jest and Supertest. The tests use a separate test database to ensure data isolation and prevent interference with development data.

## Test Structure

```
src/tests/
├── config/
│   └── testConfig.js          # Test environment configuration
├── routes/
│   ├── auth.test.js          # Authentication route tests
│   ├── vendors.test.js       # Vendor route tests
│   ├── fares.test.js         # Fare route tests
│   ├── orders.test.js        # Order route tests
│   ├── warehouses.test.js    # Warehouse route tests
│   └── shipments.test.js     # Shipment route tests
├── utils/
│   └── testHelpers.js        # Test utility functions
├── setup.js                  # Jest setup configuration
└── setupTestDb.js            # Test database setup script
```

## Test Database

The tests use a separate PostgreSQL database (`logistics_test_db`) to ensure:
- Data isolation from development database
- Clean state for each test
- No interference with development data
- Parallel test execution capability

## Test Coverage

### Authentication Routes (`/api/auth`)
- ✅ User registration (valid/invalid data)
- ✅ User login (valid/invalid credentials)
- ✅ Profile retrieval (authenticated/unauthenticated)
- ✅ Role-based access control
- ✅ Input validation
- ✅ Error handling

### Vendor Routes (`/api/vendors`)
- ✅ Get all vendors (with pagination and filtering)
- ✅ Get vendor by ID
- ✅ Create vendor (role-based access)
- ✅ Update vendor (role-based access)
- ✅ Delete vendor (role-based access)
- ✅ Get vendors by city
- ✅ Search functionality
- ✅ Input validation
- ✅ Error handling

### Fare Routes (`/api/fares`)
- ✅ Get all fares (with pagination and filtering)
- ✅ Get fare by ID
- ✅ Create fare (role-based access)
- ✅ Update fare (role-based access)
- ✅ Delete fare (role-based access)
- ✅ Get fare by route
- ✅ Duplicate route prevention
- ✅ Input validation
- ✅ Error handling

### Order Routes (`/api/orders`)
- ✅ Get all orders (with pagination and filtering)
- ✅ Get order by ID
- ✅ Create order (with fare calculation)
- ✅ Update order (role-based access)
- ✅ Delete order (role-based access)
- ✅ Different delivery types
- ✅ Fare calculation logic
- ✅ Input validation
- ✅ Error handling

### Warehouse Routes (`/api/warehouses`)
- ✅ Get all warehouses (with pagination and filtering)
- ✅ Get warehouse by ID
- ✅ Create warehouse (role-based access)
- ✅ Update warehouse (role-based access)
- ✅ Delete warehouse (role-based access)
- ✅ Get warehouses by city
- ✅ Search functionality
- ✅ Input validation
- ✅ Error handling

### Shipment Routes (`/api/shipments`)
- ✅ Get all shipments (with pagination and filtering)
- ✅ Get shipment by ID
- ✅ Get shipment by tracking number
- ✅ Create shipment (role-based access)
- ✅ Update shipment (role-based access)
- ✅ Delete shipment (role-based access)
- ✅ Status transitions
- ✅ Input validation
- ✅ Error handling

## Running Tests

### Prerequisites

1. **PostgreSQL Database**: Ensure PostgreSQL is running on port 5433
2. **Test Database**: The test database will be created automatically
3. **Dependencies**: All test dependencies are installed

### Test Commands

```bash
# Setup test database (run once)
npm run test:setup

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run tests for CI/CD
npm run test:ci
```

### Individual Test Files

```bash
# Run specific test file
npm test -- auth.test.js

# Run tests matching pattern
npm test -- --testNamePattern="should create user"

# Run tests in specific directory
npm test -- routes/
```

## Test Configuration

### Jest Configuration (`jest.config.js`)
- **Test Environment**: Node.js
- **Setup Files**: `src/tests/setup.js`
- **Test Match**: `**/src/tests/**/*.test.js`
- **Coverage**: Excludes test files and setup scripts
- **Timeout**: 30 seconds per test
- **Verbose**: Detailed output

### Test Database Configuration
- **Host**: localhost
- **Port**: 5433
- **Database**: logistics_test_db
- **User**: postgres
- **Password**: (none required)

## Test Utilities

### TestHelpers Class
Provides utility methods for creating test data:

```javascript
// Create test users
await TestHelpers.createTestUser(userData);
await TestHelpers.createTestAdmin(userData);
await TestHelpers.createTestManager(userData);

// Create test entities
await TestHelpers.createTestVendor(vendorData);
await TestHelpers.createTestFare(fareData);
await TestHelpers.createTestWarehouse(warehouseData);
await TestHelpers.createTestOrder(orderData);
await TestHelpers.createTestShipment(shipmentData);

// Generate auth tokens
const token = TestHelpers.generateAuthToken(user);

// Get auth headers
const headers = TestHelpers.getAuthHeaders(token);
```

## Test Data Management

### Database Cleanup
- **Before Each Test**: Database is cleaned to ensure test isolation
- **After All Tests**: Database is cleaned and connection closed
- **Cleanup Order**: Dependencies are deleted in reverse order

### Test Data Isolation
- Each test creates its own data
- No shared state between tests
- Clean database state for each test
- Parallel test execution support

## Coverage Reports

The test suite provides comprehensive coverage reports:

```bash
# Generate coverage report
npm run test:coverage

# View HTML coverage report
open coverage/lcov-report/index.html
```

### Coverage Targets
- **Statements**: > 90%
- **Branches**: > 85%
- **Functions**: > 90%
- **Lines**: > 90%

## CI/CD Integration

### GitHub Actions Example
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:13
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:ci
```

## Best Practices

### Test Organization
- One test file per route group
- Descriptive test names
- Arrange-Act-Assert pattern
- Independent test cases

### Test Data
- Use TestHelpers for consistent data creation
- Clean up after each test
- Use meaningful test data
- Avoid hardcoded values

### Error Testing
- Test both success and error cases
- Verify error messages and status codes
- Test input validation
- Test authorization and authentication

### Performance
- Use database transactions for faster cleanup
- Parallel test execution
- Efficient test data creation
- Minimal test setup/teardown

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Ensure PostgreSQL is running
   - Check database credentials
   - Verify test database exists

2. **Test Timeout Errors**
   - Increase Jest timeout
   - Check for hanging database connections
   - Verify test cleanup

3. **Port Already in Use**
   - Kill existing processes on test port
   - Use different port for tests
   - Check for running test processes

4. **Test Data Conflicts**
   - Ensure proper database cleanup
   - Check for unique constraint violations
   - Verify test isolation

### Debug Mode

```bash
# Run tests with debug output
DEBUG=* npm test

# Run specific test with debug
DEBUG=* npm test -- --testNamePattern="should create user"
```

## Contributing

When adding new tests:

1. Follow existing test patterns
2. Use TestHelpers for data creation
3. Test both success and error cases
4. Include proper cleanup
5. Add meaningful test descriptions
6. Update this documentation

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Prisma Testing Guide](https://www.prisma.io/docs/guides/testing)
- [Node.js Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
