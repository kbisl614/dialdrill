/* eslint-disable @typescript-eslint/no-require-imports */
// Update personality names to match current agents
const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function updatePersonalityNames() {
  console.log('🚀 Updating personality names...\n');

  try {
    // Update base personalities (trial tier)
    console.log('📝 Updating trial tier personalities...');

    await pool.query(`
      UPDATE personalities
      SET name = 'Josh'
      WHERE tier_required = 'trial' AND is_boss = false
      AND name = 'Josh';
    `);

    await pool.query(`
      UPDATE personalities
      SET name = 'zenia'
      WHERE tier_required = 'trial' AND is_boss = false
      AND name = 'Zenia';
    `);

    await pool.query(`
      UPDATE personalities
      SET name = 'Marcus'
      WHERE tier_required = 'trial' AND is_boss = false
      AND name = 'Marcus';
    `);

    console.log('✓ Trial tier personalities updated\n');

    // Update boss personalities (paid tier)
    console.log('📝 Updating paid tier boss personalities...');

    await pool.query(`
      UPDATE personalities
      SET name = 'The wolf'
      WHERE tier_required = 'paid' AND is_boss = true
      AND name = 'The Wolf';
    `);

    await pool.query(`
      UPDATE personalities
      SET name = 'The Shark'
      WHERE tier_required = 'paid' AND is_boss = true
      AND name IN ('The Motivator', 'The Shark');
    `);

    await pool.query(`
      UPDATE personalities
      SET name = 'The Titan'
      WHERE tier_required = 'paid' AND is_boss = true
      AND name IN ('The Oracle', 'The Titan');
    `);

    // Add new personalities
    await pool.query(`
      INSERT INTO personalities (name, description, agent_id, tier_required, is_boss)
      SELECT 'Matrix', 'AI agent inspired by The Matrix. Strategic, analytical, and sees patterns others miss.', 'agent_6701kchmqsvdfbatrfm00qe5xjgj', 'paid', true
      WHERE NOT EXISTS (SELECT 1 FROM personalities WHERE name = 'Matrix');
    `);

    await pool.query(`
      INSERT INTO personalities (name, description, agent_id, tier_required, is_boss)
      SELECT 'Neo', 'The One from The Matrix. Believes in potential, challenges reality, and breaks through limitations.', 'agent_4201kchpssmrfs0v6zrqt7g99dmq', 'paid', true
      WHERE NOT EXISTS (SELECT 1 FROM personalities WHERE name = 'Neo');
    `);

    await pool.query(`
      INSERT INTO personalities (name, description, agent_id, tier_required, is_boss)
      SELECT 'Sales Prospect - Objection Handler', 'Professional sales prospect who tests your objection handling skills with realistic scenarios.', 'agent_6701kchmqsvdfbatrfm00qe5xjgj', 'trial', false
      WHERE NOT EXISTS (SELECT 1 FROM personalities WHERE name = 'Sales Prospect - Objection Handler');
    `);

    console.log('✓ Boss personalities updated and new ones added\n');

    // Verify the changes
    console.log('🔍 Current personalities in database:');
    const result = await pool.query(`
      SELECT name, tier_required, is_boss
      FROM personalities
      ORDER BY tier_required, is_boss DESC, name
    `);

    result.rows.forEach(row => {
      const tier = row.tier_required === 'trial' ? 'Trial' : 'Paid';
      const type = row.is_boss ? 'Boss' : 'Core';
      console.log(`  - ${row.name} [${tier} - ${type}]`);
    });

    await pool.end();
    console.log('\n✅ Personality names updated successfully!');
  } catch (error) {
    console.error('\n❌ Update failed:', error.message);
    console.error('Details:', error);
    await pool.end();
    process.exit(1);
  }
}

updatePersonalityNames();
