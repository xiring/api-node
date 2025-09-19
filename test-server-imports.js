// Test server imports step by step
console.log('Testing server imports...');

try {
  console.log('1. Testing express import...');
  const express = require('express');
  console.log('Express imported successfully');
  
  console.log('2. Testing cors import...');
  const cors = require('cors');
  console.log('Cors imported successfully');
  
  console.log('3. Testing helmet import...');
  const helmet = require('helmet');
  console.log('Helmet imported successfully');
  
  console.log('4. Testing morgan import...');
  const morgan = require('morgan');
  console.log('Morgan imported successfully');
  
  console.log('5. Testing dotenv import...');
  require('dotenv').config();
  console.log('Dotenv configured successfully');
  
  console.log('6. Testing config import...');
  const config = require('./src/config');
  console.log('Config imported successfully');
  
  console.log('7. Testing routes import...');
  const routes = require('./src/routes');
  console.log('Routes imported successfully');
  
  console.log('8. Testing error handler import...');
  const { errorHandler, notFound } = require('./src/middleware/errorHandler');
  console.log('Error handler imported successfully');
  
  console.log('\nAll server imports successful!');
} catch (error) {
  console.error('Server import error:', error.message);
  console.error('Stack:', error.stack);
}
