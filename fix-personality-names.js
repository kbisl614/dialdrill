/* eslint-disable @typescript-eslint/no-require-imports */
// Fix personality names to proper capitalization
const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function fixPersonalityNames() {
  console.log('🚀 Fixing personality names...\n');

  try {
    // Fix "zenia" → "Zenia"
    console.log('📝 Fixing "zenia" → "Zenia"...');
    const zeniaResult = await pool.query(`
      UPDATE personalities
      SET name = 'Zenia'
      WHERE LOWER(name) = 'zenia'
      RETURNING name;
    `);
    console.log(`  Updated ${zeniaResult.rowCount} row(s)\n`);

    // Fix "The wolf" → "The Wolf"
    console.log('📝 Fixing "The wolf" → "The Wolf"...');
    const wolfResult = await pool.query(`
      UPDATE personalities
      SET name = 'The Wolf'
      WHERE name = 'The wolf'
      RETURNING name;
    `);
    console.log(`  Updated ${wolfResult.rowCount} row(s)\n`);

    // Fix "Sales Prospect - Objection Handler" → "Sales Prospect"
    console.log('📝 Fixing "Sales Prospect - Objection Handler" → "Sales Prospect"...');
    const salesResult = await pool.query(`
      UPDATE personalities
      SET name = 'Sales Prospect'
      WHERE name = 'Sales Prospect - Objection Handler'
      RETURNING name;
    `);
    console.log(`  Updated ${salesResult.rowCount} row(s)\n`);

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
    console.log('\n✅ Personality names fixed successfully!');
  } catch (error) {
    console.error('\n❌ Fix failed:', error.message);
    console.error('Details:', error);
    await pool.end();
    process.exit(1);
  }
}

fixPersonalityNames();
