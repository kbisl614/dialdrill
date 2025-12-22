/* eslint-disable @typescript-eslint/no-require-imports */
// Create a test user in the database
const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function createTestUser() {
  const testClerkId = 'user_test123abc';
  const testEmail = 'test@dialdrill.com';

  console.log('Creating test user...');
  console.log('  clerk_id:', testClerkId);
  console.log('  email:', testEmail);

  try {
    // Insert test user
    await pool.query(
      'INSERT INTO users (clerk_id, email, free_calls_remaining) VALUES ($1, $2, $3) ON CONFLICT (clerk_id) DO NOTHING',
      [testClerkId, testEmail, 5]
    );
    console.log('✓ Test user created/updated');

    // Verify
    const result = await pool.query('SELECT * FROM users WHERE clerk_id = $1', [testClerkId]);
    console.log('✓ User data:', result.rows[0]);

    await pool.end();
    console.log('\n✓ Done! Use this clerk_id for testing:', testClerkId);
  } catch (error) {
    console.error('✗ Error:', error.message);
    await pool.end();
    process.exit(1);
  }
}

createTestUser();
