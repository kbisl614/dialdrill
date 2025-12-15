// Add the current Clerk user to the database
const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Get the clerk_id from command line or use the one from logs
const clerkId = process.argv[2] || 'user_36jw2q2Xfyna39QviKrk0rCPtir';
const email = process.argv[3] || 'your-email@example.com';

async function addUser() {
  console.log('Adding user to database...');
  console.log('  clerk_id:', clerkId);
  console.log('  email:', email);

  try {
    await pool.query(
      'INSERT INTO users (clerk_id, email, free_calls_remaining) VALUES ($1, $2, $3) ON CONFLICT (clerk_id) DO NOTHING',
      [clerkId, email, 5]
    );
    console.log('✓ User added successfully!');

    const result = await pool.query('SELECT * FROM users WHERE clerk_id = $1', [clerkId]);
    console.log('✓ User data:', result.rows[0]);

    await pool.end();
    console.log('\n✓ Done! Refresh your dashboard to see your free calls.');
  } catch (error) {
    console.error('✗ Error:', error.message);
    await pool.end();
    process.exit(1);
  }
}

addUser();
