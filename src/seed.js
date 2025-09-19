const bcrypt = require('bcryptjs');
const prisma = require('./config/database');

async function seed() {
  try {
    console.log('🌱 Starting database seeding...');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 12);
    const admin = await prisma.user.upsert({
      where: { email: 'admin@logistics.com' },
      update: {},
      create: {
        name: 'Admin User',
        email: 'admin@logistics.com',
        password: adminPassword,
        role: 'ADMIN'
      }
    });

    // Create manager user
    const managerPassword = await bcrypt.hash('manager123', 12);
    const manager = await prisma.user.upsert({
      where: { email: 'manager@logistics.com' },
      update: {},
      create: {
        name: 'Manager User',
        email: 'manager@logistics.com',
        password: managerPassword,
        role: 'MANAGER'
      }
    });

    // Create regular user
    const userPassword = await bcrypt.hash('user123', 12);
    const user = await prisma.user.upsert({
      where: { email: 'user@logistics.com' },
      update: {},
      create: {
        name: 'Regular User',
        email: 'user@logistics.com',
        password: userPassword,
        role: 'USER'
      }
    });

    // Create warehouses
    const warehouse1 = await prisma.warehouse.upsert({
      where: { id: 'warehouse-1' },
      update: {},
      create: {
        id: 'warehouse-1',
        name: 'Pokhara Main Hub',
        address: '123 Logistics Ave',
        city: 'Pokhara',
        state: 'Gandaki',
        country: 'Nepal',
        postalCode: '33700',
        capacity: 10000,
        isActive: true
      }
    });

    const warehouse2 = await prisma.warehouse.upsert({
      where: { id: 'warehouse-2' },
      update: {},
      create: {
        id: 'warehouse-2',
        name: 'Kathmandu Branch',
        address: '456 Shipping Blvd',
        city: 'Kathmandu',
        state: 'Bagmati',
        country: 'Nepal',
        postalCode: '44600',
        capacity: 8000,
        isActive: true
      }
    });

    // Create vendors
    const vendor1 = await prisma.vendor.upsert({
      where: { email: 'vendor1@example.com' },
      update: {},
      create: {
        name: 'Tech Solutions Pvt Ltd',
        email: 'vendor1@example.com',
        phone: '+977-61-123456',
        address: '789 Business St',
        city: 'Pokhara',
        state: 'Gandaki',
        country: 'Nepal',
        postalCode: '33700',
        isActive: true
      }
    });

    const vendor2 = await prisma.vendor.upsert({
      where: { email: 'vendor2@example.com' },
      update: {},
      create: {
        name: 'Electronics Hub',
        email: 'vendor2@example.com',
        phone: '+977-61-789012',
        address: '321 Tech Ave',
        city: 'Pokhara',
        state: 'Gandaki',
        country: 'Nepal',
        postalCode: '33700',
        isActive: true
      }
    });

    // Create fares
    const fare1 = await prisma.fare.upsert({
      where: {
        fromCity_toCity: {
          fromCity: 'Pokhara',
          toCity: 'Kathmandu'
        }
      },
      update: {},
      create: {
        fromCity: 'Pokhara',
        toCity: 'Kathmandu',
        branchDelivery: 150.00,
        codBranch: 200.00,
        doorDelivery: 300.00,
        isActive: true
      }
    });

    const fare2 = await prisma.fare.upsert({
      where: {
        fromCity_toCity: {
          fromCity: 'Pokhara',
          toCity: 'Chitwan'
        }
      },
      update: {},
      create: {
        fromCity: 'Pokhara',
        toCity: 'Chitwan',
        branchDelivery: 100.00,
        codBranch: 150.00,
        doorDelivery: 250.00,
        isActive: true
      }
    });

    const fare3 = await prisma.fare.upsert({
      where: {
        fromCity_toCity: {
          fromCity: 'Pokhara',
          toCity: 'Bharatpur'
        }
      },
      update: {},
      create: {
        fromCity: 'Pokhara',
        toCity: 'Bharatpur',
        branchDelivery: 80.00,
        codBranch: 120.00,
        doorDelivery: 200.00,
        isActive: true
      }
    });

    // Create sample order
    const order = await prisma.order.create({
      data: {
        orderNumber: `ORD-${Date.now()}`,
        vendorId: vendor1.id,
        userId: user.id,
        status: 'CONFIRMED',
        deliveryCity: 'Kathmandu',
        deliveryAddress: 'Thamel, Kathmandu 44600',
        contactNumber: '+977-98-1234567',
        name: 'Ram Shrestha',
        alternateContactNumber: '+977-98-7654321',
        amountToBeCollected: 5000.00,
        deliveryType: 'DOOR_DELIVERY',
        fareId: fare1.id,
        productWeight: 2.5,
        productType: 'Electronics',
        totalAmount: 5300.00, // 300 (fare) + 5000 (COD)
        notes: 'Sample order for testing - Electronics delivery'
      }
    });

    // Create sample shipment
    await prisma.shipment.create({
      data: {
        trackingNumber: `TRK-${Date.now()}`,
        orderId: order.id,
        warehouseId: warehouse1.id,
        userId: manager.id,
        status: 'PREPARING',
        carrier: 'FedEx',
        estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        weight: 2.7,
        dimensions: { length: 40, width: 30, height: 5 },
        notes: 'Handle with care - electronics'
      }
    });

    console.log('✅ Database seeded successfully!');
    console.log('\n📋 Sample Data Created:');
    console.log('👥 Users:');
    console.log('  - Admin: admin@logistics.com / admin123');
    console.log('  - Manager: manager@logistics.com / manager123');
    console.log('  - User: user@logistics.com / user123');
    console.log('\n🏢 Warehouses: 2 (Pokhara, Kathmandu)');
    console.log('🏪 Vendors: 2');
    console.log('💰 Fares: 3 routes (Pokhara to Kathmandu, Chitwan, Bharatpur)');
    console.log('📋 Orders: 1');
    console.log('🚚 Shipments: 1');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run seed if this file is executed directly
if (require.main === module) {
  seed()
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = seed;
