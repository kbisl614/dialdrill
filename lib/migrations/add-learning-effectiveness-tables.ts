/**
 * Migration: Add Learning Effectiveness Tables (Phase 3)
 * Creates tables for AI coaching, voice analytics, learning progress, and scenarios
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

import { pool } from '../db';

export async function addLearningEffectivenessTables() {
  console.log('[Migration] Adding Learning Effectiveness tables...');

  const dbPool = pool();

  try {
    // 1. Call Coaching Table - AI-generated coaching insights
    await dbPool.query(`
      CREATE TABLE IF NOT EXISTS call_coaching (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        call_log_id UUID NOT NULL REFERENCES call_logs(id) ON DELETE CASCADE UNIQUE,

        -- AI Analysis (JSONB structure for flexibility)
        strengths JSONB NOT NULL DEFAULT '[]',
        improvement_areas JSONB NOT NULL DEFAULT '[]',
        specific_examples JSONB DEFAULT '[]',
        recommended_practice JSONB DEFAULT '{}',
        suggested_phrases JSONB DEFAULT '[]',

        -- Detailed Category Coaching
        opening_feedback TEXT,
        discovery_feedback TEXT,
        objection_handling_feedback TEXT,
        closing_feedback TEXT,
        clarity_feedback TEXT,

        -- AI Metadata
        ai_model TEXT DEFAULT 'gpt-4-turbo',
        processing_time_ms INTEGER,
        confidence_score DECIMAL(3,2),
        tokens_used INTEGER,

        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_call_coaching_call_log_id ON call_coaching(call_log_id);
      CREATE INDEX IF NOT EXISTS idx_call_coaching_created_at ON call_coaching(created_at DESC);
    `);
    console.log('[Migration] ✓ call_coaching table created');

    // 2. Voice Analytics Table - Speech pattern analysis
    await dbPool.query(`
      CREATE TABLE IF NOT EXISTS voice_analytics (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        call_log_id UUID NOT NULL REFERENCES call_logs(id) ON DELETE CASCADE UNIQUE,

        -- Speech Metrics
        avg_speaking_pace INTEGER,
        pace_variability DECIMAL(5,2),
        filler_word_count INTEGER DEFAULT 0,
        filler_word_rate DECIMAL(5,4),
        pause_count INTEGER DEFAULT 0,
        avg_pause_duration_ms INTEGER,

        -- Conversation Flow
        turn_count INTEGER DEFAULT 0,
        avg_turn_length_words INTEGER,
        longest_turn_words INTEGER,
        interruption_count INTEGER DEFAULT 0,

        -- Tone & Energy
        energy_level TEXT,
        tone_consistency DECIMAL(3,2),

        -- Time Distribution
        user_talk_time_seconds INTEGER DEFAULT 0,
        agent_talk_time_seconds INTEGER DEFAULT 0,
        silence_time_seconds INTEGER DEFAULT 0,
        listening_ratio DECIMAL(3,2),

        -- Question Analytics
        question_count INTEGER DEFAULT 0,
        question_quality_score DECIMAL(4,2),

        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_voice_analytics_call_log_id ON voice_analytics(call_log_id);
      CREATE INDEX IF NOT EXISTS idx_voice_analytics_created_at ON voice_analytics(created_at DESC);
    `);
    console.log('[Migration] ✓ voice_analytics table created');

    // 3. Learning Progress Table - Track improvement over time
    await dbPool.query(`
      CREATE TABLE IF NOT EXISTS learning_progress (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,

        -- Skill Category Averages (last 10 calls)
        opening_avg_score DECIMAL(4,2) DEFAULT 0,
        discovery_avg_score DECIMAL(4,2) DEFAULT 0,
        objection_handling_avg_score DECIMAL(4,2) DEFAULT 0,
        clarity_avg_score DECIMAL(4,2) DEFAULT 0,
        closing_avg_score DECIMAL(4,2) DEFAULT 0,
        overall_avg_score DECIMAL(4,2) DEFAULT 0,

        -- Trends (comparing recent calls to previous period)
        opening_trend TEXT DEFAULT 'stable',
        discovery_trend TEXT DEFAULT 'stable',
        objection_handling_trend TEXT DEFAULT 'stable',
        clarity_trend TEXT DEFAULT 'stable',
        closing_trend TEXT DEFAULT 'stable',
        overall_trend TEXT DEFAULT 'stable',

        -- Historical Tracking
        previous_opening_avg DECIMAL(4,2),
        previous_discovery_avg DECIMAL(4,2),
        previous_objection_handling_avg DECIMAL(4,2),
        previous_clarity_avg DECIMAL(4,2),
        previous_closing_avg DECIMAL(4,2),

        -- Aggregate Stats
        total_calls_analyzed INTEGER DEFAULT 0,
        last_analyzed_call_id UUID REFERENCES call_logs(id),
        overall_improvement_rate DECIMAL(5,2),

        -- Focus Areas (AI-recommended)
        primary_focus_area TEXT,
        secondary_focus_area TEXT,

        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_learning_progress_user_id ON learning_progress(user_id);
    `);
    console.log('[Migration] ✓ learning_progress table created');

    // 4. Scenarios Table - Pre-built role-play scenarios
    await dbPool.query(`
      CREATE TABLE IF NOT EXISTS scenarios (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

        -- Basic Info
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        industry TEXT,
        difficulty_level TEXT NOT NULL,
        tier_required TEXT DEFAULT 'free',

        -- Scenario Details
        backstory TEXT NOT NULL,
        prospect_persona JSONB NOT NULL,
        objectives JSONB NOT NULL,
        bonus_goals JSONB DEFAULT '[]',

        -- Scoring Configuration
        scoring_criteria JSONB NOT NULL,
        passing_score DECIMAL(4,2) DEFAULT 7.0,

        -- AI Agent Configuration
        agent_instructions TEXT NOT NULL,
        agent_personality_traits JSONB DEFAULT '[]',

        -- Metadata
        estimated_duration_minutes INTEGER DEFAULT 10,
        tags JSONB DEFAULT '[]',
        is_active BOOLEAN DEFAULT TRUE,
        created_by TEXT,

        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_scenarios_difficulty ON scenarios(difficulty_level);
      CREATE INDEX IF NOT EXISTS idx_scenarios_industry ON scenarios(industry);
      CREATE INDEX IF NOT EXISTS idx_scenarios_is_active ON scenarios(is_active);
    `);
    console.log('[Migration] ✓ scenarios table created');

    // 5. User Scenario Attempts Table - Track scenario performance
    await dbPool.query(`
      CREATE TABLE IF NOT EXISTS user_scenario_attempts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        scenario_id UUID NOT NULL REFERENCES scenarios(id) ON DELETE CASCADE,
        call_log_id UUID NOT NULL REFERENCES call_logs(id) ON DELETE CASCADE,

        -- Performance
        score DECIMAL(4,2),
        passed BOOLEAN DEFAULT FALSE,
        objectives_completed JSONB DEFAULT '[]',
        bonus_goals_completed JSONB DEFAULT '[]',

        -- Analytics
        attempt_number INTEGER DEFAULT 1,
        time_to_complete_seconds INTEGER,

        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_user_scenario_attempts_user_id ON user_scenario_attempts(user_id);
      CREATE INDEX IF NOT EXISTS idx_user_scenario_attempts_scenario_id ON user_scenario_attempts(scenario_id);
      CREATE INDEX IF NOT EXISTS idx_user_scenario_attempts_call_log_id ON user_scenario_attempts(call_log_id);
    `);
    console.log('[Migration] ✓ user_scenario_attempts table created');

    // 6. Add new indexes to existing tables for performance
    await dbPool.query(`
      -- Optimize call_logs queries for learning analytics
      CREATE INDEX IF NOT EXISTS idx_call_logs_user_created ON call_logs(user_id, created_at DESC);

      -- Optimize call_scores queries
      CREATE INDEX IF NOT EXISTS idx_call_scores_overall ON call_scores(overall_score DESC);
    `);
    console.log('[Migration] ✓ Additional indexes created');

    console.log('[Migration] ✅ All Learning Effectiveness tables created successfully');
  } catch (error) {
    console.error('[Migration] Error:', error);
    throw error;
  }
}

// Run migration if executed directly
if (require.main === module) {
  addLearningEffectivenessTables()
    .then(() => {
      console.log('[Migration] Complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('[Migration] Failed:', error);
      process.exit(1);
    });
}
