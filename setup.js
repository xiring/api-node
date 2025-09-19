#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Logistics Management System API...\n');

// Check if .env exists
if (!fs.existsSync('.env')) {
  console.log('📝 Creating .env file from template...');
  fs.copyFileSync('env.example', '.env');
  console.log('✅ .env file created. Please update with your database credentials.\n');
} else {
  console.log('✅ .env file already exists.\n');
}

// Install dependencies
console.log('📦 Installing dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencies installed successfully.\n');
} catch (error) {
  console.error('❌ Error installing dependencies:', error.message);
  process.exit(1);
}

// Generate Prisma client
console.log('🔧 Generating Prisma client...');
try {
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma client generated.\n');
} catch (error) {
  console.error('❌ Error generating Prisma client:', error.message);
  console.log('Please make sure your DATABASE_URL in .env is correct.\n');
}

console.log('🎉 Setup completed!');
console.log('\n📋 Next steps:');
console.log('1. Update your .env file with correct database credentials');
console.log('2. Make sure PostgreSQL is running');
console.log('3. Run: npm run db:push (to create database tables)');
console.log('4. Run: npm run db:seed (to add sample data)');
console.log('5. Run: npm run dev (to start development server)');
console.log('\n🔗 API will be available at: http://localhost:3000/api');
console.log('📖 Health check: http://localhost:3000/api/health');
