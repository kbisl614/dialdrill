/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Add call_scores table to store post-call scoring data.
 *
 * Run: node add-call-scores-table.js
 */
const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function addCallScoresTable() {
  console.log('Adding call_scores table...\n');

  try {
    // Create call_scores table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS call_scores (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        call_log_id UUID NOT NULL REFERENCES call_logs(id) ON DELETE CASCADE,

        -- Overall score
        overall_score DECIMAL(4, 1) NOT NULL,

        -- Category scores (stored as JSONB for flexibility)
        category_scores JSONB NOT NULL,

        -- Metadata (call statistics)
        metadata JSONB NOT NULL,

        -- Timestamps
        created_at TIMESTAMP DEFAULT NOW(),

        -- Ensure one score per call
        UNIQUE(call_log_id)
      );
    `);
    console.log('✓ call_scores table created\n');

    // Create index on call_log_id for fast lookups
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_call_scores_call_log_id
      ON call_scores(call_log_id);
    `);
    console.log('✓ Index on call_log_id created\n');

    // Verify
    const result = await pool.query('SELECT COUNT(*) FROM call_scores');
    console.log('✓ Current score count:', result.rows[0].count);

    await pool.end();
    console.log('\n✓ Database migration completed!');
  } catch (error) {
    console.error('✗ Error:', error.message);
    await pool.end();
    process.exit(1);
  }
}

addCallScoresTable();
