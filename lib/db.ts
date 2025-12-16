import { Pool } from 'pg';

let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
    console.log('[DB] Initializing database connection pool');
    console.log('[DB] DATABASE_URL exists:', !!process.env.DATABASE_URL);
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    pool.on('connect', () => {
      console.log('[DB] New client connected to database');
    });

    pool.on('error', (err: Error) => {
      console.error('[DB] Unexpected database error:', err);
    });
  }
  return pool;
}

export async function initializeDatabase() {
  console.log('[DB] Starting database initialization...');

  try {
    const dbPool = getPool();

    // Test connection first
    const testResult = await dbPool.query('SELECT NOW()');
    console.log('[DB] Connection test successful. Current time:', testResult.rows[0].now);

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
    console.log('[DB] Users table created/verified successfully');

    // Check if table has any data
    const countResult = await dbPool.query('SELECT COUNT(*) FROM users');
    console.log('[DB] Current user count:', countResult.rows[0].count);

    console.log('[DB] Database initialization complete ✓');
  } catch (error) {
    console.error('[DB] Error initializing database:', error);
    console.error('[DB] Error details:', error instanceof Error ? error.message : String(error));
    throw error;
  }
}

export { getPool as pool };
