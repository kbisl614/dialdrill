/**
 * Migration: Add notifications table
 * Run this to add the notifications system
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

import { pool } from '../db';

export async function addNotificationsTable() {
  console.log('[Migration] Adding notifications table...');

  const dbPool = pool();

  try {
    // Create notifications table
    await dbPool.query(`
      CREATE TABLE IF NOT EXISTS user_notifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        metadata JSONB,
        read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW(),
        read_at TIMESTAMP
      );

      -- Index for faster queries
      CREATE INDEX IF NOT EXISTS idx_user_notifications_user_id ON user_notifications(user_id);
      CREATE INDEX IF NOT EXISTS idx_user_notifications_read ON user_notifications(user_id, read);
      CREATE INDEX IF NOT EXISTS idx_user_notifications_created_at ON user_notifications(created_at DESC);
    `);

    console.log('[Migration] ✓ Notifications table created successfully');
  } catch (error) {
    console.error('[Migration] Error:', error);
    throw error;
  }
}

// Run migration if executed directly
if (require.main === module) {
  addNotificationsTable()
    .then(() => {
      console.log('[Migration] Complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('[Migration] Failed:', error);
      process.exit(1);
    });
}
