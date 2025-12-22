/* eslint-disable @typescript-eslint/no-require-imports */
// Update agent IDs to match current agent configurations
const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function updateAgentIds() {
  console.log('🚀 Updating agent IDs for all personalities...\n');

  try {
    // Update each personality with the correct agent_id
    const updates = [
      { name: 'The Titan', agentId: 'agent_9101kd1nrtjgfrrsxvtt02jqe2hv' },
      { name: 'The Shark', agentId: 'agent_1801kd1jwp83efg8kepzsgbfeqye' },
      { name: 'Matrix', agentId: 'agent_9601kd1hv5p2fq9sg92h9s7aybr6' },
      { name: 'Neo', agentId: 'agent_0101kd1ck7f1fxtsessker9nemym' },
      { name: 'zenia', agentId: 'agent_0101kd1ck7f1fxtsessker9nemym' },
      { name: 'Marcus', agentId: 'agent_9301kcyvg359fvjavz0spq6dtksw' },
      { name: 'Josh', agentId: 'agent_4601kcytr3vaer3tvga2pepm24e6' },
      { name: 'The wolf', agentId: 'agent_4201kchpssmrfs0v6zrqt7g99dmq' },
      { name: 'Sales Prospect - Objection Handler', agentId: 'agent_6701kchmqsvdfbatrfm00qe5xjgj' }
    ];

    console.log('📝 Updating agent IDs...');
    for (const update of updates) {
      const result = await pool.query(
        'UPDATE personalities SET agent_id = $1 WHERE name = $2 RETURNING name, agent_id',
        [update.agentId, update.name]
      );

      if (result.rows.length > 0) {
        console.log(`  ✓ ${update.name} → ${update.agentId}`);
      } else {
        console.log(`  ⚠️  ${update.name} not found in database`);
      }
    }

    console.log('\n🔍 Verifying all personalities:');
    const allPersonalities = await pool.query(`
      SELECT name, agent_id, tier_required, is_boss
      FROM personalities
      ORDER BY tier_required, is_boss DESC, name
    `);

    allPersonalities.rows.forEach(row => {
      const tier = row.tier_required === 'trial' ? 'Trial' : 'Paid';
      const type = row.is_boss ? 'Boss' : 'Core';
      console.log(`  - ${row.name.padEnd(40)} ${row.agent_id} [${tier} - ${type}]`);
    });

    await pool.end();
    console.log('\n✅ Agent IDs updated successfully!');
  } catch (error) {
    console.error('\n❌ Update failed:', error.message);
    console.error('Details:', error);
    await pool.end();
    process.exit(1);
  }
}

updateAgentIds();
