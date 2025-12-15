const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_NRgOV6Bb3spS@ep-purple-math-ahduqk4g-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require',
});

async function setUnlimitedCalls() {
  try {
    const result = await pool.query(
      "UPDATE users SET free_calls_remaining = 999 WHERE clerk_id = 'user_36qruKNiEGhN68PKbgDnCBkHgXH' RETURNING email, free_calls_remaining"
    );

    console.log('✓ Updated successfully:');
    console.log(result.rows[0]);

    await pool.end();
  } catch (error) {
    console.error('Error:', error);
    await pool.end();
    process.exit(1);
  }
}

setUnlimitedCalls();
