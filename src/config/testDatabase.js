const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.TEST_DATABASE_URL || 'postgresql://postgres@localhost:5433/logistics_test_db'
    }
  },
  log: ['error']
});

// Clean up database before each test
const cleanDatabase = async () => {
  try {
    // Delete in reverse order of dependencies
    await prisma.shipment.deleteMany();
    await prisma.order.deleteMany();
    await prisma.fare.deleteMany();
    await prisma.warehouse.deleteMany();
    await prisma.vendor.deleteMany();
    await prisma.user.deleteMany();
  } catch (error) {
    console.log('Database cleanup error:', error.message);
  }
};

// Close database connection
const closeDatabase = async () => {
  await prisma.$disconnect();
};

module.exports = {
  prisma,
  cleanDatabase,
  closeDatabase
};
