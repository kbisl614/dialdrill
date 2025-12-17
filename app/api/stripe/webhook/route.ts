import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { pool } from '@/lib/db';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: Request) {
  console.log('[Stripe Webhook] Received webhook');

  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      console.error('[Stripe Webhook] No signature found');
      return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    let event: Stripe.Event;

    // Verify webhook signature (skip in development if webhook secret not set)
    if (webhookSecret) {
      try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      } catch (err) {
        console.error('[Stripe Webhook] Signature verification failed:', err);
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
      }
    } else {
      // Development mode: parse without verification
      console.warn('[Stripe Webhook] ⚠️  No webhook secret - skipping signature verification');
      event = JSON.parse(body);
    }

    console.log('[Stripe Webhook] Event type:', event.type);

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaid(invoice);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[Stripe Webhook] ERROR:', error);
    return NextResponse.json(
      {
        error: 'Webhook handler failed',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// Handle successful checkout completion
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log('[Stripe Webhook] Checkout completed:', session.id);

  const clerkUserId = session.metadata?.clerk_user_id;
  const planType = session.metadata?.plan_type; // 'trial' or 'paid'

  if (!clerkUserId) {
    console.error('[Stripe Webhook] No clerk_user_id in metadata');
    return;
  }

  console.log(`[Stripe Webhook] User ${clerkUserId} purchased plan: ${planType}`);

  if (planType === 'trial') {
    // Handle $5 trial purchase
    await pool().query(
      `UPDATE users
       SET
         plan = 'trial',
         trial_purchases_count = trial_purchases_count + 1,
         trial_calls_remaining = trial_calls_remaining + 5
       WHERE clerk_id = $1`,
      [clerkUserId]
    );
    console.log('[Stripe Webhook] ✓ Trial activated: +5 calls');
  } else if (planType === 'paid') {
    // Handle $11.99 subscription purchase
    const subscriptionId = session.subscription as string;

    await pool().query(
      `UPDATE users
       SET
         plan = 'paid',
         subscription_status = 'active',
         subscription_id = $1,
         tokens_remaining = 20000,
         billing_cycle_start = NOW()
       WHERE clerk_id = $2`,
      [subscriptionId, clerkUserId]
    );
    console.log('[Stripe Webhook] ✓ Paid subscription activated: 20,000 tokens');
  }
}

// Handle invoice paid (monthly renewals)
async function handleInvoicePaid(invoice: Stripe.Invoice) {
  console.log('[Stripe Webhook] Invoice paid:', invoice.id);

  const subscriptionId = invoice.subscription as string;
  if (!subscriptionId) {
    console.log('[Stripe Webhook] No subscription ID in invoice');
    return;
  }

  // Reset tokens for monthly billing cycle
  await pool().query(
    `UPDATE users
     SET
       tokens_remaining = 20000,
       billing_cycle_start = NOW(),
       subscription_status = 'active'
     WHERE subscription_id = $1`,
    [subscriptionId]
  );
  console.log('[Stripe Webhook] ✓ Tokens reset for new billing cycle');
}

// Handle subscription updates (plan changes, status changes)
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log('[Stripe Webhook] Subscription updated:', subscription.id);

  const status = subscription.status;
  const clerkUserId = subscription.metadata?.clerk_user_id;

  if (!clerkUserId) {
    // Fallback: find user by subscription_id
    const result = await pool().query(
      'SELECT clerk_id FROM users WHERE subscription_id = $1',
      [subscription.id]
    );
    if (result.rows.length === 0) {
      console.error('[Stripe Webhook] Cannot find user for subscription:', subscription.id);
      return;
    }
  }

  // Map Stripe status to our subscription_status
  const mappedStatus =
    status === 'active' ? 'active' :
    status === 'past_due' ? 'past_due' :
    status === 'canceled' ? 'cancelled' :
    'active';

  await pool().query(
    `UPDATE users
     SET subscription_status = $1
     WHERE subscription_id = $2`,
    [mappedStatus, subscription.id]
  );
  console.log(`[Stripe Webhook] ✓ Subscription status updated to: ${mappedStatus}`);
}

// Handle subscription cancellation
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('[Stripe Webhook] Subscription deleted:', subscription.id);

  await pool().query(
    `UPDATE users
     SET
       subscription_status = 'cancelled',
       plan = 'trial'
     WHERE subscription_id = $1`,
    [subscription.id]
  );
  console.log('[Stripe Webhook] ✓ Subscription cancelled, user downgraded to trial');
}
