import { pool } from './db';

export type Plan = 'trial' | 'paid';

export interface Personality {
  id: string;
  name: string;
  description: string;
  agentId: string;
  tierRequired: Plan;
  isBoss: boolean;
}

export interface Entitlements {
  plan: Plan;
  canCall: boolean;
  trialCallsRemaining?: number;
  tokensRemaining?: number;
  isOverage: boolean; // true if paid plan with 0 tokens (will charge $1/call)
  trialPurchasesCount: number;
  canBuyAnotherTrial: boolean;
  maxCallDurationSeconds: number; // 90 for trial, 300 for paid
  unlockedPersonalities: Personality[];
  lockedPersonalities: Personality[];
  subscriptionStatus?: string;
}

/**
 * Single source of truth for user entitlements
 * Used by: UI display, call gating, personality picker, upgrade CTAs
 */
export async function getEntitlements(clerkId: string): Promise<Entitlements> {
  const dbPool = pool();

  // 1. Get user data (create if doesn't exist)
  const userResult = await dbPool.query(
    `INSERT INTO users (clerk_id, email, plan, trial_calls_remaining, trial_purchases_count)
     VALUES ($1, $1 || '@temp.local', 'trial', 5, 1)
     ON CONFLICT (clerk_id) DO UPDATE SET clerk_id = EXCLUDED.clerk_id
     RETURNING plan, trial_purchases_count, trial_calls_remaining, tokens_remaining, subscription_status`,
    [clerkId]
  );

  if (userResult.rows.length === 0) {
    throw new Error('User not found');
  }

  const user = userResult.rows[0];
  const plan: Plan = user.plan || 'trial';
  const trialPurchasesCount = user.trial_purchases_count || 0;
  const trialCallsRemaining = user.trial_calls_remaining || 0;
  const tokensRemaining = user.tokens_remaining || 0;
  const subscriptionStatus = user.subscription_status;

  // 2. Determine if user can make a call
  let canCall = false;
  let isOverage = false;

  if (plan === 'trial') {
    // Trial: can call if they have trial calls remaining
    canCall = trialCallsRemaining > 0;
  } else if (plan === 'paid') {
    // Paid: always can call (either from tokens or overage billing)
    if (tokensRemaining > 0) {
      canCall = true;
    } else {
      // Overage mode: can still call but will be charged $1
      canCall = subscriptionStatus === 'active';
      isOverage = true;
    }
  }

  // 3. Determine if user can buy another trial
  const canBuyAnotherTrial = plan === 'trial' && trialPurchasesCount < 2;

  // 4. Get call duration limit
  const maxCallDurationSeconds = plan === 'trial' ? 90 : 300; // 1.5 min or 5 min

  // 5. Get all personalities and determine which are unlocked
  const personalitiesResult = await dbPool.query(`
    SELECT
      id,
      name,
      description,
      agent_id as "agentId",
      tier_required as "tierRequired",
      is_boss as "isBoss"
    FROM personalities
    ORDER BY tier_required, is_boss DESC, name
  `);

  const allPersonalities: Personality[] = personalitiesResult.rows;

  // 6. Split into unlocked and locked based on user's plan
  const unlockedPersonalities: Personality[] = [];
  const lockedPersonalities: Personality[] = [];

  for (const personality of allPersonalities) {
    // Trial plan: only gets trial-tier personalities
    // Paid plan: gets all personalities
    if (plan === 'paid' || personality.tierRequired === 'trial') {
      unlockedPersonalities.push(personality);
    } else {
      lockedPersonalities.push(personality);
    }
  }

  return {
    plan,
    canCall,
    trialCallsRemaining: plan === 'trial' ? trialCallsRemaining : undefined,
    tokensRemaining: plan === 'paid' ? tokensRemaining : undefined,
    isOverage,
    trialPurchasesCount,
    canBuyAnotherTrial,
    maxCallDurationSeconds,
    unlockedPersonalities,
    lockedPersonalities,
    subscriptionStatus,
  };
}

/**
 * Deduct credits from user based on their plan
 * Returns true if deduction successful, false if insufficient credits
 */
export async function deductCallCredit(
  clerkId: string,
  tokensToDeduct: number = 1000
): Promise<{ success: boolean; remainingCredits: number; isOverage: boolean }> {
  const dbPool = pool();

  // Get entitlements first
  const entitlements = await getEntitlements(clerkId);

  if (!entitlements.canCall) {
    return { success: false, remainingCredits: 0, isOverage: false };
  }

  // Deduct based on plan
  if (entitlements.plan === 'trial') {
    // Trial: deduct 1 call
    const result = await dbPool.query(
      `UPDATE users
       SET trial_calls_remaining = trial_calls_remaining - 1
       WHERE clerk_id = $1 AND trial_calls_remaining > 0
       RETURNING trial_calls_remaining`,
      [clerkId]
    );

    if (result.rows.length === 0) {
      return { success: false, remainingCredits: 0, isOverage: false };
    }

    return {
      success: true,
      remainingCredits: result.rows[0].trial_calls_remaining,
      isOverage: false,
    };
  } else {
    // Paid plan
    if (entitlements.tokensRemaining && entitlements.tokensRemaining >= tokensToDeduct) {
      // Has tokens: deduct from balance
      const result = await dbPool.query(
        `UPDATE users
         SET tokens_remaining = tokens_remaining - $1
         WHERE clerk_id = $2 AND tokens_remaining >= $1
         RETURNING tokens_remaining`,
        [tokensToDeduct, clerkId]
      );

      if (result.rows.length === 0) {
        return { success: false, remainingCredits: 0, isOverage: false };
      }

      return {
        success: true,
        remainingCredits: result.rows[0].tokens_remaining,
        isOverage: false,
      };
    } else {
      // Overage mode: don't deduct tokens, but allow call (will be charged $1 via Stripe)
      return {
        success: true,
        remainingCredits: 0,
        isOverage: true,
      };
    }
  }
}
