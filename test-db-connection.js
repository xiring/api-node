// Test database connection
require('dotenv').config();

console.log('Testing database connection...');
console.log('DATABASE_URL:', process.env.DATABASE_URL);

try {
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  
  console.log('Prisma client created successfully');
  
  // Test connection
  prisma.$connect()
    .then(() => {
      console.log('Database connected successfully');
      return prisma.$disconnect();
    })
    .then(() => {
      console.log('Database disconnected successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Database connection error:', error.message);
      process.exit(1);
    });
} catch (error) {
  console.error('Error creating Prisma client:', error.message);
  process.exit(1);
}
