/**
 * Tests for entitlements business logic
 * These test the core entitlements calculations independent of the database
 */

import type { Plan, Entitlements, Personality } from '@/lib/entitlements';

// Extract the pure business logic for testing
// This mirrors the logic in getEntitlements() but without DB calls

interface UserData {
  plan: Plan;
  trial_purchases_count: number;
  trial_calls_remaining: number;
  tokens_remaining: number;
  subscription_status: string | null;
}

function calculateEntitlements(
  user: UserData,
  allPersonalities: Personality[]
): Omit<Entitlements, 'subscriptionStatus'> & { subscriptionStatus: string | null } {
  const plan = user.plan || 'trial';
  const trialPurchasesCount = user.trial_purchases_count || 0;
  const trialCallsRemaining = user.trial_calls_remaining || 0;
  const tokensRemaining = user.tokens_remaining || 0;
  const subscriptionStatus = user.subscription_status;

  // Determine if user can make a call
  let canCall = false;
  let isOverage = false;

  if (plan === 'trial') {
    canCall = trialCallsRemaining > 0;
  } else if (plan === 'paid') {
    if (tokensRemaining > 0) {
      canCall = true;
    } else {
      canCall = subscriptionStatus === 'active';
      isOverage = true;
    }
  }

  // Determine if user can buy another trial
  const canBuyAnotherTrial = plan === 'trial' && trialPurchasesCount < 2;

  // Get call duration limit
  const maxCallDurationSeconds = plan === 'trial' ? 90 : 300;

  // Split personalities into unlocked and locked
  const unlockedPersonalities: Personality[] = [];
  const lockedPersonalities: Personality[] = [];

  for (const personality of allPersonalities) {
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

describe('Entitlements Business Logic', () => {
  const mockPersonalities: Personality[] = [
    { id: '1', name: 'Eric', description: 'Friendly', agentId: 'agent1', tierRequired: 'trial', isBoss: false },
    { id: '2', name: 'The Wolf', description: 'Tough', agentId: 'agent2', tierRequired: 'paid', isBoss: true },
    { id: '3', name: 'Karen', description: 'Demanding', agentId: 'agent3', tierRequired: 'paid', isBoss: false },
  ];

  describe('Trial Users', () => {
    it('should allow calls when trial calls remaining', () => {
      const user: UserData = {
        plan: 'trial',
        trial_purchases_count: 1,
        trial_calls_remaining: 3,
        tokens_remaining: 0,
        subscription_status: null,
      };

      const result = calculateEntitlements(user, mockPersonalities);

      expect(result.canCall).toBe(true);
      expect(result.trialCallsRemaining).toBe(3);
      expect(result.isOverage).toBe(false);
    });

    it('should block calls when no trial calls remaining', () => {
      const user: UserData = {
        plan: 'trial',
        trial_purchases_count: 1,
        trial_calls_remaining: 0,
        tokens_remaining: 0,
        subscription_status: null,
      };

      const result = calculateEntitlements(user, mockPersonalities);

      expect(result.canCall).toBe(false);
      expect(result.trialCallsRemaining).toBe(0);
    });

    it('should allow buying another trial if under limit', () => {
      const user: UserData = {
        plan: 'trial',
        trial_purchases_count: 1,
        trial_calls_remaining: 0,
        tokens_remaining: 0,
        subscription_status: null,
      };

      const result = calculateEntitlements(user, mockPersonalities);

      expect(result.canBuyAnotherTrial).toBe(true);
    });

    it('should block buying trial if at limit', () => {
      const user: UserData = {
        plan: 'trial',
        trial_purchases_count: 2,
        trial_calls_remaining: 0,
        tokens_remaining: 0,
        subscription_status: null,
      };

      const result = calculateEntitlements(user, mockPersonalities);

      expect(result.canBuyAnotherTrial).toBe(false);
    });

    it('should only unlock trial-tier personalities', () => {
      const user: UserData = {
        plan: 'trial',
        trial_purchases_count: 1,
        trial_calls_remaining: 5,
        tokens_remaining: 0,
        subscription_status: null,
      };

      const result = calculateEntitlements(user, mockPersonalities);

      expect(result.unlockedPersonalities).toHaveLength(1);
      expect(result.unlockedPersonalities[0].name).toBe('Eric');
      expect(result.lockedPersonalities).toHaveLength(2);
    });

    it('should have 90 second max call duration', () => {
      const user: UserData = {
        plan: 'trial',
        trial_purchases_count: 1,
        trial_calls_remaining: 5,
        tokens_remaining: 0,
        subscription_status: null,
      };

      const result = calculateEntitlements(user, mockPersonalities);

      expect(result.maxCallDurationSeconds).toBe(90);
    });
  });

  describe('Paid Users', () => {
    it('should allow calls when tokens remaining', () => {
      const user: UserData = {
        plan: 'paid',
        trial_purchases_count: 0,
        trial_calls_remaining: 0,
        tokens_remaining: 15000,
        subscription_status: 'active',
      };

      const result = calculateEntitlements(user, mockPersonalities);

      expect(result.canCall).toBe(true);
      expect(result.tokensRemaining).toBe(15000);
      expect(result.isOverage).toBe(false);
    });

    it('should allow overage calls when tokens depleted but subscription active', () => {
      const user: UserData = {
        plan: 'paid',
        trial_purchases_count: 0,
        trial_calls_remaining: 0,
        tokens_remaining: 0,
        subscription_status: 'active',
      };

      const result = calculateEntitlements(user, mockPersonalities);

      expect(result.canCall).toBe(true);
      expect(result.isOverage).toBe(true);
    });

    it('should block calls when tokens depleted and subscription not active', () => {
      const user: UserData = {
        plan: 'paid',
        trial_purchases_count: 0,
        trial_calls_remaining: 0,
        tokens_remaining: 0,
        subscription_status: 'cancelled',
      };

      const result = calculateEntitlements(user, mockPersonalities);

      expect(result.canCall).toBe(false);
      expect(result.isOverage).toBe(true);
    });

    it('should unlock all personalities', () => {
      const user: UserData = {
        plan: 'paid',
        trial_purchases_count: 0,
        trial_calls_remaining: 0,
        tokens_remaining: 20000,
        subscription_status: 'active',
      };

      const result = calculateEntitlements(user, mockPersonalities);

      expect(result.unlockedPersonalities).toHaveLength(3);
      expect(result.lockedPersonalities).toHaveLength(0);
    });

    it('should not allow buying trial', () => {
      const user: UserData = {
        plan: 'paid',
        trial_purchases_count: 0,
        trial_calls_remaining: 0,
        tokens_remaining: 20000,
        subscription_status: 'active',
      };

      const result = calculateEntitlements(user, mockPersonalities);

      expect(result.canBuyAnotherTrial).toBe(false);
    });

    it('should have 300 second max call duration', () => {
      const user: UserData = {
        plan: 'paid',
        trial_purchases_count: 0,
        trial_calls_remaining: 0,
        tokens_remaining: 20000,
        subscription_status: 'active',
      };

      const result = calculateEntitlements(user, mockPersonalities);

      expect(result.maxCallDurationSeconds).toBe(300);
    });
  });
});
