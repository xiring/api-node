const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { prisma } = require('../../config/testDatabase');
const { USER_ROLES } = require('../../constants');
const config = require('../../config');

class TestHelpers {
  static async createTestUser(userData = {}) {
    const defaultUser = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: USER_ROLES.USER
    };

    const user = { ...defaultUser, ...userData };
    user.password = await bcrypt.hash(user.password, 12);

    return await prisma.user.create({
      data: user
    });
  }

  static async createTestAdmin(userData = {}) {
    const defaultAdmin = {
      name: 'Test Admin',
      email: 'admin@example.com',
      password: 'password123',
      role: USER_ROLES.ADMIN
    };

    const admin = { ...defaultAdmin, ...userData };
    admin.password = await bcrypt.hash(admin.password, 12);

    return await prisma.user.create({
      data: admin
    });
  }

  static async createTestManager(userData = {}) {
    const defaultManager = {
      name: 'Test Manager',
      email: 'manager@example.com',
      password: 'password123',
      role: USER_ROLES.MANAGER
    };

    const manager = { ...defaultManager, ...userData };
    manager.password = await bcrypt.hash(manager.password, 12);

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
      email: 'vendor@example.com',
      phone: '+977-1-1234567',
      address: 'Test Address',
      city: 'Kathmandu',
      state: 'Bagmati',
      country: 'Nepal',
      postalCode: '44600',
      isActive: true
    };

    return await prisma.vendor.create({
      data: { ...defaultVendor, ...vendorData }
    });
  }

  static async createTestFare(fareData = {}) {
    const defaultFare = {
      fromCity: 'Pokhara',
      toCity: 'Kathmandu',
      branchDelivery: 500.00,
      codBranch: 750.00,
      doorDelivery: 1000.00,
      isActive: true
    };

    return await prisma.fare.create({
      data: { ...defaultFare, ...fareData }
    });
  }

  static async createTestWarehouse(warehouseData = {}) {
    const defaultWarehouse = {
      name: 'Test Warehouse',
      address: 'Test Warehouse Address',
      city: 'Kathmandu',
      state: 'Bagmati',
      country: 'Nepal',
      postalCode: '44600',
      capacity: 10000.00,
      isActive: true
    };

    return await prisma.warehouse.create({
      data: { ...defaultWarehouse, ...warehouseData }
    });
  }

  static async createTestOrder(orderData = {}) {
    const vendor = await this.createTestVendor();
    const fare = await this.createTestFare();
    const user = await this.createTestUser();

    const defaultOrder = {
      orderNumber: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      vendorId: vendor.id,
      userId: user.id,
      status: 'PENDING',
      deliveryCity: 'Kathmandu',
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

    return await prisma.order.create({
      data: { ...defaultOrder, ...orderData }
    });
  }

  static async createTestShipment(shipmentData = {}) {
    const order = await this.createTestOrder();
    const warehouse = await this.createTestWarehouse();

    const defaultShipment = {
      orderId: order.id,
      warehouseId: warehouse.id,
      trackingNumber: `TRK-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      status: 'PREPARING',
      estimatedDeliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      notes: 'Test shipment notes'
    };

    return await prisma.shipment.create({
      data: { ...defaultShipment, ...shipmentData }
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
