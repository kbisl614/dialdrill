/* eslint-disable @typescript-eslint/no-require-imports */
// Test database connection
const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function testConnection() {
  console.log('Testing database connection...');
  console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);

  try {
    // Test connection
    const result = await pool.query('SELECT NOW()');
    console.log('✓ Connection successful!');
    console.log('  Current time:', result.rows[0].now);

    // Check if users table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'users'
      );
    `);
    console.log('✓ Users table exists:', tableCheck.rows[0].exists);

    if (tableCheck.rows[0].exists) {
      // Count users
      const countResult = await pool.query('SELECT COUNT(*) FROM users');
      console.log('  Total users:', countResult.rows[0].count);

      // List all users
      const usersResult = await pool.query('SELECT clerk_id, email, free_calls_remaining, created_at FROM users');
      console.log('  Users in database:');
      usersResult.rows.forEach(user => {
        console.log(`    - ${user.email} (clerk_id: ${user.clerk_id}, calls: ${user.free_calls_remaining})`);
      });
    }

    await pool.end();
    console.log('\n✓ All tests passed!');
  } catch (error) {
    console.error('✗ Error:', error.message);
    console.error('  Details:', error);
    await pool.end();
    process.exit(1);
  }
}

testConnection();
