// Test route imports
console.log('Testing route imports...');

try {
  const WarehouseController = require('./src/controllers/WarehouseController');
  console.log('WarehouseController imported successfully');
  console.log('getWarehousesByCity:', typeof WarehouseController.getWarehousesByCity);
  
  const { authenticateToken } = require('./src/middleware/auth');
  console.log('authenticateToken imported successfully');
  console.log('authenticateToken:', typeof authenticateToken);
  
  const { validateWarehouseQuery } = require('./src/validators/warehouseValidator');
  console.log('validateWarehouseQuery imported successfully');
  console.log('validateWarehouseQuery:', typeof validateWarehouseQuery);
  
  console.log('\nAll imports successful!');
} catch (error) {
  console.error('Import error:', error.message);
  console.error('Stack:', error.stack);
}
