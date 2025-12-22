import { auth } from '@clerk/nextjs/server';
import { pool } from '@/lib/db';
import { NextResponse } from 'next/server';
import { getRandomAgentId } from '@/lib/agent-selector';
import { getEntitlements, deductCallCredit } from '@/lib/entitlements';

export async function POST(request: Request) {
  const perfStart = Date.now();
  console.log('[API /calls/start] Request received');

  try {
    const authStart = Date.now();
    const { userId } = await auth();
    const authEnd = Date.now();
    console.log(`[PERF-API] ${authEnd - perfStart}ms - Clerk auth completed (took ${authEnd - authStart}ms)`);
    console.log('[API /calls/start] Auth result - userId:', userId);

    if (!userId) {
      console.log('[API /calls/start] No userId found - returning 401');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body to get optional personality selection
    const body = await request.json().catch(() => ({}));
    const selectedPersonalityId = body.personalityId;

    // Get user entitlements (single source of truth)
    const entitlementsStart = Date.now();
    const entitlements = await getEntitlements(userId);
    const entitlementsEnd = Date.now();
    console.log(`[PERF-API] ${entitlementsEnd - perfStart}ms - Entitlements loaded (took ${entitlementsEnd - entitlementsStart}ms)`);
    console.log('[API /calls/start] Entitlements:', {
      plan: entitlements.plan,
      canCall: entitlements.canCall,
      isOverage: entitlements.isOverage,
    });

    // Check if user can make a call
    if (!entitlements.canCall) {
      console.log('[API /calls/start] User cannot make calls');

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
      console.log('[Call] User selected personality:', personality.name);
    } else {
      // Random selection from unlocked personalities
      const randomPersonality = entitlements.unlockedPersonalities[
        Math.floor(Math.random() * entitlements.unlockedPersonalities.length)
      ];
      agentId = randomPersonality?.agentId || getRandomAgentId();
      personalityId = randomPersonality?.id || null;
      console.log('[Call] Randomly selected personality:', randomPersonality?.name || 'default');
    }

    // Deduct credits
    const deductStart = Date.now();
    const deductionResult = await deductCallCredit(userId);
    const deductEnd = Date.now();
    console.log(`[PERF-API] ${deductEnd - perfStart}ms - Credit deducted (took ${deductEnd - deductStart}ms)`);

    if (!deductionResult.success) {
      console.log('[API /calls/start] Failed to deduct credits');
      return NextResponse.json({
        error: 'Failed to deduct credits. Please try again.'
      }, { status: 500 });
    }

    // Log the call in call_logs table
    let callLogId: string | null = null;
    const logResult = await pool().query(
      `INSERT INTO call_logs (user_id, personality_id, tokens_used, overage_charge)
       SELECT id, $2, $3, $4 FROM users WHERE clerk_id = $1
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
    console.log(`[PERF-API] ${totalTime}ms - ✅ /calls/start TOTAL TIME`);
    console.log('[API /calls/start] Success - call started');

    return NextResponse.json({
      agentId,
      creditsRemaining: deductionResult.remainingCredits,
      isOverage: deductionResult.isOverage,
      maxDurationSeconds: entitlements.maxCallDurationSeconds,
      plan: entitlements.plan,
      callLogId,
    });
  } catch (error) {
    console.error('[API /calls/start] ERROR:', error);
    console.error('[API /calls/start] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('[API /calls/start] Error message:', error instanceof Error ? error.message : String(error));

    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
