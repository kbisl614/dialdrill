import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getEntitlements } from '@/lib/entitlements';
import { logger } from '@/lib/logger';

export async function GET() {
  logger.api('/user/entitlements', 'Request received');

  try {
    const { userId } = await auth();

    if (!userId) {
      logger.api('/user/entitlements', 'Unauthorized - no userId');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get full entitlements from single source of truth
    // This will create the user if they don't exist yet
    const entitlements = await getEntitlements(userId);

    logger.api('/user/entitlements', 'Entitlements loaded successfully', {
      plan: entitlements.plan,
      canCall: entitlements.canCall,
      userId,
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
    logger.apiError('/user/entitlements', error, { route: '/user/entitlements' });
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
