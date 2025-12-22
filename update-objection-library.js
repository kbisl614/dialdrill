/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Update objection library with new industries and handling strategies.
 *
 * Run: node update-objection-library.js
 */
const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// New objection library with handling strategies
const NEW_OBJECTION_LIBRARY = [
  // Insurance (10 objections)
  {
    name: 'Already Have Coverage',
    industry: 'Insurance',
    category: 'need',
    description: 'Customer claims they already have insurance',
    handling: [
      'Ask when they last reviewed their policy - rates and coverage change. Most people are overpaying or underinsured.',
      'Position as a second opinion: "Great that you\'re covered. Mind if I show you what we\'re offering just to compare? Worst case, you confirm you have a good deal."'
    ]
  },
  {
    name: 'Premiums Too High',
    industry: 'Insurance',
    category: 'price',
    description: 'Cost objection regarding monthly/annual premiums',
    handling: [
      'Break down cost per day: "That\'s $2.50/day for complete peace of mind. Less than a coffee."',
      'Ask about current deductible - higher deductible can lower premium significantly while still providing protection.'
    ]
  },
  {
    name: 'Don\'t Understand Policy Terms',
    industry: 'Insurance',
    category: 'other',
    description: 'Confusion about coverage details and exclusions',
    handling: [
      'Simplify with real scenarios: "Here\'s what happens if X occurs..." Use stories, not jargon.',
      'Offer to send a one-page summary highlighting the 3 most important coverage points for their situation.'
    ]
  },
  {
    name: 'Need to Compare Other Quotes',
    industry: 'Insurance',
    category: 'time',
    description: 'Customer wants to shop around first',
    handling: [
      'Encourage it: "Absolutely compare. Here\'s what to look for..." Position yourself as the expert helping them evaluate.',
      'Offer to review competitors\' quotes: "Bring me their offer and I\'ll show you exactly what you\'re getting and what you\'re missing."'
    ]
  },
  {
    name: 'Had Bad Experience with Insurance Before',
    industry: 'Insurance',
    category: 'trust',
    description: 'Past negative experience with claims or service',
    handling: [
      'Acknowledge and differentiate: "I hear that a lot. What specifically happened?" Then explain how your company handles that differently.',
      'Share claim approval stats and average payout time: "We approve 94% of claims within 48 hours. Here\'s why..."'
    ]
  },
  {
    name: 'Coverage Exclusions Concern Me',
    industry: 'Insurance',
    category: 'trust',
    description: 'Worried about what\'s NOT covered',
    handling: [
      'Lead with what IS covered for their top 3 concerns, then address exclusions honestly. Transparency builds trust.',
      'Offer riders/add-ons to cover specific gaps: "If that\'s important to you, here\'s how we can add it for $X/month."'
    ]
  },
  {
    name: 'Don\'t Need That Much Coverage',
    industry: 'Insurance',
    category: 'need',
    description: 'Customer thinks they\'re over-insured',
    handling: [
      'Ask about assets and dependents: "Walk me through what you\'re protecting." Often they\'re underestimating risk.',
      'Show cost of underinsurance: "If you have a $500k claim but only $250k coverage, you\'re personally liable for the difference."'
    ]
  },
  {
    name: 'Switching Policies Seems Complicated',
    industry: 'Insurance',
    category: 'time',
    description: 'Hassle of changing providers',
    handling: [
      'We handle everything: "You sign one form, we do the rest. No gap in coverage, no calls to your old provider."',
      'Timeline guarantee: "From signature to full coverage in 48 hours. I\'ll personally manage the transition."'
    ]
  },
  {
    name: 'What If I Need to Cancel?',
    industry: 'Insurance',
    category: 'other',
    description: 'Concerns about commitment and cancellation',
    handling: [
      'No long-term lock-in: "Cancel anytime with 30 days notice. Most clients stay because we earn it, not because they\'re trapped."',
      'Pro-rated refund policy: "If you cancel mid-term, you get back the unused portion. Zero penalty."'
    ]
  },
  {
    name: 'Need Approval from Spouse/Partner',
    industry: 'Insurance',
    category: 'authority',
    description: 'Joint decision required',
    handling: [
      'Get them on the call: "No problem. Is your spouse available now? I can explain everything in 5 minutes."',
      'Send comparison doc: "I\'ll email you a one-pager showing current vs. new coverage. Review together and call me with questions."'
    ]
  },

  // SaaS (10 objections)
  {
    name: 'Too Expensive for Our Budget',
    industry: 'SaaS',
    category: 'price',
    description: 'Software cost exceeds allocated budget',
    handling: [
      'Calculate cost per user per day: "That\'s $0.50/day per employee. What\'s the cost of NOT solving this problem?"',
      'Offer annual billing discount or phased rollout: "Start with one team, prove ROI, then expand."'
    ]
  },
  {
    name: 'Already Using a Competitor',
    industry: 'SaaS',
    category: 'need',
    description: 'Currently committed to another platform',
    handling: [
      'Ask what they\'d change about current tool: "If you could wave a magic wand, what would you fix?" Then show how you solve that.',
      'Offer free trial alongside competitor: "Use both for 30 days. No commitment. See which your team prefers."'
    ]
  },
  {
    name: 'Implementation Takes Too Long',
    industry: 'SaaS',
    category: 'time',
    description: 'Onboarding timeline concerns',
    handling: [
      'Break down timeline: "Week 1: Setup. Week 2: Training. Week 3: Live. Most teams see value by day 10."',
      'White-glove onboarding: "Our team does the heavy lifting. You just review and approve. 80% less work for you."'
    ]
  },
  {
    name: 'Security and Compliance Concerns',
    industry: 'SaaS',
    category: 'trust',
    description: 'Data protection and regulatory questions',
    handling: [
      'Share certifications: "We\'re SOC 2 Type II, GDPR compliant, and ISO 27001 certified. Here\'s our security whitepaper."',
      'Offer security call with your IT team: "Let our CTO walk through architecture, encryption, and access controls."'
    ]
  },
  {
    name: 'Feature Gap with Current Solution',
    industry: 'SaaS',
    category: 'need',
    description: 'Missing specific functionality',
    handling: [
      'Check roadmap: "That feature launches next quarter. Can you wait, or is it a dealbreaker today?"',
      'Workaround or integration: "You can achieve that by connecting with [tool]. Here\'s how 3 clients do it."'
    ]
  },
  {
    name: 'Worried About User Adoption',
    industry: 'SaaS',
    category: 'other',
    description: 'Team might not actually use the tool',
    handling: [
      'Pilot program: "Start with 5 power users. If they love it, rollout is easy. If not, you learn without risk."',
      'Change management support: "We provide training, templates, and a dedicated success manager for 90 days."'
    ]
  },
  {
    name: 'Contract Terms Too Rigid',
    industry: 'SaaS',
    category: 'other',
    description: 'Inflexible pricing or commitment',
    handling: [
      'Monthly option available: "Pay month-to-month for 15% more, or annual for the discount. Your choice."',
      'Quarterly check-ins with exit clause: "If we\'re not delivering value after Q1, we part ways. No hard feelings."'
    ]
  },
  {
    name: 'Need Buy-In from IT Department',
    industry: 'SaaS',
    category: 'authority',
    description: 'Technical approval required',
    handling: [
      'IT demo: "Let me show your IT lead our API docs, security protocols, and integration capabilities."',
      'Invite IT to trial: "Give them admin access during trial. They can test everything before you commit."'
    ]
  },
  {
    name: 'Data Migration Sounds Risky',
    industry: 'SaaS',
    category: 'trust',
    description: 'Fear of losing data during switch',
    handling: [
      'Guaranteed migration: "We migrate your data with zero downtime. If anything breaks, we fix it or you don\'t pay."',
      'Parallel run period: "Keep old system live while testing new one. Cutover only when you\'re 100% confident."'
    ]
  },
  {
    name: 'ROI Unclear',
    industry: 'SaaS',
    category: 'price',
    description: 'Uncertain about return on investment',
    handling: [
      'Use their numbers: "You spend 10 hours/week on this. At $50/hour, that\'s $26k/year. We cost $12k. ROI is immediate."',
      'Case study with similar company: "Company X saved $47k in year one. Here\'s exactly how they did it."'
    ]
  },

  // Solar (8 objections)
  {
    name: 'Upfront Cost Too High',
    industry: 'Solar',
    category: 'price',
    description: 'Installation cost is a barrier',
    handling: [
      '$0 down financing: "Nothing out of pocket. Your monthly payment is less than your current electric bill."',
      'Show 25-year savings: "Yes, $25k upfront. But you\'ll save $65k over the system\'s life. Net gain: $40k."'
    ]
  },
  {
    name: 'Worried About Roof Damage',
    industry: 'Solar',
    category: 'trust',
    description: 'Fear of installation harming roof',
    handling: [
      'Roof inspection included: "We inspect before install. If your roof needs work, we tell you BEFORE drilling."',
      '25-year warranty on roof penetrations: "Any leak caused by our install, we fix for free. That\'s in writing."'
    ]
  },
  {
    name: 'What If I Move?',
    industry: 'Solar',
    category: 'other',
    description: 'Concern about selling home with solar',
    handling: [
      'Transferable or buyout: "New owner takes over payments, or you pay off the balance at sale. Either way, solar increases home value."',
      'Homes with solar sell faster: "On average, 20% faster and for 4.1% more. Buyers want lower electric bills."'
    ]
  },
  {
    name: 'Not Sure It Works in My Area',
    industry: 'Solar',
    category: 'trust',
    description: 'Climate or location concerns',
    handling: [
      'Custom production estimate: "Based on your exact address, roof angle, and shade, here\'s your expected output."',
      'Germany produces more solar than us with half the sun: "If it works there, it works here. Plus, production guarantee."'
    ]
  },
  {
    name: 'Electric Bill Already Low',
    industry: 'Solar',
    category: 'need',
    description: 'Current costs don\'t justify solar',
    handling: [
      'Rates increase 3-5% annually: "Your $100/month bill becomes $180 in 10 years. Lock in $0 increase with solar."',
      'Environmental impact: "Even if savings are small, you\'ll offset 100 tons of CO2 over 25 years. That matters."'
    ]
  },
  {
    name: 'HOA Won\'t Allow It',
    industry: 'Solar',
    category: 'other',
    description: 'Homeowner association restrictions',
    handling: [
      'Solar access laws: "In most states, HOAs can\'t prohibit solar. We handle the paperwork and approvals."',
      'Aesthetic options: "All-black panels, no visible conduit. We design for HOA approval."'
    ]
  },
  {
    name: 'Technology Will Improve Soon',
    industry: 'Solar',
    category: 'time',
    description: 'Waiting for better panels',
    handling: [
      'Every year you wait costs you: "Waiting 2 years for 5% better panels means losing $4k in savings. Math doesn\'t work."',
      'Efficiency gains are incremental: "Panels improve 0.5% per year. Today\'s panels are 22% efficient - that\'s excellent."'
    ]
  },
  {
    name: 'What About Maintenance?',
    industry: 'Solar',
    category: 'other',
    description: 'Ongoing care and repair concerns',
    handling: [
      'Near-zero maintenance: "Rain cleans panels. No moving parts. Inspect once a year. That\'s it."',
      '25-year warranty covers everything: "Panel defects, inverter, labor. If it breaks, we replace it free."'
    ]
  },

  // SMBs (Small/Medium Business) (10 objections)
  {
    name: 'Cash Flow Is Tight Right Now',
    industry: 'SMBs',
    category: 'price',
    description: 'Limited working capital',
    handling: [
      'Deferred payment: "Pay nothing for 60 days. Start seeing results before first payment."',
      'Show how it pays for itself: "This generates $X in new revenue. It funds itself within 90 days."'
    ]
  },
  {
    name: 'Too Busy to Implement',
    industry: 'SMBs',
    category: 'time',
    description: 'Business owner overwhelmed',
    handling: [
      'Done-for-you service: "We handle setup, training, and management. You approve, we execute."',
      'Pilot with one location/department: "Prove it works in one area without disrupting the whole business."'
    ]
  },
  {
    name: 'Tried Something Similar Before',
    industry: 'SMBs',
    category: 'trust',
    description: 'Past vendor let them down',
    handling: [
      'What went wrong?: "Tell me what happened so I can show you how we\'re different." Then address specific failure points.',
      'Performance guarantee: "If we don\'t deliver X by Y date, you don\'t pay. Put our money where our mouth is."'
    ]
  },
  {
    name: 'Need to Talk to My Partner',
    industry: 'SMBs',
    category: 'authority',
    description: 'Co-owner approval needed',
    handling: [
      'Three-way call: "Can we loop them in now? I can explain quickly and answer questions together."',
      'Send executive summary: "I\'ll email a one-pager with costs, benefits, and ROI. Discuss and call me back."'
    ]
  },
  {
    name: 'Not Sure We\'re Big Enough',
    industry: 'SMBs',
    category: 'need',
    description: 'Thinks solution is for larger companies',
    handling: [
      'Built for businesses your size: "70% of our clients have 10-50 employees. This scales with you."',
      'Small business pricing: "We have a tier specifically for companies under $5M revenue. Perfect fit."'
    ]
  },
  {
    name: 'Economy Is Uncertain',
    industry: 'SMBs',
    category: 'time',
    description: 'Worried about recession or downturn',
    handling: [
      'This helps you survive downturns: "When budgets tighten, efficiency matters more. This cuts costs by X%."',
      'Competitors are investing: "Businesses that pull back during uncertainty lose market share. Stay aggressive."'
    ]
  },
  {
    name: 'Have to Focus on Core Business',
    industry: 'SMBs',
    category: 'need',
    description: 'Other priorities take precedence',
    handling: [
      'This supports your core business: "By handling [pain point], you free up time for what matters most."',
      'What\'s costing you more - this investment or continuing without it?: "Doing nothing has a cost too."'
    ]
  },
  {
    name: 'Prefer to Handle In-House',
    industry: 'SMBs',
    category: 'other',
    description: 'DIY mindset',
    handling: [
      'Cost of internal hire: "Full-time person costs $60k+ benefits. We\'re $12k and bring expertise immediately."',
      'Hybrid approach: "We handle 80%, your team handles 20%. Best of both worlds."'
    ]
  },
  {
    name: 'Long-Term Contract Scares Me',
    industry: 'SMBs',
    category: 'other',
    description: 'Commitment concerns',
    handling: [
      'Month-to-month available: "Try us monthly. If it works, lock in annual discount. If not, walk away."',
      'Early exit clause: "Cancel after 6 months if you\'re not satisfied. No penalty, just 30 days notice."'
    ]
  },
  {
    name: 'What\'s the Catch?',
    industry: 'SMBs',
    category: 'trust',
    description: 'Sounds too good to be true',
    handling: [
      'Transparent pricing breakdown: "Here\'s exactly what you pay and what you get. No hidden fees, no surprises."',
      'Talk to current clients: "I\'ll connect you with 2 businesses like yours. Ask them anything."'
    ]
  },

  // Real Estate (7 objections)
  {
    name: 'Market Might Drop Soon',
    industry: 'Real Estate',
    category: 'time',
    description: 'Waiting for prices to fall',
    handling: [
      'Timing the market is impossible: "Rates might rise while you wait. A $20k price drop disappears if rates jump 0.5%."',
      'Build equity while waiting: "Even if market dips 5%, you\'re building equity vs. paying rent. Long-term win."'
    ]
  },
  {
    name: 'Can\'t Afford Down Payment',
    industry: 'Real Estate',
    category: 'price',
    description: 'Upfront cash barrier',
    handling: [
      'First-time buyer programs: "3% down options exist. On a $300k home, that\'s $9k, not $60k."',
      'Down payment assistance: "Check for state/local grants. Many buyers get $5k-15k in aid."'
    ]
  },
  {
    name: 'Need to Sell Current Home First',
    industry: 'Real Estate',
    category: 'time',
    description: 'Contingent on existing sale',
    handling: [
      'Bridge loan option: "Borrow against current home equity to buy next one. Sell without pressure."',
      'Contingent offer: "Make offer contingent on your sale. Seller knows you\'re serious and pre-qualified."'
    ]
  },
  {
    name: 'Location Isn\'t Perfect',
    industry: 'Real Estate',
    category: 'need',
    description: 'Neighborhood or commute concerns',
    handling: [
      'Prioritize must-haves: "You want location, price, size. Pick 2. What matters most?"',
      'Investment vs. forever home: "Buy for resale value now, upgrade to dream location in 5 years with equity."'
    ]
  },
  {
    name: 'Inspection Revealed Issues',
    industry: 'Real Estate',
    category: 'trust',
    description: 'Property defects discovered',
    handling: [
      'Negotiate repairs or credit: "Ask seller to fix or reduce price by repair cost. Everything is negotiable."',
      'Get contractor quote: "I\'ll bring in 2 contractors for estimates. Make decision with real numbers."'
    ]
  },
  {
    name: 'Interest Rates Too High',
    industry: 'Real Estate',
    category: 'price',
    description: 'Mortgage rates unfavorable',
    handling: [
      'Refinance later: "Buy now, refinance when rates drop. Waiting means higher prices AND high rates."',
      'Rate buydown: "Pay 1% upfront to lower rate by 0.5%. Breaks even in 3 years."'
    ]
  },
  {
    name: 'Just Starting to Look',
    industry: 'Real Estate',
    category: 'need',
    description: 'Early in search process',
    handling: [
      'Get pre-approved now: "Even if browsing, pre-approval shows you\'re serious. Sellers prioritize you."',
      'This won\'t last: "Good properties go fast. If you love it, waiting means losing it to another buyer."'
    ]
  },

  // Other / General (10 objections)
  {
    name: 'I Need to Think About It',
    industry: 'Other',
    category: 'time',
    description: 'Generic stall tactic',
    handling: [
      'What specifically do you need to think about?: "Let\'s address concerns now so you can make an informed decision."',
      'What would make this a clear yes?: "Help me understand what\'s missing. Maybe we can solve it today."'
    ]
  },
  {
    name: 'Send Me More Information',
    industry: 'Other',
    category: 'time',
    description: 'Trying to end conversation',
    handling: [
      'I can explain faster than you can read: "What specific question do you have? Let\'s solve it in 2 minutes."',
      'What info matters most?: "I can send everything, but what do YOU care about - price, timeline, or results?"'
    ]
  },
  {
    name: 'Now Is Not a Good Time',
    industry: 'Other',
    category: 'time',
    description: 'Timing objection',
    handling: [
      'When is a good time?: "Let\'s schedule 15 minutes next week. What day works best?"',
      'This will still be a problem then: "If we don\'t solve this now, it gets worse. Why wait?"'
    ]
  },
  {
    name: 'I\'m Happy with What I Have',
    industry: 'Other',
    category: 'need',
    description: 'Status quo bias',
    handling: [
      'What would make it even better?: "Even if it\'s working, there\'s always room for improvement. What\'s one thing you\'d change?"',
      'Cost of inaction: "Staying the same while competitors improve means falling behind. Worth a look?"'
    ]
  },
  {
    name: 'Can You Do Better on Price?',
    industry: 'Other',
    category: 'price',
    description: 'Negotiation attempt',
    handling: [
      'What\'s your budget?: "Help me understand your number and I\'ll see what\'s possible."',
      'Value justification: "I can\'t discount, but here\'s why it\'s worth every dollar..." Then reinforce ROI.'
    ]
  },
  {
    name: 'I Don\'t Trust Salespeople',
    industry: 'Other',
    category: 'trust',
    description: 'General sales skepticism',
    handling: [
      'I\'m not here to sell you: "I\'m here to solve problems. If this isn\'t a fit, I\'ll tell you."',
      'Let the product speak: "Try it yourself. No commitment. See if it delivers what I\'m claiming."'
    ]
  },
  {
    name: 'What Makes You Different?',
    industry: 'Other',
    category: 'trust',
    description: 'Differentiation challenge',
    handling: [
      'Three unique advantages: "We do X, Y, and Z that competitors don\'t. Here\'s proof..."',
      'Ask what matters to them: "What\'s most important to you? Let me show how we excel at that specifically."'
    ]
  },
  {
    name: 'I\'ve Been Burned Before',
    industry: 'Other',
    category: 'trust',
    description: 'Past bad experience',
    handling: [
      'What happened?: "Tell me the story so I understand your concern. Then I\'ll show how we prevent that."',
      'Risk reversal: "I get it. That\'s why we offer [guarantee/trial/refund]. You\'re protected."'
    ]
  },
  {
    name: 'Do You Have References?',
    industry: 'Other',
    category: 'trust',
    description: 'Proof request',
    handling: [
      'Specific case studies: "Here are 3 clients in your industry with measurable results. Happy to connect you."',
      'Live testimonials: "I\'ll send video testimonials from clients who started skeptical, just like you."'
    ]
  },
  {
    name: 'I Need to Do More Research',
    industry: 'Other',
    category: 'time',
    description: 'Information gathering delay',
    handling: [
      'What specifically are you researching?: "Let me save you time. I can answer those questions now."',
      'Guided research: "I\'ll send you our comparison guide so you know what to look for. Then let\'s talk."'
    ]
  }
];

