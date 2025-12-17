// Migration: Add entitlements model (Stripe tiers, personalities, call tracking)
const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function migrate() {
  console.log('🚀 Starting entitlements migration...\n');

  try {
    // 1. Add new columns to users table
    console.log('📝 Adding new columns to users table...');
    await pool.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
      ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'trial' CHECK (plan IN ('trial', 'paid')),
      ADD COLUMN IF NOT EXISTS subscription_status TEXT CHECK (subscription_status IN ('active', 'cancelled', 'past_due')),
      ADD COLUMN IF NOT EXISTS trial_purchases_count INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS trial_calls_remaining INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS tokens_remaining INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS subscription_id TEXT,
      ADD COLUMN IF NOT EXISTS billing_cycle_start TIMESTAMP;
    `);
    console.log('✓ Users table updated\n');

    // 2. Create personalities table
    console.log('📝 Creating personalities table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS personalities (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        agent_id TEXT NOT NULL,
        tier_required TEXT NOT NULL CHECK (tier_required IN ('trial', 'paid')),
        is_boss BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✓ Personalities table created\n');

    // 3. Create call_logs table
    console.log('📝 Creating call_logs table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS call_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        personality_id UUID REFERENCES personalities(id),
        conversation_id TEXT,
        duration_seconds INTEGER,
        tokens_used INTEGER,
        overage_charge DECIMAL(10, 2) DEFAULT 0,
        transcript JSONB,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✓ Call logs table created\n');

    // 4. Seed personalities data
    console.log('📝 Seeding personalities...');

    // Check if already seeded
    const existingCount = await pool.query('SELECT COUNT(*) FROM personalities');
    if (parseInt(existingCount.rows[0].count) === 0) {
      // Base personalities (available to trial + paid)
      await pool.query(`
        INSERT INTO personalities (name, description, agent_id, tier_required, is_boss) VALUES
        ('Josh', 'Local business owner running a small hardware store. Direct, practical, and focused on the bottom line.', 'agent_6701kchmqsvdfbatrfm00qe5xjgj', 'trial', false),
        ('Zenia', 'Foreign florist store owner with a warm accent and passion for flowers. Creative and detail-oriented.', 'agent_4201kchpssmrfs0v6zrqt7g99dmq', 'trial', false),
        ('Marcus', 'Experienced gym owner and fitness coach. High energy, motivational, and competitive.', 'agent_6701kchmqsvdfbatrfm00qe5xjgj', 'trial', false);
      `);

      // Premium boss personalities (paid only)
      await pool.query(`
        INSERT INTO personalities (name, description, agent_id, tier_required, is_boss) VALUES
        ('The Wolf', 'Legendary Wall Street closer. Aggressive, confident, and relentless. Closes deals at any cost.', 'agent_4201kchpssmrfs0v6zrqt7g99dmq', 'paid', true),
        ('The Motivator', 'Inspired by the greatest sales trainer of all time. Charismatic, inspiring, and believes in the power of attitude.', 'agent_6701kchmqsvdfbatrfm00qe5xjgj', 'paid', true),
        ('The Shark', 'Ruthless investor from the boardroom. Cuts through BS, demands numbers, and challenges every assumption.', 'agent_4201kchpssmrfs0v6zrqt7g99dmq', 'paid', true),
        ('The Oracle', 'Visionary tech founder. Thinks 10 years ahead, asks deep questions, and pushes you to think bigger.', 'agent_6701kchmqsvdfbatrfm00qe5xjgj', 'paid', true),
        ('The Titan', 'Fortune 500 CEO with decades of experience. Strategic, commanding, and expects excellence in every detail.', 'agent_4201kchpssmrfs0v6zrqt7g99dmq', 'paid', true);
      `);
      console.log('✓ 8 personalities seeded (3 base + 5 bosses)\n');
    } else {
      console.log('⚠️  Personalities already exist, skipping seed\n');
    }

    // 5. Migrate existing users
    console.log('📝 Migrating existing users to new schema...');
    await pool.query(`
      UPDATE users
      SET
        plan = 'trial',
        trial_calls_remaining = free_calls_remaining,
        trial_purchases_count = CASE WHEN free_calls_remaining > 0 THEN 1 ELSE 0 END
      WHERE plan IS NULL OR plan = 'trial';
    `);
    console.log('✓ Existing users migrated\n');

    // 6. Create indexes for performance
    console.log('📝 Creating indexes...');
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON users(clerk_id);
      CREATE INDEX IF NOT EXISTS idx_users_stripe_customer ON users(stripe_customer_id);
      CREATE INDEX IF NOT EXISTS idx_call_logs_user_id ON call_logs(user_id);
      CREATE INDEX IF NOT EXISTS idx_personalities_tier ON personalities(tier_required);
    `);
    console.log('✓ Indexes created\n');

    // 7. Verify migration
    console.log('🔍 Verifying migration...');
    const userCount = await pool.query('SELECT COUNT(*) FROM users');
    const personalityCount = await pool.query('SELECT COUNT(*) FROM personalities');
    const callLogCount = await pool.query('SELECT COUNT(*) FROM call_logs');

    console.log('✓ Users:', userCount.rows[0].count);
    console.log('✓ Personalities:', personalityCount.rows[0].count);
    console.log('✓ Call logs:', callLogCount.rows[0].count);

    await pool.end();
    console.log('\n✅ Migration completed successfully!');
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('Details:', error);
    await pool.end();
    process.exit(1);
  }
}

migrate();
