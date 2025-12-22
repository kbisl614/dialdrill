import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { getStripeClient } from '@/lib/stripe';

export async function POST(request: Request) {
  console.log('[API /stripe/checkout] Request received');

  try {
    const stripe = getStripeClient();
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { priceId, planType } = body; // planType: 'trial' or 'paid'

    console.log('[Stripe Checkout] Creating session for:', { userId, priceId, planType });

    // Get or create Stripe customer
    const userResult = await pool().query(
      'SELECT stripe_customer_id, email FROM users WHERE clerk_id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = userResult.rows[0];
    let customerId = user.stripe_customer_id;

    // Create Stripe customer if doesn't exist
    if (!customerId) {
      console.log('[Stripe Checkout] Creating new Stripe customer');
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          clerk_user_id: userId,
        },
      });
      customerId = customer.id;

      // Save customer ID to database
      await pool().query(
        'UPDATE users SET stripe_customer_id = $1 WHERE clerk_id = $2',
        [customerId, userId]
      );
      console.log('[Stripe Checkout] Stripe customer created:', customerId);
    }

    // Determine checkout mode based on plan type
    const mode: Stripe.Checkout.SessionCreateParams.Mode =
      planType === 'trial' ? 'payment' : 'subscription';

    const successUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard`;

    // Create checkout session
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      customer: customerId,
      mode,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        clerk_user_id: userId,
        plan_type: planType,
      },
    };

    // For subscriptions, add trial period configuration if needed
    if (mode === 'subscription') {
      sessionParams.subscription_data = {
        metadata: {
          clerk_user_id: userId,
          plan_type: planType,
        },
      };
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    console.log('[Stripe Checkout] Session created:', session.id);

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error('[API /stripe/checkout] ERROR:', error);
    return NextResponse.json(
      {
        error: 'Failed to create checkout session',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
