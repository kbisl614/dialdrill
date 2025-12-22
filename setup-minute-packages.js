/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Script to create minute package products in Stripe
 * Run with: node setup-minute-packages.js
 */

require('dotenv').config({ path: '.env.local' });
const Stripe = require('stripe');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function setupMinutePackages() {
  console.log('Creating minute package products in Stripe...\n');

  const packages = [
    {
      name: 'Small Boost - 5 Minutes',
      description: 'Add 5 minutes of practice time',
      price: 500, // $5.00 in cents
      minutes: 5,
      tokens: 5000, // 5 minutes = 5,000 tokens
    },
    {
      name: 'Focus Pack - 10 Minutes',
      description: 'Add 10 minutes of practice time',
      price: 900, // $9.00 in cents
      minutes: 10,
      tokens: 10000, // 10 minutes = 10,000 tokens
    },
    {
      name: 'Power Pack - 20 Minutes',
      description: 'Add 20 minutes of practice time',
      price: 1600, // $16.00 in cents
      minutes: 20,
      tokens: 20000, // 20 minutes = 20,000 tokens
    },
    {
      name: 'Intensive Pack - 50 Minutes',
      description: 'Add 50 minutes of practice time',
      price: 3500, // $35.00 in cents
      minutes: 50,
      tokens: 50000, // 50 minutes = 50,000 tokens
    },
  ];

  const createdProducts = [];

  for (const pkg of packages) {
    try {
      // Create product
      const product = await stripe.products.create({
        name: pkg.name,
        description: pkg.description,
        metadata: {
          type: 'minute_package',
          minutes: pkg.minutes.toString(),
          tokens: pkg.tokens.toString(),
        },
      });

      console.log(`✓ Created product: ${pkg.name}`);
      console.log(`  Product ID: ${product.id}`);

      // Create one-time payment price
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: pkg.price,
        currency: 'usd',
        metadata: {
          type: 'minute_package',
          minutes: pkg.minutes.toString(),
          tokens: pkg.tokens.toString(),
        },
      });

      console.log(`  Price ID: ${price.id}`);
      console.log(`  Amount: $${(pkg.price / 100).toFixed(2)}`);
      console.log('');

      createdProducts.push({
        name: pkg.name,
        product_id: product.id,
        price_id: price.id,
        minutes: pkg.minutes,
        tokens: pkg.tokens,
        amount: pkg.price / 100,
      });
    } catch (error) {
      console.error(`✗ Error creating ${pkg.name}:`, error.message);
    }
  }

  console.log('\n=== SUMMARY ===\n');
  console.log('Add these to your .env.local file:\n');

  createdProducts.forEach((product, index) => {
    const packageType = ['SMALL_BOOST', 'FOCUS_PACK', 'POWER_PACK', 'INTENSIVE_PACK'][index];
    console.log(`STRIPE_PRICE_${packageType}_ID=${product.price_id}`);
    console.log(`NEXT_PUBLIC_STRIPE_PRICE_${packageType}_ID=${product.price_id}`);
  });

  console.log('\n=== Products Created Successfully ===\n');
  console.table(createdProducts);
}

setupMinutePackages().catch(console.error);
