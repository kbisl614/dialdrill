'use client';

import { useAuth, useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Entitlements {
  plan: 'trial' | 'paid';
  canCall: boolean;
  trialCallsRemaining?: number;
  tokensRemaining?: number;
  isOverage: boolean;
  trialPurchasesCount: number;
  canBuyAnotherTrial: boolean;
}

export default function PlansPage() {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const [entitlements, setEntitlements] = useState<Entitlements | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/');
    }
  }, [isSignedIn, isLoaded, router]);

  useEffect(() => {
    async function fetchEntitlements() {
      if (!user?.id) return;

      try {
        const response = await fetch('/api/user/entitlements');
        if (!response.ok) {
          throw new Error('Failed to fetch entitlements');
        }
        const data = await response.json();
        setEntitlements(data);
      } catch (err) {
        console.error('Error fetching entitlements:', err);
        setError('Failed to load your data. Please try refreshing the page.');
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      fetchEntitlements();
    }
  }, [user]);

  async function handleSelectPlan(planType: 'trial' | 'paid') {
    if (!entitlements) return;

    try {
      const priceId = planType === 'trial'
        ? process.env.NEXT_PUBLIC_STRIPE_PRICE_TRIAL_ID!
        : process.env.NEXT_PUBLIC_STRIPE_PRICE_PAID_ID!;

      console.log('[Upgrade] Creating checkout session for plan:', planType);

      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, planType }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { url } = await response.json();

      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (err) {
      console.error('Error creating checkout session:', err);
      setError('Failed to start upgrade process. Please try again.');
    }
  }

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-[#020817] grid-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-[#2dd4e6] border-r-transparent"></div>
          <p className="mt-4 text-[#9ca3af]">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[#020817] grid-background">
      {/* Header */}
      <header className="border-b border-white/5 bg-[#020817]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            <Link href="/dashboard" className="text-2xl font-extrabold text-white hover:opacity-80 transition-opacity">
              Dial<span className="text-[#2dd4e6]">Drill</span>
            </Link>
            <div className="flex items-center gap-6">
              <Link
                href="/dashboard"
                className="text-sm font-semibold text-[#9ca3af] transition-colors hover:text-white"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Plans Content */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-extrabold text-white mb-6 sm:text-6xl">
            Choose Your Plan
          </h1>
          <p className="text-xl text-[#9ca3af] max-w-3xl mx-auto">
            Start with our trial to get a feel for DialDrill, or unlock unlimited potential with Pro.
            Practice sales calls with AI-powered personalities and level up your skills.
          </p>
          {entitlements && (
            <div className="mt-8 inline-block rounded-2xl border border-[#2dd4e6]/30 bg-[#2dd4e6]/10 px-6 py-3">
              <p className="text-sm text-[#2dd4e6] font-semibold">
                Current Plan: {entitlements.plan === 'trial' ? 'Trial' : 'Pro'}
                {entitlements.plan === 'trial' && ` • ${entitlements.trialPurchasesCount}/2 trials used`}
              </p>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-8 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-red-400 max-w-3xl mx-auto">
            {error}
          </div>
        )}

        {/* Payment Tiers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
          {/* Trial Tier */}
          <div className={`rounded-3xl border p-8 shadow-2xl backdrop-blur-xl transition-all ${
            entitlements?.canBuyAnotherTrial
              ? 'border-[#2dd4e6]/30 bg-gradient-to-br from-[rgba(45,212,230,0.1)] to-[rgba(15,23,42,0.95)]'
              : 'border-white/10 bg-gradient-to-br from-[rgba(15,23,42,0.5)] to-[rgba(15,23,42,0.8)] opacity-60'
          }`}>
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">Trial</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-extrabold text-white">$5</span>
                <span className="text-[#9ca3af]">one-time</span>
              </div>
              {entitlements && (
                <p className="text-sm text-[#9ca3af] mt-2">
                  {entitlements.trialPurchasesCount === 0
                    ? 'First trial - 2 trials available total'
                    : entitlements.trialPurchasesCount === 1
                    ? '1 trial used - 1 more available'
                    : '2 trials used - No more trials available'}
                </p>
              )}
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <svg className="h-6 w-6 text-[#2dd4e6] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-white">5 AI practice calls</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="h-6 w-6 text-[#2dd4e6] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-white">3 base personalities</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="h-6 w-6 text-[#2dd4e6] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-white">90 second call limit</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="h-6 w-6 text-[#2dd4e6] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-white">Can purchase up to 2 times</span>
              </li>
            </ul>

            <button
              onClick={() => handleSelectPlan('trial')}
              disabled={!entitlements?.canBuyAnotherTrial}
              className={`w-full rounded-xl px-6 py-4 text-lg font-semibold transition-all ${
                entitlements?.canBuyAnotherTrial
                  ? 'bg-gradient-to-r from-[#2dd4e6] to-[#1ab5c4] text-[#020817] hover:scale-[1.02] shadow-[0_0_30px_rgba(45,212,230,0.4)] hover:shadow-[0_0_40px_rgba(45,212,230,0.6)]'
                  : 'bg-white/10 text-white/50 cursor-not-allowed'
              }`}
            >
              {entitlements?.canBuyAnotherTrial ? 'Get Trial' : 'Trial Limit Reached'}
            </button>
          </div>

          {/* Pro Tier */}
          <div className="rounded-3xl border border-[#a855f7]/30 bg-gradient-to-br from-[rgba(168,85,247,0.1)] to-[rgba(15,23,42,0.95)] p-8 shadow-2xl backdrop-blur-xl relative">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <span className="inline-block rounded-full bg-gradient-to-r from-[#a855f7] to-[#9333ea] px-6 py-1.5 text-sm font-bold text-white shadow-lg">
                MOST POPULAR
              </span>
            </div>

            <div className="mb-6 mt-4">
              <h3 className="text-2xl font-bold text-white mb-2">Pro</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-extrabold text-white">$11.99</span>
                <span className="text-[#9ca3af]">/month</span>
              </div>
              <p className="text-sm text-[#9ca3af] mt-2">
                Cancel anytime
              </p>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <svg className="h-6 w-6 text-[#a855f7] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-white">20,000 tokens/month (~20 calls)</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="h-6 w-6 text-[#a855f7] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-white">All 8 personalities (including 5 bosses)</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="h-6 w-6 text-[#a855f7] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-white">5 minute call limit</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="h-6 w-6 text-[#a855f7] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-white">$1/call overage when out of tokens</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="h-6 w-6 text-[#a855f7] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-white">Priority support</span>
              </li>
            </ul>

            <button
              onClick={() => handleSelectPlan('paid')}
              className="w-full rounded-xl bg-gradient-to-r from-[#a855f7] to-[#9333ea] px-6 py-4 text-lg font-semibold text-white transition-all hover:scale-[1.02] shadow-[0_0_30px_rgba(168,85,247,0.4)] hover:shadow-[0_0_40px_rgba(168,85,247,0.6)]"
            >
              Get Pro
            </button>
          </div>
        </div>

        {/* Additional Info Section */}
        <div className="max-w-4xl mx-auto">
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[rgba(15,23,42,0.95)] to-[rgba(15,23,42,0.8)] p-12 shadow-2xl backdrop-blur-xl">
            <h2 className="text-3xl font-extrabold text-white mb-8 text-center">
              Frequently Asked Questions
            </h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">What happens after I use my 2 trials?</h3>
                <p className="text-[#9ca3af]">
                  After purchasing both trial packages, you'll need to upgrade to the Pro plan to continue practicing.
                  The Pro plan gives you significantly more value with 20,000 tokens per month.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Can I cancel my Pro subscription anytime?</h3>
                <p className="text-[#9ca3af]">
                  Yes! You can cancel your Pro subscription at any time. You'll continue to have access until the end of your current billing period.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-2">What are tokens?</h3>
                <p className="text-[#9ca3af]">
                  Tokens are your practice call credits. Each call uses 1,000 tokens, giving you approximately 20 calls per month with the Pro plan.
                  If you run out, you can continue calling at $1 per call.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-2">What are the different personalities?</h3>
                <p className="text-[#9ca3af]">
                  Trial users get access to 3 base personalities (hardware store owner, florist, gym owner).
                  Pro users unlock 5 additional "boss" personalities including The Wolf, The Shark, and more challenging scenarios.
                </p>
              </div>
            </div>

            <div className="mt-10 text-center">
              <Link
                href="/dashboard"
                className="inline-block rounded-full bg-gradient-to-r from-[#2dd4e6] to-[#1ab5c4] px-8 py-3 text-base font-semibold text-[#020817] transition-all hover:scale-105 shadow-[0_0_30px_rgba(45,212,230,0.4)] hover:shadow-[0_0_40px_rgba(45,212,230,0.6)]"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
