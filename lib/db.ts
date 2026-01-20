import { Pool } from 'pg';
import { logger } from './logger';

let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
    logger.debug('[DB] Initializing database connection pool', { 
      hasDatabaseUrl: !!process.env.DATABASE_URL 
    });
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    pool.on('connect', () => {
      logger.debug('[DB] New client connected to database');
    });

    pool.on('error', (err: Error) => {
      logger.error('[DB] Unexpected database error', err);
    });
  }
  return pool;
}

export async function initializeDatabase() {
  logger.info('[DB] Starting database initialization');

  try {
    const dbPool = getPool();

    // Test connection first
    const testResult = await dbPool.query('SELECT NOW()');
    logger.debug('[DB] Connection test successful', { 
      currentTime: testResult.rows[0].now 
    });

    // Create users table
    await dbPool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        clerk_id TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        free_calls_remaining INTEGER DEFAULT 5,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    logger.debug('[DB] Users table created/verified');

    // Check if table has any data
    const countResult = await dbPool.query('SELECT COUNT(*) FROM users');
    logger.debug('[DB] Current user count', { 
      count: countResult.rows[0].count 
    });

    logger.info('[DB] Database initialization complete');
  } catch (error) {
    logger.error('[DB] Error initializing database', error);
    throw error;
  }
}

export { getPool as pool };
