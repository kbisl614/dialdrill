/* eslint-disable @typescript-eslint/no-require-imports */
// Initialize database with users table
const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function initDatabase() {
  console.log('Initializing database...');

  try {
    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        clerk_id TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        free_calls_remaining INTEGER DEFAULT 5,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✓ Users table created successfully');

    // Verify
    const result = await pool.query('SELECT COUNT(*) FROM users');
    console.log('✓ Current user count:', result.rows[0].count);

    await pool.end();
    console.log('\n✓ Database initialized!');
  } catch (error) {
    console.error('✗ Error:', error.message);
    await pool.end();
    process.exit(1);
  }
}

initDatabase();
