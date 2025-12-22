/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Add objections library to database.
 *
 * Creates:
 * - objection_library table (40+ predefined objections)
 * - call_objections table (tracks which objections were triggered per call)
 *
 * Run: node add-objections-library.js
 */
const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Predefined objection library (40+ objections across 8 industries)
const OBJECTION_LIBRARY = [
  // SaaS / Technology (10 objections)
  { name: 'Too Expensive for Our Budget', industry: 'SaaS', category: 'price', description: 'ROI concerns and budget constraints for software purchases' },
  { name: 'Already Using a Competitor', industry: 'SaaS', category: 'need', description: 'Currently committed to existing platform' },
  { name: 'Need to See a Demo First', industry: 'SaaS', category: 'trust', description: 'Requires hands-on product evaluation before commitment' },
  { name: 'Implementation Seems Too Complex', industry: 'SaaS', category: 'time', description: 'Concerns about onboarding timeline and resource requirements' },
  { name: 'Security and Compliance Issues', industry: 'SaaS', category: 'trust', description: 'Questions about data protection and regulatory compliance' },
  { name: 'Need Buy-In from IT Department', industry: 'SaaS', category: 'authority', description: 'Technical team approval required for software decisions' },
  { name: 'Contract Terms Too Rigid', industry: 'SaaS', category: 'other', description: 'Inflexible pricing or commitment periods' },
  { name: 'Feature Gap with Current Solution', industry: 'SaaS', category: 'need', description: 'Missing specific functionality they currently use' },
  { name: 'Annual vs Monthly Pricing', industry: 'SaaS', category: 'price', description: 'Payment structure doesn\'t match budget cycles' },
  { name: 'Not Sure About User Adoption', industry: 'SaaS', category: 'other', description: 'Worried team won\'t actually use the tool' },

  // Retail / E-commerce (8 objections)
  { name: 'Can Get It Cheaper Elsewhere', industry: 'Retail', category: 'price', description: 'Price comparison with competitors' },
  { name: 'Shipping Costs Too High', industry: 'Retail', category: 'price', description: 'Delivery fees add unexpected cost' },
  { name: 'Product Reviews Are Mixed', industry: 'Retail', category: 'trust', description: 'Skepticism based on customer feedback' },
  { name: 'Return Policy Not Clear', industry: 'Retail', category: 'trust', description: 'Uncertainty about product return process' },
  { name: 'Just Browsing Right Now', industry: 'Retail', category: 'need', description: 'Not ready to make purchase decision' },
  { name: 'Waiting for a Sale', industry: 'Retail', category: 'time', description: 'Expecting promotional pricing' },
  { name: 'Wrong Size/Color Available', industry: 'Retail', category: 'other', description: 'Inventory doesn\'t match preferences' },
  { name: 'Need to Check with Spouse', industry: 'Retail', category: 'authority', description: 'Joint purchase decision required' },

  // Financial Services (7 objections)
  { name: 'Rates Are Too High', industry: 'Finance', category: 'price', description: 'Interest rates or fees exceed expectations' },
  { name: 'Happy with Current Bank', industry: 'Finance', category: 'need', description: 'Satisfied with existing financial institution' },
  { name: 'Credit Score Requirements', industry: 'Finance', category: 'other', description: 'Doesn\'t meet qualification criteria' },
  { name: 'Need to Review with Accountant', industry: 'Finance', category: 'authority', description: 'Financial advisor input required' },
  { name: 'Don\'t Trust Financial Advisors', industry: 'Finance', category: 'trust', description: 'Skepticism about industry integrity' },
  { name: 'Market Timing Concerns', industry: 'Finance', category: 'time', description: 'Waiting for better market conditions' },
  { name: 'Hidden Fees Concern', industry: 'Finance', category: 'trust', description: 'Worried about undisclosed charges' },

  // Real Estate (6 objections)
  { name: 'Market Might Drop Soon', industry: 'Real Estate', category: 'time', description: 'Waiting for better market conditions' },
  { name: 'Can\'t Afford Down Payment', industry: 'Real Estate', category: 'price', description: 'Upfront cost barrier' },
  { name: 'Need to Sell Current Home First', industry: 'Real Estate', category: 'time', description: 'Contingent on existing property sale' },
  { name: 'Location Isn\'t Ideal', industry: 'Real Estate', category: 'need', description: 'Geographic preferences not met' },
  { name: 'Mortgage Approval Uncertain', industry: 'Real Estate', category: 'other', description: 'Financing qualification concerns' },
  { name: 'Just Starting to Look', industry: 'Real Estate', category: 'need', description: 'Early in home search process' },

  // Healthcare (5 objections)
  { name: 'Insurance Won\'t Cover It', industry: 'Healthcare', category: 'price', description: 'Out-of-pocket cost concerns' },
  { name: 'Need Second Opinion', industry: 'Healthcare', category: 'trust', description: 'Seeking additional medical perspective' },
  { name: 'Too Far to Travel', industry: 'Healthcare', category: 'other', description: 'Geographic accessibility issue' },
  { name: 'Prefer Natural Remedies', industry: 'Healthcare', category: 'need', description: 'Alternative treatment preference' },
  { name: 'Scheduling Conflicts', industry: 'Healthcare', category: 'time', description: 'Appointment availability doesn\'t align' },

  // Manufacturing / B2B (5 objections)
  { name: 'Lead Time Too Long', industry: 'Manufacturing', category: 'time', description: 'Production timeline doesn\'t meet needs' },
  { name: 'Minimum Order Quantity Too High', industry: 'Manufacturing', category: 'price', description: 'Volume requirements exceed demand' },
  { name: 'Quality Concerns with Samples', industry: 'Manufacturing', category: 'trust', description: 'Product quality doesn\'t meet standards' },
  { name: 'Need Custom Specifications', industry: 'Manufacturing', category: 'other', description: 'Standard offerings don\'t fit requirements' },
  { name: 'Procurement Process Required', industry: 'Manufacturing', category: 'authority', description: 'Formal RFP or bidding process necessary' },

  // Education (4 objections)
  { name: 'Tuition Too Expensive', industry: 'Education', category: 'price', description: 'Cost of enrollment exceeds budget' },
  { name: 'Program Not Accredited', industry: 'Education', category: 'trust', description: 'Certification or recognition concerns' },
  { name: 'Class Schedule Doesn\'t Fit', industry: 'Education', category: 'time', description: 'Course timing conflicts with commitments' },
  { name: 'Need to Research Job Outcomes', industry: 'Education', category: 'trust', description: 'ROI and career placement uncertainty' },

  // Insurance (5 objections)
  { name: 'Already Have Coverage', industry: 'Insurance', category: 'need', description: 'Existing policy in place' },
  { name: 'Premiums Are Too High', industry: 'Insurance', category: 'price', description: 'Monthly cost exceeds budget' },
  { name: 'Coverage Exclusions Concern Me', industry: 'Insurance', category: 'trust', description: 'Policy limitations and fine print' },
  { name: 'Need to Compare Other Quotes', industry: 'Insurance', category: 'time', description: 'Shopping multiple providers' },
  { name: 'Don\'t Understand Policy Terms', industry: 'Insurance', category: 'other', description: 'Complexity of coverage details' },
];

