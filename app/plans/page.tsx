'use client';

import { useAuth, useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Breadcrumb from '@/components/Breadcrumb';
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
  const shouldShowMinutePackages = entitlements?.plan === 'paid' && ((entitlements.tokensRemaining ?? 0) <= 0 || entitlements.isOverage);

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

  async function handleBuyMinutes(packageType: 'small_boost' | 'focus_pack' | 'power_pack' | 'intensive_pack') {
    try {
      const priceIds = {
        small_boost: process.env.NEXT_PUBLIC_STRIPE_PRICE_SMALL_BOOST_ID!,
        focus_pack: process.env.NEXT_PUBLIC_STRIPE_PRICE_FOCUS_PACK_ID!,
        power_pack: process.env.NEXT_PUBLIC_STRIPE_PRICE_POWER_PACK_ID!,
        intensive_pack: process.env.NEXT_PUBLIC_STRIPE_PRICE_INTENSIVE_PACK_ID!,
      };

      const priceId = priceIds[packageType];

      console.log('[Minute Package] Creating checkout session for:', packageType);

      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, planType: 'minute_package' }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { url } = await response.json();

      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (err) {
      console.error('Error creating checkout session:', err);
      setError('Failed to start purchase. Please try again.');
    }
  }

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-[#080d1a] grid-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-[#00d9ff] border-r-transparent"></div>
          <p className="mt-4 text-[#94a3b8]">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return null;
  }

  return (
    <>
      <Sidebar />
      <main className="min-h-screen bg-[#080d1a] grid-background lg:pl-64">
        {/* Plans Content */}
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-12 py-12 sm:py-16">
        <Breadcrumb items={[{ label: 'Plans' }]} />

        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-extrabold text-white mb-6 sm:text-6xl">
            Choose Your Plan
          </h1>
          <p className="text-xl text-[#94a3b8] max-w-3xl mx-auto">
            Start with our trial to get a feel for DialDrill, or unlock unlimited potential with Pro.
            Practice sales calls with AI-powered personalities and level up your skills.
          </p>
          {entitlements && (
            <div className="mt-8 inline-block rounded-2xl border border-[#00d9ff]/30 bg-[#00d9ff]/10 px-6 py-3">
              <p className="text-sm text-[#00d9ff] font-semibold">
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
              ? 'border-[#00d9ff]/30 bg-gradient-to-br from-[rgba(0,217,255,0.1)] to-[rgba(15,23,42,0.95)] hover:border-[#334155]'
              : 'border-[#1e293b]/50 bg-gradient-to-br from-[rgba(15,23,42,0.6)] to-[rgba(5,9,17,0.8)] opacity-60'
          }`}>
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">Trial</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-extrabold text-white">$5</span>
                <span className="text-[#94a3b8]">one-time</span>
              </div>
              {entitlements && (
                <p className="text-sm text-[#64748b] mt-2">
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
                <svg className="h-6 w-6 text-[#00d9ff] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-white">5 AI practice calls</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="h-6 w-6 text-[#00d9ff] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-white">3 base personalities</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="h-6 w-6 text-[#00d9ff] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-white">90 second call limit</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="h-6 w-6 text-[#00d9ff] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-white">Purchase up to 2 trial packages (10 calls total)</span>
              </li>
            </ul>

            <button
              onClick={() => handleSelectPlan('trial')}
              disabled={!entitlements?.canBuyAnotherTrial}
              className={`w-full rounded-xl px-6 py-4 text-lg font-semibold transition-all ${
                entitlements?.canBuyAnotherTrial
                  ? 'bg-gradient-to-r from-[#00d9ff] to-[#00ffea] text-[#080d1a] hover:scale-[1.02] shadow-[0_0_40px_rgba(0,217,255,0.6)] hover:shadow-[0_0_60px_rgba(0,255,234,0.8)]'
                  : 'bg-white/10 text-white/50 cursor-not-allowed'
              }`}
            >
              {entitlements?.canBuyAnotherTrial ? 'Get Trial' : 'Trial Limit Reached'}
            </button>
          </div>

          {/* Pro Tier */}
          <div className="rounded-3xl border border-[#a855f7]/30 bg-gradient-to-br from-[rgba(168,85,247,0.1)] to-[rgba(15,23,42,0.95)] p-8 shadow-2xl backdrop-blur-xl relative hover:border-[#334155] transition-all">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <span className="inline-block rounded-full bg-gradient-to-r from-[#a855f7] to-[#9333ea] px-6 py-1.5 text-sm font-bold text-white shadow-lg">
                MOST POPULAR
              </span>
            </div>

            <div className="mb-6 mt-4">
              <h3 className="text-2xl font-bold text-white mb-2">Pro</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-extrabold text-white">$11.99</span>
                <span className="text-[#94a3b8]">/month</span>
              </div>
              <p className="text-sm text-[#64748b] mt-2">
                Cancel anytime
              </p>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <svg className="h-6 w-6 text-[#a855f7] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-white">20 minutes/month</span>
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
                <span className="text-white">$1/min for additional calls (automatic overage billing)</span>
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

        {shouldShowMinutePackages && (
          <div className="mt-24 max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-extrabold text-white mb-4">
                Add Minutes
              </h2>
              <p className="text-lg text-[#94a3b8]">
                You&apos;re out of included minutes. Add a package to keep practicing.
              </p>
            </div>

            {/* Minute Packages Table */}
            <div className="rounded-3xl border border-[#1e293b]/50 bg-gradient-to-br from-[rgba(15,23,42,0.6)] to-[rgba(5,9,17,0.8)] p-8 shadow-2xl backdrop-blur-xl overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#1e293b]/50">
                    <th className="text-left py-4 px-6 text-sm font-semibold text-[#94a3b8]">Package</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-[#94a3b8]">Minutes</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-[#94a3b8]">Price</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-[#94a3b8]">Price / Min</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-[#94a3b8]">Savings</th>
                    <th className="py-4 px-6"></th>
                  </tr>
                </thead>
                <tbody>
                  {/* Small Boost */}
                  <tr className="border-b border-[#1e293b]/50 hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-6 text-white font-medium">Small Boost</td>
                    <td className="py-4 px-6 text-white">+5 min</td>
                    <td className="py-4 px-6 text-white font-semibold">$5</td>
                    <td className="py-4 px-6 text-[#94a3b8]">$1.00</td>
                    <td className="py-4 px-6 text-[#64748b]">—</td>
                    <td className="py-4 px-6">
                      <button
                        onClick={() => handleBuyMinutes('small_boost')}
                        className="rounded-lg bg-gradient-to-r from-[#00d9ff] to-[#00ffea] px-6 py-2 text-sm font-semibold text-[#080d1a] transition-all hover:scale-105 shadow-[0_0_40px_rgba(0,217,255,0.6)] hover:shadow-[0_0_60px_rgba(0,255,234,0.8)]"
                      >
                        Buy
                      </button>
                    </td>
                  </tr>

                  {/* Focus Pack */}
                  <tr className="border-b border-[#1e293b]/50 hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-6 text-white font-medium">Focus Pack</td>
                    <td className="py-4 px-6 text-white">+10 min</td>
                    <td className="py-4 px-6 text-white font-semibold">$9</td>
                    <td className="py-4 px-6 text-[#94a3b8]">$0.90</td>
                    <td className="py-4 px-6 text-green-400">Save $1</td>
                    <td className="py-4 px-6">
                      <button
                        onClick={() => handleBuyMinutes('focus_pack')}
                        className="rounded-lg bg-gradient-to-r from-[#00d9ff] to-[#00ffea] px-6 py-2 text-sm font-semibold text-[#080d1a] transition-all hover:scale-105 shadow-[0_0_40px_rgba(0,217,255,0.6)] hover:shadow-[0_0_60px_rgba(0,255,234,0.8)]"
                      >
                        Buy
                      </button>
                    </td>
                  </tr>

                  {/* Power Pack */}
                  <tr className="border-b border-[#1e293b]/50 hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-6 text-white font-medium">Power Pack</td>
                    <td className="py-4 px-6 text-white">+20 min</td>
                    <td className="py-4 px-6 text-white font-semibold">$16</td>
                    <td className="py-4 px-6 text-[#94a3b8]">$0.80</td>
                    <td className="py-4 px-6 text-green-400">Save $4</td>
                    <td className="py-4 px-6">
                      <button
                        onClick={() => handleBuyMinutes('power_pack')}
                        className="rounded-lg bg-gradient-to-r from-[#00d9ff] to-[#00ffea] px-6 py-2 text-sm font-semibold text-[#080d1a] transition-all hover:scale-105 shadow-[0_0_40px_rgba(0,217,255,0.6)] hover:shadow-[0_0_60px_rgba(0,255,234,0.8)]"
                      >
                        Buy
                      </button>
                    </td>
                  </tr>

                  {/* Intensive Pack */}
                  <tr className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-6 text-white font-medium">Intensive Pack</td>
                    <td className="py-4 px-6 text-white">+50 min</td>
                    <td className="py-4 px-6 text-white font-semibold">$35</td>
                    <td className="py-4 px-6 text-[#94a3b8]">$0.70</td>
                    <td className="py-4 px-6 text-green-400 font-semibold">Save $15</td>
                    <td className="py-4 px-6">
                      <button
                        onClick={() => handleBuyMinutes('intensive_pack')}
                        className="rounded-lg bg-gradient-to-r from-[#a855f7] to-[#9333ea] px-6 py-2 text-sm font-semibold text-white transition-all hover:scale-105"
                      >
                        Buy
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="text-center text-sm text-[#94a3b8] mt-6">
              Minute packages never expire and apply automatically to your next call.
            </p>
          </div>
        )}

        {/* FAQ Section */}
        <div className="mt-24 max-w-4xl mx-auto">
          <div className="rounded-3xl border border-[#1e293b]/50 bg-gradient-to-br from-[rgba(15,23,42,0.6)] to-[rgba(5,9,17,0.8)] p-12 shadow-2xl backdrop-blur-xl">
            <h2 className="text-3xl font-extrabold text-white mb-8 text-center">
              Frequently Asked Questions
            </h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">What happens after I use my 2 trials?</h3>
                <p className="text-[#94a3b8]">
                  After purchasing both trial packages, you&apos;ll need to upgrade to the Pro plan to continue practicing.
                  The Pro plan gives you significantly more value with 20 minutes per month.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Can I cancel my Pro subscription anytime?</h3>
                <p className="text-[#94a3b8]">
                  Yes! You can cancel your Pro subscription at any time. You&apos;ll continue to have access until the end of your current billing period.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-2">How do minutes work?</h3>
                <p className="text-[#94a3b8]">
                  Minutes are your practice call credits. Pro plan includes 20 minutes per month.
                  If you run out, you can purchase additional minute packages or continue at $1/min.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-2">What are the different personalities?</h3>
                <p className="text-[#94a3b8]">
                  Trial users can practice with three approachable owners (hardware store, florist, and gym) to nail the fundamentals.
                  Upgrading to Pro unlocks five boss personalities designed for tough objection handling:
                </p>
                <ul className="mt-3 space-y-2 text-sm text-[#94a3b8]">
                  <li><span className="text-[#00d9ff] font-semibold">The Wolf</span> — pressure-tests aggressive closing tactics.</li>
                  <li><span className="text-[#00d9ff] font-semibold">The Shark</span> — challenges pricing and ROI claims.</li>
                  <li><span className="text-[#00d9ff] font-semibold">The Motivator</span> — keeps energy high while probing for vision.</li>
                  <li><span className="text-[#00d9ff] font-semibold">The Oracle</span> — forces you to defend long-term strategy.</li>
                  <li><span className="text-[#00d9ff] font-semibold">The Titan</span> — expects concise, executive-ready pitches.</li>
                </ul>
              </div>
            </div>

            <div className="mt-10 text-center">
              <Link
                href="/dashboard"
                className="inline-block rounded-full bg-gradient-to-r from-[#00d9ff] to-[#00ffea] px-8 py-3 text-base font-semibold text-[#080d1a] transition-all hover:scale-105 shadow-[0_0_40px_rgba(0,217,255,0.6)] hover:shadow-[0_0_60px_rgba(0,255,234,0.8)]"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
        </div>
      </main>
    </>
  );
}
