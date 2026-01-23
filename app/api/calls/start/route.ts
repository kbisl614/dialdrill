import { auth } from '@clerk/nextjs/server';
import { pool } from '@/lib/db';
import { NextResponse } from 'next/server';
import { getRandomAgentId } from '@/lib/agent-selector';
import { getEntitlements, deductCallCredit } from '@/lib/entitlements';
import { logger } from '@/lib/logger';
import { rateLimit, RATE_LIMITS, rateLimitHeaders } from '@/lib/rate-limit';
import { validateBody, startCallSchema, isValidationError } from '@/lib/validation';

export async function POST(request: Request) {
  const perfStart = Date.now();
  logger.api('/calls/start', 'Request received');

  try {
    const authStart = Date.now();
    const { userId } = await auth();
    const authEnd = Date.now();
    logger.perf('/calls/start:auth', authEnd - authStart, { route: '/calls/start' });

    if (!userId) {
      logger.api('/calls/start', 'Unauthorized - no userId');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limit: 10 calls per minute per user
    const rateLimitResult = rateLimit(`calls/start:${userId}`, RATE_LIMITS.expensive);
    if (!rateLimitResult.success) {
      logger.api('/calls/start', 'Rate limited', { userId });
      return NextResponse.json(
        { error: 'Too many requests. Please wait before starting another call.' },
        { status: 429, headers: rateLimitHeaders(rateLimitResult) }
      );
    }

    // Parse and validate request body
    const { personalityId: selectedPersonalityId } = await validateBody(request, startCallSchema);

    // Get user entitlements (single source of truth)
    const entitlementsStart = Date.now();
    const entitlements = await getEntitlements(userId);
    const entitlementsEnd = Date.now();
    logger.perf('/calls/start:entitlements', entitlementsEnd - entitlementsStart, { 
      route: '/calls/start',
      plan: entitlements.plan 
    });

    // PROTECTION 1: Check for active/pending calls (prevent multiple simultaneous calls)
    const activeCallCheck = await pool().query(
      `SELECT id, status, created_at 
       FROM call_logs 
       WHERE user_id = (SELECT id FROM users WHERE clerk_id = $1)
         AND status IN ('pending', 'active')
         AND created_at > NOW() - INTERVAL '1 hour'
       ORDER BY created_at DESC
       LIMIT 1`,
      [userId]
    );

    if (activeCallCheck.rows.length > 0) {
      const activeCall = activeCallCheck.rows[0];
      logger.api('/calls/start', 'User has active call', { userId, activeCallId: activeCall.id, status: activeCall.status });
      
      // If call is very recent (< 30 seconds), likely a refresh - return existing call
      const callAge = Date.now() - new Date(activeCall.created_at).getTime();
      if (callAge < 30000 && activeCall.status === 'pending') {
        return NextResponse.json({
          error: 'You already have a call in progress. Please complete or abandon it before starting a new one.',
          existingCallLogId: activeCall.id,
          redirect: true,
        }, { status: 409 });
      }
      
      return NextResponse.json({
        error: 'You already have an active call. Please complete it before starting a new one.',
        existingCallLogId: activeCall.id,
      }, { status: 409 });
    }

    // Check if user can make a call
    if (!entitlements.canCall) {
      logger.api('/calls/start', 'User cannot make calls', { userId });

      let errorMessage = "You're out of call credits.";
      if (entitlements.canBuyAnotherTrial) {
        errorMessage += ' You can purchase another $5 trial or upgrade to the unlimited plan.';
      } else {
        errorMessage += ' Please upgrade to continue.';
      }

      return NextResponse.json({
        error: errorMessage,
        canBuyAnotherTrial: entitlements.canBuyAnotherTrial,
        trialPurchasesCount: entitlements.trialPurchasesCount,
      }, { status: 403 });
    }

    // Select personality (either user-selected or random from unlocked)
    let agentId: string;
    let personalityId: string | null = null;

    if (selectedPersonalityId) {
      // Verify the selected personality is unlocked
      const personality = entitlements.unlockedPersonalities.find(p => p.id === selectedPersonalityId);
      if (!personality) {
        return NextResponse.json({
          error: 'Selected personality is not available on your plan'
        }, { status: 403 });
      }
      agentId = personality.agentId;
      personalityId = personality.id;
      logger.debug('[Call] User selected personality', { personality: personality.name });
    } else {
      // Random selection from unlocked personalities
      const randomPersonality = entitlements.unlockedPersonalities[
        Math.floor(Math.random() * entitlements.unlockedPersonalities.length)
      ];
      agentId = randomPersonality?.agentId || getRandomAgentId();
      personalityId = randomPersonality?.id || null;
      logger.debug('[Call] Randomly selected personality', { 
        personality: randomPersonality?.name || 'default' 
      });
    }

    // Deduct credits
    const deductStart = Date.now();
    const deductionResult = await deductCallCredit(userId);
    const deductEnd = Date.now();
    logger.perf('/calls/start:deduct', deductEnd - deductStart, { route: '/calls/start' });

    if (!deductionResult.success) {
      logger.api('/calls/start', 'Failed to deduct credits', { userId });
      return NextResponse.json({
        error: 'Failed to deduct credits. Please try again.'
      }, { status: 500 });
    }

    // Log the call in call_logs table with status tracking
    let callLogId: string | null = null;
    const logResult = await pool().query(
      `INSERT INTO call_logs (user_id, personality_id, tokens_used, overage_charge, status, session_started_at)
       SELECT id, $2, $3, $4, 'pending', NOW() FROM users WHERE clerk_id = $1
       RETURNING id`,
      [
        userId,
        personalityId,
        deductionResult.isOverage ? 0 : 1000,
        deductionResult.isOverage ? 1.0 : 0,
      ]
    );
    callLogId = logResult.rows[0]?.id || null;

    const totalTime = Date.now() - perfStart;
    logger.perf('/calls/start:total', totalTime, { route: '/calls/start' });
    logger.api('/calls/start', 'Call started successfully', { userId, callLogId });

    return NextResponse.json({
      agentId,
      creditsRemaining: deductionResult.remainingCredits,
      isOverage: deductionResult.isOverage,
      maxDurationSeconds: entitlements.maxCallDurationSeconds,
      plan: entitlements.plan,
      callLogId,
    });
  } catch (error) {
    // Handle validation errors
    if (isValidationError(error)) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.errors },
        { status: 400 }
      );
    }

    logger.apiError('/calls/start', error, { route: '/calls/start' });

    return NextResponse.json(
      {
        error: 'Internal server error',
        ...(process.env.NODE_ENV !== 'production' && {
          details: error instanceof Error ? error.message : String(error)
        })
      },
      { status: 500 }
    );
  }
}
