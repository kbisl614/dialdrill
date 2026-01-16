/**
 * Migration: Add privacy columns to users table
 * Run this once to add profile visibility and stats privacy controls
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

import { pool } from '../db';

export async function addPrivacyColumns() {
  console.log('[Migration] Adding privacy columns to users table...');

  const dbPool = pool();

  try {
    // Add privacy columns to users table
    await dbPool.query(`
      -- Privacy Controls
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS profile_visibility TEXT DEFAULT 'public',
      ADD COLUMN IF NOT EXISTS show_stats_publicly BOOLEAN DEFAULT TRUE,
      ADD COLUMN IF NOT EXISTS show_on_leaderboard BOOLEAN DEFAULT TRUE,
      ADD COLUMN IF NOT EXISTS privacy_updated_at TIMESTAMP;

      -- Add CHECK constraint for profile_visibility if it doesn't exist
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint
          WHERE conname = 'users_profile_visibility_check'
        ) THEN
          ALTER TABLE users
          ADD CONSTRAINT users_profile_visibility_check
          CHECK (profile_visibility IN ('public', 'private'));
        END IF;
      END $$;
    `);

    console.log('[Migration] Privacy columns added successfully');
    console.log('[Migration] ✓ Privacy columns ready');
  } catch (error) {
    console.error('[Migration] Error:', error);
    throw error;
  }
}

// Run migration if executed directly
if (require.main === module) {
  addPrivacyColumns()
    .then(() => {
      console.log('[Migration] Complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('[Migration] Failed:', error);
      process.exit(1);
    });
}
