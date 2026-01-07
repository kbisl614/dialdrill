/**
 * Migration: Add gamification columns to users table
 * Run this once to add power level, streak, and badge tracking
 */

import { pool } from '../db';

export async function addGamificationColumns() {
  console.log('[Migration] Adding gamification columns to users table...');

  const dbPool = pool();

  try {
    // Add gamification columns to users table
    await dbPool.query(`
      -- Power Level & Belt System
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS power_level INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS current_tier TEXT DEFAULT 'Bronze',
      ADD COLUMN IF NOT EXISTS current_belt TEXT DEFAULT 'White';

      -- Streak System
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS longest_streak INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS last_login_date DATE,
      ADD COLUMN IF NOT EXISTS streak_multiplier DECIMAL(3,2) DEFAULT 1.00;

      -- Statistics
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS total_calls INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS total_minutes INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS total_badges_earned INTEGER DEFAULT 0;

      -- Member since (for display)
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS member_since TEXT;

      -- Update member_since for existing users based on created_at
      UPDATE users
      SET member_since = TO_CHAR(created_at, 'Month YYYY')
      WHERE member_since IS NULL;
    `);

    console.log('[Migration] Gamification columns added successfully');

    // Create user_badges table
    await dbPool.query(`
      CREATE TABLE IF NOT EXISTS user_badges (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        badge_id TEXT NOT NULL,
        earned_at TIMESTAMP DEFAULT NOW(),
        progress INTEGER DEFAULT 0,
        total INTEGER DEFAULT 0,
        UNIQUE(user_id, badge_id)
      );
    `);

    console.log('[Migration] user_badges table created successfully');

    // Create user_statistics table for detailed analytics
    await dbPool.query(`
      CREATE TABLE IF NOT EXISTS user_statistics (
        user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        average_score DECIMAL(5,2) DEFAULT 0,
        objection_success_rate DECIMAL(5,2) DEFAULT 0,
        closing_rate DECIMAL(5,2) DEFAULT 0,
        average_wpm INTEGER DEFAULT 0,
        filler_word_average DECIMAL(4,1) DEFAULT 0,
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    console.log('[Migration] user_statistics table created successfully');

    console.log('[Migration] ✓ All gamification tables ready');
  } catch (error) {
    console.error('[Migration] Error:', error);
    throw error;
  }
}

// Run migration if executed directly
if (require.main === module) {
  addGamificationColumns()
    .then(() => {
      console.log('[Migration] Complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('[Migration] Failed:', error);
      process.exit(1);
    });
}
