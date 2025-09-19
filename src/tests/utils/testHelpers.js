const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { prisma } = require('../../config/testDatabase');
const { USER_ROLES } = require('../../constants');
const config = require('../../config');

class TestHelpers {
  static async createTestUser(userData = {}) {
    const defaultUser = {
      name: 'Test User',
      email: `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}@example.com`,
      password: 'password123',
      role: USER_ROLES.USER
    };

    const user = { ...defaultUser, ...userData };
    user.password = await bcrypt.hash(user.password, 12);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: user.email }
    });

    if (existingUser) {
      return existingUser;
    }

    return await prisma.user.create({
      data: user
    });
  }

  static async createTestAdmin(userData = {}) {
    const defaultAdmin = {
      name: 'Test Admin',
      email: `admin-${Date.now()}-${Math.random().toString(36).substr(2, 9)}@example.com`,
      password: 'password123',
      role: USER_ROLES.ADMIN
    };

    const admin = { ...defaultAdmin, ...userData };
    admin.password = await bcrypt.hash(admin.password, 12);

    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: admin.email }
    });

    if (existingAdmin) {
      return existingAdmin;
    }

    return await prisma.user.create({
      data: admin
    });
  }

  static async createTestManager(userData = {}) {
    const defaultManager = {
      name: 'Test Manager',
      email: `manager-${Date.now()}-${Math.random().toString(36).substr(2, 9)}@example.com`,
      password: 'password123',
      role: USER_ROLES.MANAGER
    };

    const manager = { ...defaultManager, ...userData };
    manager.password = await bcrypt.hash(manager.password, 12);

    // Check if manager already exists
    const existingManager = await prisma.user.findUnique({
      where: { email: manager.email }
    });

    if (existingManager) {
      return existingManager;
    }

    return await prisma.user.create({
      data: manager
    });
  }

  static generateAuthToken(user) {
    return jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role 
      },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
  }

  static async createTestVendor(vendorData = {}) {
    const defaultVendor = {
      name: 'Test Vendor',
      email: `vendor-${Date.now()}-${Math.random().toString(36).substr(2, 9)}@example.com`,
      phone: '+977-1-1234567',
      address: 'Test Address',
      city: 'Kathmandu',
      state: 'Bagmati',
      country: 'Nepal',
      postalCode: '44600',
      isActive: true
    };

    const finalVendorData = { ...defaultVendor, ...vendorData };

    // Check if vendor already exists
    const existingVendor = await prisma.vendor.findUnique({
      where: { email: finalVendorData.email }
    });

    if (existingVendor) {
      return existingVendor;
    }

    return await prisma.vendor.create({
      data: finalVendorData
    });
  }

  static async createTestFare(fareData = {}) {
    const defaultFare = {
      fromCity: 'Pokhara',
      toCity: fareData.toCity || `City-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      branchDelivery: 500.00,
      codBranch: 750.00,
      doorDelivery: 1000.00,
      isActive: true
    };

    const finalFareData = { ...defaultFare, ...fareData };

    // Check if fare already exists
    const existingFare = await prisma.fare.findFirst({
      where: {
        fromCity: finalFareData.fromCity,
        toCity: finalFareData.toCity
      }
    });

    if (existingFare) {
      return existingFare;
    }

    try {
      return await prisma.fare.create({
        data: finalFareData
      });
    } catch (error) {
      if (error.code === 'P2002') {
        // Unique constraint violation, try to find the existing fare
        const existingFare = await prisma.fare.findFirst({
          where: {
            fromCity: finalFareData.fromCity,
            toCity: finalFareData.toCity
          }
        });
        return existingFare;
      }
      throw error;
    }
  }

  static async createTestWarehouse(warehouseData = {}) {
    const defaultWarehouse = {
      name: 'Test Warehouse',
      address: 'Test Address',
      city: 'Kathmandu',
      state: 'Bagmati',
      country: 'Nepal',
      postalCode: '44600',
      capacity: 1000,
      isActive: true
    };

    const finalWarehouseData = { ...defaultWarehouse, ...warehouseData };

    // Check if warehouse already exists
    const existingWarehouse = await prisma.warehouse.findFirst({
      where: {
        name: finalWarehouseData.name,
        city: finalWarehouseData.city
      }
    });

    if (existingWarehouse) {
      return existingWarehouse;
    }

    return await prisma.warehouse.create({
      data: finalWarehouseData
    });
  }

  static async createTestOrder(orderData = {}) {
    // Use a transaction to ensure all dependencies are created atomically
    return await prisma.$transaction(async (tx) => {
      // Create vendor
      const vendor = await tx.vendor.create({
        data: {
          email: `vendor-${Date.now()}-${Math.random().toString(36).substr(2, 9)}@example.com`,
          name: 'Test Vendor',
          phone: '+977-1-1234567',
          address: 'Test Address',
          city: 'Kathmandu',
          state: 'Bagmati',
          country: 'Nepal',
          postalCode: '44600',
          isActive: true
        }
      });

      // Create user
      const user = await tx.user.create({
        data: {
          email: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}@example.com`,
          password: await bcrypt.hash('password123', 10),
          name: 'Test User',
          role: 'USER'
        }
      });

      // Create fare with unique route
      const randomSuffix = Math.random().toString(36).substr(2, 5);
      const fare = await tx.fare.create({
        data: {
          fromCity: `Pokhara-${randomSuffix}`,
          toCity: orderData.deliveryCity ? `${orderData.deliveryCity}-${randomSuffix}` : `Kathmandu-${randomSuffix}`,
          doorDelivery: 1000.00,
          branchDelivery: 500.00,
          codBranch: 750.00,
          isActive: true
        }
      });

      // Create order
      const defaultOrder = {
        orderNumber: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        vendorId: vendor.id,
        userId: user.id,
        status: 'PENDING',
        deliveryCity: orderData.deliveryCity || fare.toCity,
        deliveryAddress: 'Test Delivery Address',
        contactNumber: '+977-98-1234567',
        name: 'Test Customer',
        alternateContactNumber: '+977-98-7654321',
        amountToBeCollected: 5000.00,
        deliveryType: 'DOOR_DELIVERY',
        fareId: fare.id,
        productWeight: 2.5,
        productType: 'Electronics',
        totalAmount: 15000.00,
        notes: 'Test order notes'
      };

      return await tx.order.create({
        data: { ...defaultOrder, ...orderData }
      });
    });
  }

  static async createTestShipment(shipmentData = {}) {
    // Use a transaction to ensure all dependencies are created atomically
    return await prisma.$transaction(async (tx) => {
      // Create order with all its dependencies
      const order = await this.createTestOrder();
      
      // Create warehouse
      const warehouse = await tx.warehouse.create({
        data: {
          name: 'Test Warehouse',
          address: 'Test Warehouse Address',
          city: 'Kathmandu',
          state: 'Bagmati',
          country: 'Nepal',
          postalCode: '44600',
          capacity: 1000,
          isActive: true
        }
      });

      const defaultShipment = {
        orderId: order.id,
        warehouseId: warehouse.id,
        trackingNumber: `TRK-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        status: 'PREPARING',
        estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        notes: 'Test shipment notes'
      };

      return await tx.shipment.create({
        data: { ...defaultShipment, ...shipmentData }
      });
    });
  }

  static getAuthHeaders(token) {
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  static async cleanupTestData() {
    // Delete in reverse order of dependencies
    await prisma.shipment.deleteMany();
    await prisma.order.deleteMany();
    await prisma.fare.deleteMany();
    await prisma.warehouse.deleteMany();
    await prisma.vendor.deleteMany();
    await prisma.user.deleteMany();
  }
}

module.exports = TestHelpers;
