import mysql from 'mysql2/promise';

// Database configuration interface
export interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  connectionLimit: number;
  acquireTimeout: number;
  timeout: number;
}

// Load database configuration from environment variables
export const dbConfig: DatabaseConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'chris',
  password: process.env.DB_PASSWORD || 'AvaHazel2020!',
  database: process.env.DB_NAME || 'PrintMe',
  connectionLimit: 10,
  acquireTimeout: 60000,
  timeout: 60000,
};

// Create connection pool
let pool: mysql.Pool | null = null;

export const createPool = (): mysql.Pool => {
  if (!pool) {
    pool = mysql.createPool({
      ...dbConfig,
      waitForConnections: true,
      queueLimit: 0,
    });
  }
  return pool;
};

// Get database connection
export const getConnection = async (): Promise<mysql.PoolConnection> => {
  const pool = createPool();
  return await pool.getConnection();
};

// Execute query with connection handling
export const executeQuery = async <T = any>(
  query: string,
  params?: any[]
): Promise<T[]> => {
  const connection = await getConnection();
  try {
    const [rows] = await connection.execute(query, params);
    return rows as T[];
  } finally {
    connection.release();
  }
};

// Test database connection
export const testConnection = async (): Promise<boolean> => {
  try {
    const connection = await getConnection();
    await connection.ping();
    connection.release();
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
};

// Close all connections
export const closePool = async (): Promise<void> => {
  if (pool) {
    await pool.end();
    pool = null;
  }
};
