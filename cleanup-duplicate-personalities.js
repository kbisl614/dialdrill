/* eslint-disable @typescript-eslint/no-require-imports */
// Remove duplicate personalities and keep only the ones we want
const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function cleanupDuplicates() {
  console.log('🚀 Cleaning up duplicate personalities...\n');

  try {
    // First, let's see what we have
    console.log('📝 Current personalities:');
    const current = await pool.query(`
      SELECT id, name, tier_required, is_boss
      FROM personalities
      ORDER BY name
    `);
    current.rows.forEach(row => {
      console.log(`  ${row.id} - ${row.name} [${row.tier_required} - ${row.is_boss ? 'Boss' : 'Core'}]`);
    });
    console.log('');

    // Delete old personalities that don't match our new names
    console.log('📝 Removing old personalities...');
    await pool.query(`
      DELETE FROM personalities
      WHERE name IN ('The Motivator', 'The Oracle', 'The Wolf', 'Zenia')
    `);
    console.log('✓ Old personalities removed\n');

    // Remove duplicates, keeping only one of each
    console.log('📝 Removing duplicates...');
    await pool.query(`
      DELETE FROM personalities a
      USING personalities b
      WHERE a.id > b.id
      AND a.name = b.name
    `);
    console.log('✓ Duplicates removed\n');

    // Verify final state
    console.log('🔍 Final personalities:');
    const final = await pool.query(`
      SELECT name, tier_required, is_boss
      FROM personalities
      ORDER BY tier_required, is_boss DESC, name
    `);
    final.rows.forEach(row => {
      const tier = row.tier_required === 'trial' ? 'Trial' : 'Paid';
      const type = row.is_boss ? 'Boss' : 'Core';
      console.log(`  - ${row.name} [${tier} - ${type}]`);
    });

    await pool.end();
    console.log('\n✅ Cleanup completed successfully!');
  } catch (error) {
    console.error('\n❌ Cleanup failed:', error.message);
    console.error('Details:', error);
    await pool.end();
    process.exit(1);
  }
}

cleanupDuplicates();
