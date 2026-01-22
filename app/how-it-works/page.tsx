'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import Toast from '@/components/Toast';
import clientLogger from '@/lib/client-logger';
import Button from '@/components/ui/Button';

// ⚠️ PASTE YOUR LOOM VIDEO EMBED URL HERE ⚠️
// To get your Loom embed URL:
// 1. Upload your video to Loom
// 2. Click "Share" → "Embed"
// 3. Copy the embed URL (format: "https://www.loom.com/embed/YOUR_VIDEO_ID")
// 4. Paste it below, replacing "PASTE_LOOM_LINK_HERE"
const LOOM_VIDEO_URL = "PASTE_LOOM_LINK_HERE";

export default function HowItWorksPage() {
  const { isSignedIn } = useAuth();
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' | 'info' }>({
    show: false,
    message: '',
    type: 'error',
  });

  async function handleStartTrial() {
    if (isSignedIn) {
      window.location.href = '/dashboard';
      return;
    }

    try {
      setCheckoutLoading(true);
      const priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_TRIAL_ID!;

      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, planType: 'trial' }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      clientLogger.error('[How It Works] Checkout failed', error);
      setCheckoutLoading(false);
      setToast({
        show: true,
        message: 'Failed to start checkout. Please try again.',
        type: 'error',
      });
    }
  }

  return (
    <main className="min-h-screen bg-[var(--color-dark-bg)] grid-background">
      <Toast
        message={toast.message}
        type={toast.type}
        show={toast.show}
        onClose={() => setToast({ ...toast, show: false })}
      />
      {/* Header */}
      <header className="border-b border-[var(--color-border-subtle)]/50 bg-[var(--color-dark-bg)]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-12">
          <div className="flex h-20 items-center justify-between">
            <Link href="/" className="text-2xl font-extrabold text-white hover:opacity-80 transition-opacity">
              Dial<span className="text-[var(--color-cyan-bright)]">Drill</span>
            </Link>
            <Link
              href="/"
              className="text-sm font-semibold text-[var(--color-text-secondary)] transition-colors hover:text-white"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-6">
              See How <span className="text-[var(--color-cyan-bright)]">DialDrill</span> Works
            </h1>
            <p className="text-lg sm:text-xl text-[var(--color-text-secondary)] max-w-3xl mx-auto">
              Watch this quick demo to see how our AI-powered sales training platform helps you master objection handling and close more deals.
            </p>
          </div>

          {/* Video Container */}
          <div className="max-w-5xl mx-auto mb-16">
            <div className="relative rounded-3xl overflow-hidden border border-[var(--color-border-subtle)]/50 bg-gradient-to-br from-card-bg to-[rgba(5,9,17,0.8)] p-2 sm:p-4 shadow-[0_20px_60px_rgba(0,0,0,0.5),0_0_40px_rgba(15,155,153,0.1)] backdrop-blur-xl transition-all duration-300 hover:border-[var(--color-border-medium)] hover:shadow-[0_20px_80px_rgba(0,0,0,0.6),0_0_60px_rgba(15,155,153,0.2)] hover:-translate-y-1">
              <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                {LOOM_VIDEO_URL !== "PASTE_LOOM_LINK_HERE" ? (
                  <iframe
                    src={LOOM_VIDEO_URL}
                    frameBorder="0"
                    allowFullScreen
                    className="absolute top-0 left-0 w-full h-full rounded-2xl"
                  ></iframe>
                ) : (
                  <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-gradient-to-br from-[#0f172a] to-[var(--color-border-subtle)] rounded-2xl">
                    <div className="text-center p-8">
                      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[var(--color-cyan-muted)]/10 mb-6">
                        <svg className="w-10 h-10 text-[var(--color-cyan-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <p className="text-xl font-bold text-white mb-2">Video Coming Soon</p>
                      <p className="text-[var(--color-text-secondary)]">We&apos;re preparing an awesome demo for you!</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Benefits Section */}
          <div className="max-w-5xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white text-center mb-12">
              What You&apos;ll Get
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {[
                {
                  icon: (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  ),
                  title: '5 Practice Calls',
                  description: 'Get hands-on experience with real sales scenarios'
                },
                {
                  icon: (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  ),
                  title: '90 Second Calls',
                  description: 'Quick, focused practice sessions that fit your schedule'
                },
                {
                  icon: (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  ),
                  title: '3 AI Personalities',
                  description: 'Practice with different prospect types and objections'
                },
                {
                  icon: (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  ),
                  title: 'Real-Time Feedback',
                  description: 'Get instant insights on your performance'
                },
                {
                  icon: (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  ),
                  title: 'Call Transcripts',
                  description: 'Review and learn from every conversation'
                },
                {
                  icon: (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  ),
                  title: 'Only $5',
                  description: 'Risk-free way to transform your sales skills'
                },
              ].map((benefit, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-[var(--color-border-subtle)]/50 bg-gradient-to-br from-white/[0.03] to-transparent p-6 transition-all duration-300 hover:border-[var(--color-border-medium)] hover:bg-white/[0.05] hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(15,155,153,0.15)]"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--color-cyan-muted)]/20 to-[var(--color-cyan-muted)]/5 ring-1 ring-[var(--color-cyan-muted)]/20 mb-4 transition-all duration-300 group-hover:scale-110">
                    <svg className="h-6 w-6 text-[var(--color-cyan-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      {benefit.icon}
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{benefit.title}</h3>
                  <p className="text-[var(--color-text-secondary)] text-sm">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="max-w-3xl mx-auto text-center">
            <div className="rounded-3xl border border-[var(--color-border-subtle)]/50 bg-gradient-to-br from-[rgba(15,155,153,0.05)] to-transparent p-8 sm:p-12 shadow-[0_0_40px_rgba(15,155,153,0.1)]">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
                Ready to Transform Your Sales Skills?
              </h2>
              <p className="text-lg text-[var(--color-text-secondary)] mb-8">
                Start your $5 trial today and get 5 AI-powered practice calls to master objection handling.
              </p>
              <Button
                onClick={handleStartTrial}
                disabled={checkoutLoading}
                variant="primary"
                size="lg"
                className="btn-glow group"
              >
                {checkoutLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-[var(--color-dark-bg)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : isSignedIn ? (
                  <>
                    Go to Dashboard
                    <svg
                      className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                ) : (
                  <>
                    Start Your Trial Today — Just $5
                    <svg
                      className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </Button>
              <p className="mt-6 text-sm text-[var(--color-text-muted)]">
                No commitment. Cancel anytime. Start practicing in minutes.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
