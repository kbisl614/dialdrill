/**
 * Migration: Add call session protection columns
 * Prevents call refresh/restart loopholes and tracks call state
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

import { pool } from '../db';

export async function addCallSessionProtection() {
  console.log('[Migration] Adding call session protection columns...');

  const dbPool = pool();

  try {
    // Add call status tracking
    await dbPool.query(`
      ALTER TABLE call_logs
      ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'abandoned', 'failed')),
      ADD COLUMN IF NOT EXISTS session_started_at TIMESTAMP,
      ADD COLUMN IF NOT EXISTS session_ended_at TIMESTAMP,
      ADD COLUMN IF NOT EXISTS signed_url TEXT,
      ADD COLUMN IF NOT EXISTS signed_url_expires_at TIMESTAMP,
      ADD COLUMN IF NOT EXISTS transcript_saved BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS credits_refunded BOOLEAN DEFAULT false;
    `);

    // Create index for active call lookups
    await dbPool.query(`
      CREATE INDEX IF NOT EXISTS idx_call_logs_user_status 
        ON call_logs(user_id, status) 
        WHERE status IN ('pending', 'active');
    `);

    // Create index for preventing duplicate signed URLs
    await dbPool.query(`
      CREATE INDEX IF NOT EXISTS idx_call_logs_signed_url 
        ON call_logs(signed_url) 
        WHERE signed_url IS NOT NULL;
    `);

    console.log('[Migration] ✓ Call session protection columns added');
  } catch (error) {
    console.error('[Migration] ✗ Error adding call session protection:', error);
    throw error;
  }
}

// Run migration if called directly
if (require.main === module) {
  addCallSessionProtection()
    .then(() => {
      console.log('[Migration] Migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('[Migration] Migration failed:', error);
      process.exit(1);
    });
}