async function updateObjectionLibrary() {
  console.log('Updating objection library...\n');

  try {
    // 1. Clear existing library
    console.log('📝 Clearing existing objection library...');
    await pool.query('DELETE FROM call_objections');
    await pool.query('DELETE FROM objection_library');
    console.log('✓ Old library cleared\n');

    // 2. Add handling strategies columns
    console.log('📝 Adding handling_strategies column...');
    await pool.query(`
      ALTER TABLE objection_library
      ADD COLUMN IF NOT EXISTS handling_strategies JSONB
    `);
    console.log('✓ Column added\n');

    // 3. Insert new objections with handling strategies
    console.log('📝 Inserting new objection library...');
    for (const objection of NEW_OBJECTION_LIBRARY) {
      await pool.query(
        `INSERT INTO objection_library (name, industry, category, description, handling_strategies)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          objection.name,
          objection.industry,
          objection.category,
          objection.description,
          JSON.stringify(objection.handling)
        ]
      );
    }
    console.log(`✓ ${NEW_OBJECTION_LIBRARY.length} objections inserted\n`);

    // 4. Verify by industry
    const result = await pool.query(`
      SELECT industry, COUNT(*) as count
      FROM objection_library
      GROUP BY industry
      ORDER BY industry
    `);

    console.log('📊 New objection library breakdown:');
    result.rows.forEach(row => {
      console.log(`   ${row.industry}: ${row.count} objections`);
    });

    const total = await pool.query('SELECT COUNT(*) FROM objection_library');
    console.log(`\n✓ Total objections: ${total.rows[0].count}`);

    await pool.end();
    console.log('\n✓ Objection library updated successfully!');
  } catch (error) {
    console.error('✗ Error:', error.message);
    await pool.end();
    process.exit(1);
  }
}

updateObjectionLibrary();