async function addObjectionsLibrary() {
  console.log('Adding objections library to database...\n');

  try {
    // 1. Create objection_library table
    console.log('📝 Creating objection_library table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS objection_library (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        industry TEXT NOT NULL,
        category TEXT NOT NULL,
        description TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(name, industry)
      );
    `);
    console.log('✓ objection_library table created\n');

    // 2. Create call_objections junction table
    console.log('📝 Creating call_objections table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS call_objections (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        call_log_id UUID NOT NULL REFERENCES call_logs(id) ON DELETE CASCADE,
        objection_id UUID NOT NULL REFERENCES objection_library(id) ON DELETE CASCADE,
        triggered_at TEXT,
        response_snippet TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(call_log_id, objection_id)
      );
    `);
    console.log('✓ call_objections table created\n');

    // 3. Create indexes
    console.log('📝 Creating indexes...');
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_call_objections_call_log_id
      ON call_objections(call_log_id);
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_objection_library_industry
      ON objection_library(industry);
    `);
    console.log('✓ Indexes created\n');

    // 4. Seed objection library
    console.log('📝 Seeding objection library...');
    const existingCount = await pool.query('SELECT COUNT(*) FROM objection_library');

    if (parseInt(existingCount.rows[0].count) === 0) {
      for (const objection of OBJECTION_LIBRARY) {
        await pool.query(
          `INSERT INTO objection_library (name, industry, category, description)
           VALUES ($1, $2, $3, $4)`,
          [objection.name, objection.industry, objection.category, objection.description]
        );
      }
      console.log(`✓ ${OBJECTION_LIBRARY.length} objections seeded\n`);
    } else {
      console.log('⚠️  Objections already exist, skipping seed\n');
    }

    // 5. Verify
    const result = await pool.query(`
      SELECT industry, COUNT(*) as count
      FROM objection_library
      GROUP BY industry
      ORDER BY industry
    `);

    console.log('📊 Objection library breakdown:');
    result.rows.forEach(row => {
      console.log(`   ${row.industry}: ${row.count} objections`);
    });

    const total = await pool.query('SELECT COUNT(*) FROM objection_library');
    console.log(`\n✓ Total objections in library: ${total.rows[0].count}`);

    await pool.end();
    console.log('\n✓ Database migration completed!');
  } catch (error) {
    console.error('✗ Error:', error.message);
    await pool.end();
    process.exit(1);
  }
}

addObjectionsLibrary();
