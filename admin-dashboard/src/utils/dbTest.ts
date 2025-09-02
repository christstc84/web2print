import { DatabaseService } from '../services/database';

// Test database connection and basic operations
export const testDatabaseConnection = async (): Promise<void> => {
  console.log('🔍 Testing database connection...');
  
  try {
    // Test basic connection
    const isConnected = await DatabaseService.testConnection();
    
    if (!isConnected) {
      console.error('❌ Failed to connect to database');
      return;
    }

    // Test basic query
    console.log('📊 Testing basic queries...');
    
    // Test if tables exist
    const tables = await DatabaseService.query(`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = 'PrintMe'
    `);
    
    console.log('📋 Available tables:', tables.map((t: any) => t.TABLE_NAME));

    // Test items query if table exists
    const hasItemsTable = tables.some((t: any) => t.TABLE_NAME === 'items');
    if (hasItemsTable) {
      const itemCount = await DatabaseService.query(`SELECT COUNT(*) as count FROM items`);
      console.log('📦 Items in database:', itemCount[0]?.count || 0);
    }

    console.log('✅ Database connection test completed successfully');
    
  } catch (error) {
    console.error('❌ Database connection test failed:', error);
  }
};

// Initialize database connection on app start
export const initializeDatabase = async (): Promise<boolean> => {
  try {
    console.log('🚀 Initializing database connection...');
    await testDatabaseConnection();
    return true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    return false;
  }
};
