import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getEntitlements } from '@/lib/entitlements';

export async function GET() {
  console.log('[API /user/entitlements] Request received');

  try {
    const { userId } = await auth();

    if (!userId) {
      console.log('[API /user/entitlements] No userId found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get full entitlements from single source of truth
    // This will create the user if they don't exist yet
    const entitlements = await getEntitlements(userId);

    console.log('[API /user/entitlements] Entitlements loaded:', {
      plan: entitlements.plan,
      canCall: entitlements.canCall,
      trialCallsRemaining: entitlements.trialCallsRemaining,
      tokensRemaining: entitlements.tokensRemaining,
      isOverage: entitlements.isOverage,
    });

    // Return full entitlements object
    return NextResponse.json({
      plan: entitlements.plan,
      canCall: entitlements.canCall,
      trialCallsRemaining: entitlements.trialCallsRemaining,
      tokensRemaining: entitlements.tokensRemaining,
      isOverage: entitlements.isOverage,
      trialPurchasesCount: entitlements.trialPurchasesCount,
      canBuyAnotherTrial: entitlements.canBuyAnotherTrial,
      maxCallDurationSeconds: entitlements.maxCallDurationSeconds,
      unlockedPersonalities: entitlements.unlockedPersonalities.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        isBoss: p.isBoss,
      })),
      lockedPersonalities: entitlements.lockedPersonalities.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        isBoss: p.isBoss,
      })),
      subscriptionStatus: entitlements.subscriptionStatus,
    });
  } catch (error) {
    console.error('[API /user/entitlements] ERROR:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
