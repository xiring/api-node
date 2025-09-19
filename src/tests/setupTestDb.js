const { execSync } = require('child_process');
const { PrismaClient } = require('@prisma/client');

const testDbUrl = process.env.TEST_DATABASE_URL || 'postgresql://postgres@localhost:5433/logistics_test_db';

async function setupTestDatabase() {
  console.log('Setting up test database...');
  
  try {
    // Create test database if it doesn't exist
    const createDbCommand = `createdb -h localhost -p 5433 -U postgres logistics_test_db 2>/dev/null || echo "Database already exists"`;
    execSync(createDbCommand, { stdio: 'inherit' });
    
    // Generate Prisma client for test database
    process.env.DATABASE_URL = testDbUrl;
    execSync('npx prisma generate', { stdio: 'inherit' });
    
    // Push schema to test database
    execSync('npx prisma db push --force-reset', { stdio: 'inherit' });
    
    console.log('✅ Test database setup completed successfully!');
  } catch (error) {
    console.error('❌ Error setting up test database:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  setupTestDatabase();
}

module.exports = setupTestDatabase;
