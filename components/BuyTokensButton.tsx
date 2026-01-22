'use client';

import { useAuth } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Plan = 'trial' | 'paid';

interface Entitlements {
  plan: Plan;
  trialPurchasesCount: number;
  canBuyAnotherTrial: boolean;
}

type ModalState = 'hidden' | 'trialOptions' | 'upgradeOnly' | 'paidInfo';

async function startCheckout(planType: Plan) {
  const priceId = planType === 'trial'
    ? process.env.NEXT_PUBLIC_STRIPE_PRICE_TRIAL_ID
    : process.env.NEXT_PUBLIC_STRIPE_PRICE_PAID_ID;

  if (!priceId) {
    throw new Error('Missing Stripe price configuration');
  }

  const response = await fetch('/api/stripe/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ priceId, planType }),
  });

  if (!response.ok) {
    throw new Error('Failed to create checkout session');
  }

  const { url } = await response.json();
  window.location.href = url;
}

export default function BuyTokensButton() {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const [entitlements, setEntitlements] = useState<Entitlements | null>(null);
  const [entitlementsError, setEntitlementsError] = useState<string | null>(null);
  const [entitlementsLoading, setEntitlementsLoading] = useState(false);
  const [modalState, setModalState] = useState<ModalState>('hidden');
  const [checkoutLoading, setCheckoutLoading] = useState<Plan | null>(null);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    async function fetchEntitlements() {
      if (!isSignedIn) {
        setEntitlements(null);
        setEntitlementsError(null);
        setEntitlementsLoading(false);
        return;
      }

      try {
        setEntitlementsLoading(true);
        const response = await fetch('/api/user/entitlements', { signal: controller.signal });
        if (!response.ok) {
          throw new Error('Failed to load entitlements');
        }
        const data = await response.json();
        if (isMounted) {
          setEntitlements({
            plan: data.plan,
            trialPurchasesCount: data.trialPurchasesCount,
            canBuyAnotherTrial: data.canBuyAnotherTrial,
          });
          setEntitlementsError(null);
        }
      } catch (error) {
        if (isMounted && !(error instanceof DOMException && error.name === 'AbortError')) {
          console.error('[BuyTokensButton] Failed to load entitlements:', error);
          setEntitlementsError('Unable to load your plan details. Please try again.');
          setEntitlements(null);
        }
      } finally {
        if (isMounted) {
          setEntitlementsLoading(false);
        }
      }
    }

    fetchEntitlements();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [isSignedIn]);

  async function handleCheckout(planType: Plan) {
    try {
      setCheckoutLoading(planType);
      await startCheckout(planType);
    } catch (error) {
      console.error('[BuyTokensButton] Checkout failed:', error);
      setEntitlementsError('Unable to start checkout. Please try again.');
      setCheckoutLoading(null);
    }
  }

  function handleButtonClick() {
    if (!isSignedIn) {
      router.push('/sign-in');
      return;
    }

    if (entitlementsLoading) {
      return;
    }

    if (!entitlements) {
      setEntitlementsError('Still loading your plan details. Please try again in a moment.');
      return;
    }

    if (entitlements.plan === 'trial') {
      if (entitlements.canBuyAnotherTrial) {
        setModalState('trialOptions');
      } else {
        setModalState('upgradeOnly');
      }
    } else {
      setModalState('paidInfo');
    }
  }

  function closeModal() {
    setModalState('hidden');
    setCheckoutLoading(null);
  }

  if (!isSignedIn) {
    return (
      <button
        onClick={() => router.push('/plans')}
        className="fixed right-6 top-6 z-50 rounded-full bg-gradient-to-r from-[#2dd4e6] to-[var(--color-purple-dark)] px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-[#2dd4e6]/30 transition hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/50"
      >
        Add Minutes
      </button>
    );
  }

  return (
    <>
      <button
        onClick={handleButtonClick}
        disabled={entitlementsLoading || checkoutLoading !== null}
        className="fixed right-6 top-6 z-50 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#2dd4e6] to-[var(--color-purple-dark)] px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-[#2dd4e6]/30 transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/50"
      >
        {entitlementsLoading ? 'Loading...' : 'Add Minutes'}
      </button>

      {modalState !== 'hidden' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#030712] p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Add Minutes</h2>
              <button
                onClick={closeModal}
                className="rounded-full p-1 text-white/60 transition hover:text-white"
                aria-label="Close"
              >
                X
              </button>
            </div>

            {modalState === 'trialOptions' && (
              <>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  Need more practice time? Purchase another $5 trial (limit 2) or upgrade to Pro for unlimited access to all personalities and longer calls.
                </p>
                <div className="mt-6 space-y-3">
                  <button
                    onClick={() => handleCheckout('trial')}
                    disabled={!entitlements?.canBuyAnotherTrial || checkoutLoading !== null}
                    className="w-full rounded-xl bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {checkoutLoading === 'trial' ? 'Redirecting…' : 'Buy another $5 trial'}
                  </button>
                  <button
                    onClick={() => handleCheckout('paid')}
                    disabled={checkoutLoading !== null}
                    className="w-full rounded-xl bg-gradient-to-r from-[var(--color-purple)] to-[var(--color-purple-dark)] px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {checkoutLoading === 'paid' ? 'Redirecting…' : 'Upgrade to Pro ($11.99 / mo)'}
                  </button>
                </div>
              </>
            )}

            {modalState === 'upgradeOnly' && (
              <>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  You have already used both available $5 trials. Upgrade to the Pro plan to unlock 20 minutes each month and all eight personalities.
                </p>
                <button
                  onClick={() => handleCheckout('paid')}
                  disabled={checkoutLoading !== null}
                  className="mt-6 w-full rounded-xl bg-gradient-to-r from-[var(--color-purple)] to-[var(--color-purple-dark)] px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {checkoutLoading === 'paid' ? 'Redirecting…' : 'Upgrade to Pro'}
                </button>
              </>
            )}

            {modalState === 'paidInfo' && (
              <p className="text-sm text-[var(--color-text-secondary)]">
                You&apos;re already on the highest tier. Additional calls are billed automatically at $1 per minute when you run out of included minutes.
              </p>
            )}

            {entitlementsError && (
              <p className="mt-4 text-sm text-red-400">{entitlementsError}</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
