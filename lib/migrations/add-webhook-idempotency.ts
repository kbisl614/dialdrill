/**
 * Migration: Add webhook idempotency table
 * Prevents duplicate processing of Stripe webhook events
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

import { pool } from '../db';

export async function addWebhookIdempotency() {
  console.log('[Migration] Creating processed_webhook_events table...');

  const dbPool = pool();

  try {
    // Create table for tracking processed webhook events
    await dbPool.query(`
      CREATE TABLE IF NOT EXISTS processed_webhook_events (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        event_id TEXT UNIQUE NOT NULL,
        event_type TEXT NOT NULL,
        processed_at TIMESTAMP DEFAULT NOW(),
        created_at TIMESTAMP DEFAULT NOW()
      );

      -- Index for fast lookups
      CREATE INDEX IF NOT EXISTS idx_processed_webhook_events_event_id 
        ON processed_webhook_events(event_id);
    `);

    console.log('[Migration] ✓ processed_webhook_events table ready');
  } catch (error) {
    console.error('[Migration] ✗ Error creating processed_webhook_events table:', error);
    throw error;
  }
}

// Run migration if called directly
if (require.main === module) {
  addWebhookIdempotency()
    .then(() => {
      console.log('[Migration] Migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('[Migration] Migration failed:', error);
      process.exit(1);
    });
}

