/* eslint-disable @typescript-eslint/no-require-imports */
// Setup Stripe Products and Prices for DialDrill
require('dotenv').config({ path: '.env.local' });
const Stripe = require('stripe');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function setupProducts() {
  console.log('🚀 Setting up Stripe products...\n');

  try {
    // 1. Create $5 Trial Product (one-time payment)
    console.log('📦 Creating $5 Trial product...');
    const trialProduct = await stripe.products.create({
      name: 'DialDrill Trial',
      description: '5 practice calls with access to 3 personalities. 1.5 minute call limit.',
      metadata: {
        type: 'trial',
        calls: '5',
        personalities: '3',
        call_duration: '90',
      },
    });
    console.log('✓ Trial product created:', trialProduct.id);

    const trialPrice = await stripe.prices.create({
      product: trialProduct.id,
      unit_amount: 500, // $5.00 in cents
      currency: 'usd',
      metadata: {
        plan_type: 'trial',
      },
    });
    console.log('✓ Trial price created:', trialPrice.id);
    console.log('  Price: $5.00 one-time\n');

    // 2. Create $11.99/month Subscription Product
    console.log('📦 Creating $11.99/month Subscription product...');
    const paidProduct = await stripe.products.create({
      name: 'DialDrill Pro',
      description: '20 minutes per month, all 8 personalities (including 5 boss personalities), 5 minute call limit. Overage: $1/min.',
      metadata: {
        type: 'paid',
        tokens: '20000',
        personalities: '8',
        call_duration: '300',
        overage_rate: '1.00',
      },
    });
    console.log('✓ Pro product created:', paidProduct.id);

    const paidPrice = await stripe.prices.create({
      product: paidProduct.id,
      unit_amount: 1199, // $11.99 in cents
      currency: 'usd',
      recurring: {
        interval: 'month',
      },
      metadata: {
        plan_type: 'paid',
      },
    });
    console.log('✓ Pro price created:', paidPrice.id);
    console.log('  Price: $11.99/month\n');

    // 3. Output environment variables to add
    console.log('✅ Products created successfully!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📝 ADD THESE TO YOUR .env.local FILE:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log(`STRIPE_PRICE_TRIAL_ID=${trialPrice.id}`);
    console.log(`STRIPE_PRICE_PAID_ID=${paidPrice.id}\n`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('🔗 View in Stripe Dashboard:');
    console.log(`Trial: https://dashboard.stripe.com/test/products/${trialProduct.id}`);
    console.log(`Pro: https://dashboard.stripe.com/test/products/${paidProduct.id}\n`);

  } catch (error) {
    console.error('❌ Error creating products:', error.message);
    if (error.type === 'StripeAuthenticationError') {
      console.error('\n⚠️  Check your STRIPE_SECRET_KEY in .env.local');
    }
    process.exit(1);
  }
}

setupProducts();
