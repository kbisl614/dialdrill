'use client';

import { useAuth, SignUpButton, SignInButton } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const { isSignedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isSignedIn) {
      router.push('/dashboard');
    }
  }, [isSignedIn, router]);

  return (
    <main className="min-h-screen bg-[#020817] grid-background">
      {/* Header with Logo */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#020817]/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            <div className="text-2xl font-extrabold text-white">
              Dial<span className="text-[#2dd4e6]">Drill</span>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <SignInButton mode="modal">
                <button className="text-sm font-medium text-[#9ca3af] transition-colors hover:text-white">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="rounded-full bg-gradient-to-r from-[#2dd4e6] to-[#1ab5c4] px-6 py-2.5 text-sm font-semibold text-[#020817] transition-all hover:scale-105">
                  Get Started
                </button>
              </SignUpButton>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-24 lg:pt-40 lg:pb-40">
        <div className="radial-glow">
          <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
            {/* Pill Badge */}
            <div className="flex justify-center mb-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-[#e5e7eb] backdrop-blur-sm">
                <span className="flex h-2 w-2">
                  <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-[#22c55e] opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#22c55e]"></span>
                </span>
                Now live — Start practicing today
              </div>
            </div>

            {/* Main Headline */}
            <div className="text-center">
              <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl">
                Master objection handling
                <br />
                with <span className="text-[#2dd4e6]">AI-powered drills</span>
              </h1>
              <p className="mt-8 text-xl text-[#9ca3af] max-w-3xl mx-auto leading-relaxed">
                Practice sales calls with realistic AI prospects. Get instant feedback.
                Close more deals. Transform your team from nervous to confident in weeks, not months.
              </p>

              {/* CTA Buttons */}
              <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
                <SignUpButton mode="modal">
                  <button className="rounded-full bg-gradient-to-r from-[#2dd4e6] to-[#1ab5c4] px-8 py-4 text-lg font-semibold text-[#020817] transition-all hover:scale-105 btn-glow shadow-[0_0_40px_rgba(45,212,230,0.4)]">
                    Start Free Trial — 5 Calls Free
                  </button>
                </SignUpButton>
              </div>

              {/* Trust Badge */}
              <div className="mt-8 flex items-center justify-center gap-2 text-sm text-[#9ca3af]">
                <svg className="h-5 w-5 text-[#22c55e]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                No credit card required • Cancel anytime
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-16 border-t border-white/5">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[rgba(15,23,42,0.9)] to-[rgba(15,23,42,0.7)] p-8 backdrop-blur-xl">
              <h3 className="text-5xl font-extrabold text-[#2dd4e6]">40+</h3>
              <p className="mt-2 text-lg text-[#9ca3af]">Realistic objection scenarios</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[rgba(15,23,42,0.9)] to-[rgba(15,23,42,0.7)] p-8 backdrop-blur-xl">
              <h3 className="text-5xl font-extrabold text-[#2dd4e6]">0.3s</h3>
              <p className="mt-2 text-lg text-[#9ca3af]">Average AI response time</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[rgba(15,23,42,0.9)] to-[rgba(15,23,42,0.7)] p-8 backdrop-blur-xl">
              <h3 className="text-5xl font-extrabold text-[#2dd4e6]">94%</h3>
              <p className="mt-2 text-lg text-[#9ca3af]">Feedback accuracy score</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works - Simplified */}
      <section className="relative py-24 lg:py-32 border-t border-white/5">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-white sm:text-5xl">
              How it <span className="text-[#2dd4e6]">works</span>
            </h2>
            <p className="mt-4 text-lg text-[#9ca3af]">
              Three simple steps to master objection handling
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[rgba(15,23,42,0.9)] to-[rgba(15,23,42,0.7)] p-8 backdrop-blur-xl">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2dd4e6] to-[#1ab5c4] text-2xl font-extrabold text-[#020817] mb-6">
                1
              </div>
              <h3 className="text-2xl font-extrabold text-white mb-4">Connect</h3>
              <p className="text-[#9ca3af] leading-relaxed">
                Choose your persona and script. Select from our library or create your own custom scenario.
              </p>
            </div>

            {/* Step 2 */}
            <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[rgba(15,23,42,0.9)] to-[rgba(15,23,42,0.7)] p-8 backdrop-blur-xl">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#a855f7] to-[#9333ea] text-2xl font-extrabold text-white mb-6">
                2
              </div>
              <h3 className="text-2xl font-extrabold text-white mb-4">Drill</h3>
              <p className="text-[#9ca3af] leading-relaxed">
                Call the AI and handle objections in real-time. Practice until you perfect your responses.
              </p>
            </div>

            {/* Step 3 */}
            <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[rgba(15,23,42,0.9)] to-[rgba(15,23,42,0.7)] p-8 backdrop-blur-xl">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#22c55e] to-[#16a34a] text-2xl font-extrabold text-[#020817] mb-6">
                3
              </div>
              <h3 className="text-2xl font-extrabold text-white mb-4">Grow</h3>
              <p className="text-[#9ca3af] leading-relaxed">
                Get scoring, feedback, and next steps. Track your improvement over time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-24 lg:py-32 border-t border-white/5">
        <div className="mx-auto max-w-4xl px-6 text-center lg:px-8">
          <h2 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Ready to level up your sales game?
          </h2>
          <p className="mt-6 text-xl text-[#9ca3af]">
            Start practicing with AI today. 5 free calls, no credit card required.
          </p>
          <div className="mt-10">
            <SignUpButton mode="modal">
              <button className="rounded-full bg-gradient-to-r from-[#2dd4e6] to-[#1ab5c4] px-8 py-4 text-lg font-semibold text-[#020817] transition-all hover:scale-105 btn-glow shadow-[0_0_40px_rgba(45,212,230,0.4)]">
                Get Started Free
              </button>
            </SignUpButton>
          </div>
        </div>
      </section>
    </main>
  );
}
