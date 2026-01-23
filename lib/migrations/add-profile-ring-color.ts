/**
 * Migration: Add profile_ring_color column to users table
 * Run: npx tsx lib/migrations/add-profile-ring-color.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

import { pool } from '../db';

export async function addProfileRingColor() {
  console.log('[Migration] Adding profile_ring_color column to users table...');
  const client = await pool().connect();
  try {
    await client.query(`
      ALTER TABLE users
        ADD COLUMN IF NOT EXISTS profile_ring_color TEXT;
    `);
    console.log('[Migration] profile_ring_color column added successfully');
  } catch (error) {
    console.error('[Migration] Error:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run migration if executed directly
if (require.main === module) {
  addProfileRingColor()
    .then(() => {
      console.log('[Migration] Complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('[Migration] Failed:', error);
      process.exit(1);
    });
}
