/* eslint-disable @typescript-eslint/no-require-imports */
require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function setCreditsTo5() {
  try {
    const result = await pool.query(
      "UPDATE users SET free_calls_remaining = 5 RETURNING email, free_calls_remaining"
    );

    console.log('✓ Updated successfully:');
    result.rows.forEach(user => {
      console.log(`  ${user.email}: ${user.free_calls_remaining} credits`);
    });

    await pool.end();
  } catch (error) {
    console.error('Error:', error);
    await pool.end();
    process.exit(1);
  }
}

setCreditsTo5();
