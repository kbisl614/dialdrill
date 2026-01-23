import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { pool } from '@/lib/db';
import { getStripeClient } from '@/lib/stripe';
import { logger } from '@/lib/logger';

export async function POST(request: Request) {
  const requestId = `webhook-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  logger.apiInfo('/stripe/webhook', 'Received webhook', { requestId });

  try {
    const stripe = getStripeClient();
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      logger.apiError('/stripe/webhook', new Error('No signature found'), { route: '/stripe/webhook', requestId });
      return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    let event: Stripe.Event;

    // Verify webhook signature (skip in development if webhook secret not set)
    if (webhookSecret) {
      try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      } catch (err) {
        logger.apiError('/stripe/webhook', err, { route: '/stripe/webhook', reason: 'Signature verification failed', requestId });
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
      }
    } else {
      // Development mode: parse without verification
      logger.warn('[Stripe Webhook] No webhook secret - skipping signature verification', { requestId });
      event = JSON.parse(body);
    }

    // IDEMPOTENCY: Check if we've already processed this event
    const eventId = event.id;
    const dbPool = pool();
    const existingEvent = await dbPool.query(
      `SELECT id FROM processed_webhook_events WHERE event_id = $1`,
      [eventId]
    );

    if (existingEvent.rows.length > 0) {
      logger.apiInfo('/stripe/webhook', 'Event already processed, skipping', { eventId, eventType: event.type, requestId });
      return NextResponse.json({ received: true, duplicate: true });
    }

    // Store event ID before processing (prevents race conditions)
    try {
      await dbPool.query(
        `INSERT INTO processed_webhook_events (event_id, event_type, processed_at)
         VALUES ($1, $2, NOW())
         ON CONFLICT (event_id) DO NOTHING`,
        [eventId, event.type]
      );
    } catch (err) {
      // If insert fails due to race condition, another instance already processed it
      logger.apiInfo('/stripe/webhook', 'Event already processed (race condition)', { eventId, requestId });
      return NextResponse.json({ received: true, duplicate: true });
    }

    logger.apiInfo('/stripe/webhook', 'Event received', { eventType: event.type, eventId, requestId });

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
        logger.apiInfo('/stripe/webhook', 'Unhandled event type', { eventType: event.type, requestId });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    logger.apiError('/stripe/webhook', error, { route: '/stripe/webhook', requestId });
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
  logger.apiInfo('/stripe/webhook', 'Checkout completed', { sessionId: session.id });

  const clerkUserId = session.metadata?.clerk_user_id;
  const planType = session.metadata?.plan_type; // 'trial' or 'paid'

  if (!clerkUserId) {
    logger.apiError('/stripe/webhook', new Error('No clerk_user_id in metadata'), { sessionId: session.id });
    return;
  }

  logger.apiInfo('/stripe/webhook', 'User purchased plan', { clerkUserId, planType });

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
    logger.apiInfo('/stripe/webhook', 'Trial activated: +5 calls', { clerkUserId });
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
    logger.apiInfo('/stripe/webhook', 'Paid subscription activated: 20,000 tokens', { clerkUserId, subscriptionId });
  }
}

// Handle invoice paid (monthly renewals)
async function handleInvoicePaid(invoice: Stripe.Invoice) {
  logger.apiInfo('/stripe/webhook', 'Invoice paid', { invoiceId: invoice.id });

  // Extract subscription ID (can be string or object)
  const subscriptionValue = (invoice as Stripe.Invoice & {
    subscription?: string | Stripe.Subscription | null;
  }).subscription;
  const subscriptionId =
    typeof subscriptionValue === 'string'
      ? subscriptionValue
      : subscriptionValue?.id;

  if (!subscriptionId) {
    logger.warn('[Stripe Webhook] No subscription ID in invoice', { invoiceId: invoice.id });
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
  logger.apiInfo('/stripe/webhook', 'Tokens reset for new billing cycle', { subscriptionId });
}

// Handle subscription updates (plan changes, status changes)
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  logger.apiInfo('/stripe/webhook', 'Subscription updated', { subscriptionId: subscription.id });

  const status = subscription.status;
  const clerkUserId = subscription.metadata?.clerk_user_id;

  if (!clerkUserId) {
    // Fallback: find user by subscription_id
    const result = await pool().query(
      'SELECT clerk_id FROM users WHERE subscription_id = $1',
      [subscription.id]
    );
    if (result.rows.length === 0) {
      logger.apiError('/stripe/webhook', new Error('Cannot find user for subscription'), { subscriptionId: subscription.id });
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
  logger.apiInfo('/stripe/webhook', 'Subscription status updated', { subscriptionId: subscription.id, status: mappedStatus });
}

// Handle subscription cancellation
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  logger.apiInfo('/stripe/webhook', 'Subscription deleted', { subscriptionId: subscription.id });

  await pool().query(
    `UPDATE users
     SET
       subscription_status = 'cancelled',
       plan = 'trial'
     WHERE subscription_id = $1`,
    [subscription.id]
  );
  logger.apiInfo('/stripe/webhook', 'Subscription cancelled, user downgraded to trial', { subscriptionId: subscription.id });
}
