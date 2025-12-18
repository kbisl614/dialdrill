'use client';

import { useAuth, useUser, SignOutButton } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Entitlements {
  plan: 'trial' | 'paid';
  canCall: boolean;
  trialCallsRemaining?: number;
  tokensRemaining?: number;
  isOverage: boolean;
  trialPurchasesCount: number;
  canBuyAnotherTrial: boolean;
}

export default function Dashboard() {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const [entitlements, setEntitlements] = useState<Entitlements | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startingCall, setStartingCall] = useState(false);

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

  async function handleStartCall() {
    const perfStart = performance.now();
    console.log('[PERF] Button click → Start call flow');

    // UI-level check
    if (!entitlements || !entitlements.canCall) {
      setError("You're out of call credits. Please upgrade to continue.");
      return;
    }

    setStartingCall(true);
    setError(null);

    try {
      const apiCallStart = performance.now();
      console.log(`[PERF] ${(apiCallStart - perfStart).toFixed(0)}ms - Calling /api/calls/start`);

      const response = await fetch('/api/calls/start', {
        method: 'POST',
      });

      const apiCallEnd = performance.now();
      console.log(`[PERF] ${(apiCallEnd - perfStart).toFixed(0)}ms - API response received (took ${(apiCallEnd - apiCallStart).toFixed(0)}ms)`);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to start call');
      }

      const data = await response.json();
      console.log('Call started:', data);

      // Refresh entitlements after call starts
      const entitlementsResponse = await fetch('/api/user/entitlements');
      if (entitlementsResponse.ok) {
        const updatedEntitlements = await entitlementsResponse.json();
        setEntitlements(updatedEntitlements);
      }

      const navStart = performance.now();
      console.log(`[PERF] ${(navStart - perfStart).toFixed(0)}ms - Navigating to call page`);

      // Navigate to call interface with max duration param
      const maxDuration = data.maxDurationSeconds || 300;
      router.push(`/call/${data.agentId}?maxDuration=${maxDuration}`);

      console.log(`[PERF] Total dashboard flow: ${(navStart - perfStart).toFixed(0)}ms`);
    } catch (err) {
      console.error('Error starting call:', err);
      setError(err instanceof Error ? err.message : 'Failed to start call');
    } finally {
      setStartingCall(false);
    }
  }

  function scrollToTiers() {
    const tiersSection = document.getElementById('payment-tiers');
    if (tiersSection) {
      tiersSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

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

  // Helper function to format credit display
  function getCreditsDisplay() {
    if (!entitlements) return { label: 'Credits', value: '—', max: 0, current: 0 };

    if (entitlements.plan === 'trial') {
      return {
        label: 'Calls Remaining',
        value: entitlements.trialCallsRemaining?.toString() || '0',
        max: 5,
        current: entitlements.trialCallsRemaining || 0,
      };
    } else {
      // Paid plan
      const tokens = entitlements.tokensRemaining || 0;
      const calls = Math.floor(tokens / 1000);
      return {
        label: 'Tokens Remaining',
        value: `${tokens.toLocaleString()}`,
        subValue: `(~${calls} calls)`,
        max: 20000,
        current: tokens,
        isOverage: entitlements.isOverage,
      };
    }
  }

  const creditsDisplay = getCreditsDisplay();

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
            <div className="text-2xl font-extrabold text-white">
              Dial<span className="text-[#2dd4e6]">Drill</span>
            </div>
            <div className="flex items-center gap-6">
              <button
                onClick={scrollToTiers}
                className="text-sm font-semibold text-[#9ca3af] transition-colors hover:text-white"
              >
                Plans
              </button>
              <SignOutButton>
                <button className="rounded-full border border-white/10 bg-white/5 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-white/10">
                  Sign Out
                </button>
              </SignOutButton>
            </div>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16">
        {/* Welcome Section */}
        <div className="mb-12">
          <h1 className="text-4xl font-extrabold text-white sm:text-5xl">
            Welcome back, <span className="text-[#2dd4e6]">{user?.emailAddresses[0]?.emailAddress}</span>
          </h1>
          <p className="mt-4 text-xl text-[#9ca3af]">
            Ready to practice your sales skills?
          </p>
        </div>

        {error && (
          <div className="mb-8 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-red-400">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Credits Card */}
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[rgba(15,23,42,0.95)] to-[rgba(15,23,42,0.8)] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.5),0_0_40px_rgba(45,212,230,0.1)] backdrop-blur-xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[#2dd4e6]/30 to-[#2dd4e6]/10 ring-2 ring-[#2dd4e6]/30">
                <svg className="h-7 w-7 text-[#2dd4e6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-[#9ca3af]">{creditsDisplay.label}</p>
                <p className="text-4xl font-extrabold text-white tabular-nums">
                  {creditsDisplay.value}
                </p>
                {creditsDisplay.subValue && (
                  <p className="text-sm text-[#9ca3af] mt-1">{creditsDisplay.subValue}</p>
                )}
              </div>
            </div>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/5 ring-1 ring-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#2dd4e6] to-[#22c55e] shadow-[0_0_20px_rgba(45,212,230,0.4)] transition-all"
                style={{ width: `${(creditsDisplay.current / creditsDisplay.max) * 100}%` }}
              ></div>
            </div>
            {creditsDisplay.isOverage && (
              <div className="mt-4 rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-3">
                <p className="text-sm text-yellow-400">
                  Out of tokens - Additional calls billed at $1 each
                </p>
              </div>
            )}

            {/* Upgrade Button - Show for trial users */}
            {entitlements?.plan === 'trial' && (
              <button
                onClick={scrollToTiers}
                className="mt-4 w-full rounded-xl bg-gradient-to-r from-[#a855f7] to-[#9333ea] px-6 py-3 text-sm font-semibold text-white transition-all hover:scale-[1.02] shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)]"
              >
                View Plans
              </button>
            )}
          </div>

          {/* Account Info Card */}
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[rgba(15,23,42,0.95)] to-[rgba(15,23,42,0.8)] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.5)] backdrop-blur-xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[#a855f7]/30 to-[#a855f7]/10 ring-2 ring-[#a855f7]/30">
                <svg className="h-7 w-7 text-[#a855f7]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-[#9ca3af]">Account Type</p>
                <p className="text-2xl font-extrabold text-white">
                  {entitlements?.plan === 'trial' ? 'Trial' : 'Pro'}
                </p>
              </div>
            </div>
            <p className="text-sm text-[#9ca3af] mt-2">
              {entitlements?.plan === 'trial'
                ? 'Upgrade to Pro for more personalities and longer calls'
                : 'Pro plan with all features unlocked'}
            </p>
          </div>
        </div>

        {/* Start Call CTA */}
        <div className="rounded-3xl border border-[#2dd4e6]/20 bg-gradient-to-br from-[rgba(15,23,42,0.95)] to-[rgba(15,23,42,0.8)] p-12 shadow-[0_20px_60px_rgba(0,0,0,0.5),0_0_60px_rgba(45,212,230,0.15)] backdrop-blur-xl text-center">
          <h2 className="text-3xl font-extrabold text-white mb-4">
            Ready to practice?
          </h2>
          <p className="text-lg text-[#9ca3af] mb-8 max-w-2xl mx-auto">
            Start a new AI-powered sales call simulation and master objection handling in real-time.
          </p>
          <button
            onClick={handleStartCall}
            className="rounded-full bg-gradient-to-r from-[#2dd4e6] to-[#1ab5c4] px-12 py-5 text-xl font-semibold text-[#020817] transition-all hover:scale-105 shadow-[0_0_40px_rgba(45,212,230,0.4)] hover:shadow-[0_0_60px_rgba(45,212,230,0.6)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            disabled={!entitlements || !entitlements.canCall || startingCall}
          >
            {startingCall ? 'Starting Call...' : (!entitlements || !entitlements.canCall) ? 'Out of Call Credits' : 'Start Call'}
          </button>
          {entitlements && !entitlements.canCall && entitlements.plan === 'trial' && (
            <div className="mt-6">
              <p className="text-sm text-[#9ca3af] mb-4">
                You're out of call credits. Please upgrade to continue.
              </p>
              <button
                onClick={scrollToTiers}
                className="rounded-full bg-gradient-to-r from-[#a855f7] to-[#9333ea] px-8 py-3 text-base font-semibold text-white transition-all hover:scale-105 shadow-[0_0_30px_rgba(168,85,247,0.4)] hover:shadow-[0_0_40px_rgba(168,85,247,0.6)]"
              >
                View Plans
              </button>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-xl text-center">
            <p className="text-sm font-medium text-[#9ca3af] mb-2">Total Calls</p>
            <p className="text-3xl font-extrabold text-white">0</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-xl text-center">
            <p className="text-sm font-medium text-[#9ca3af] mb-2">Avg. Score</p>
            <p className="text-3xl font-extrabold text-white">—</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-xl text-center">
            <p className="text-sm font-medium text-[#9ca3af] mb-2">Success Rate</p>
            <p className="text-3xl font-extrabold text-white">—</p>
          </div>
        </div>

        {/* Payment Tiers Section */}
        <div id="payment-tiers" className="mt-24 scroll-mt-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-extrabold text-white mb-4">
              Choose Your Plan
            </h2>
            <p className="text-lg text-[#9ca3af] max-w-2xl mx-auto">
              Start with our trial or unlock unlimited potential with Pro
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
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
        </div>
      </div>
    </main>
  );
}
