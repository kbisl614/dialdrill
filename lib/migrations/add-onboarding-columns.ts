import { pool } from '../db';

export async function addOnboardingColumns() {
  const dbPool = pool();

  console.log('Adding onboarding columns to users table...');

  await dbPool.query(`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS onboarding_data JSONB,
    ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMP;
  `);

  console.log('Onboarding columns added successfully!');
}

// Run migration if called directly
if (require.main === module) {
  addOnboardingColumns()
    .then(() => {
      console.log('Migration completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}
