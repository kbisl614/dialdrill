'use client';

import { useState } from 'react';
import { useAuth, SignUpButton, SignInButton } from '@clerk/nextjs';
import Link from 'next/link';

export default function Home() {
  const [activeTab, setActiveTab] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isSignedIn } = useAuth();

  // Interactive demo state
  const [selectedPersona, setSelectedPersona] = useState<'cto' | 'smb'>('cto');
  const [selectedResponse, setSelectedResponse] = useState<'acknowledge' | 'reframe' | 'close' | null>(null);

  // Persona data
  const personas = {
    cto: {
      name: 'Enterprise CTO',
      subtitle: 'Tech decision maker',
      objection: "I'm not sure we have the budget for this right now...",
      responses: {
        acknowledge: "I completely understand budget concerns. Can we explore what's currently in your tech stack that this could replace?",
        reframe: "Think of it as an investment that pays for itself. Our clients typically see 40% time savings in the first month alone.",
        close: "What if we started with a pilot program for just your core team? That way you can prove ROI before a full rollout."
      }
    },
    smb: {
      name: 'SMB Owner',
      subtitle: 'Budget-conscious',
      objection: "This seems too expensive for a small business like mine...",
      responses: {
        acknowledge: "I hear you - every dollar matters when you're running a small business. Let me show you our SMB pricing tier.",
        reframe: "Actually, small businesses often see the biggest impact because you're more agile. You can implement this faster than enterprises.",
        close: "What if I could get you started at half the price for the first 3 months? Would that work with your budget?"
      }
    }
  };

  // Scoring based on response choice
  const scoring = {
    acknowledge: { overall: 7.8, confidence: 85, objectionHandling: 78 },
    reframe: { overall: 8.7, confidence: 92, objectionHandling: 85 },
    close: { overall: 9.2, confidence: 95, objectionHandling: 92 }
  };

  const currentPersona = personas[selectedPersona];
  const currentScoring = selectedResponse ? scoring[selectedResponse] : scoring.reframe;

  const testimonials = [
    {
      name: 'Jessica Sanders',
      role: 'VP of Sales',
      company: 'CloudScale',
      description: 'B2B SaaS • Series B',
      quote: 'DialDrill cut our new rep ramp time in half. They practice every objection before hitting the phones, and it shows in their close rates.',
      initials: 'JS',
    },
    {
      name: 'Marcus Chen',
      role: 'Founder & CEO',
      company: 'GrowthLabs',
      description: 'Marketing Agency • Bootstrapped',
      quote: 'Our team went from nervous cold callers to confident closers in weeks. The AI objection handling is incredibly realistic.',
      initials: 'MC',
    },
    {
      name: 'Sarah Thompson',
      role: 'Sales Director',
      company: 'TechFlow',
      description: 'Enterprise SaaS • Series C',
      quote: 'The instant feedback feature is a game-changer. Reps can see exactly where they stumble and fix it before the next real call.',
      initials: 'ST',
    },
  ];

  const features = [
    {
      title: 'Real-time feedback',
      description: 'Get instant AI-powered coaching as you speak. See sentiment analysis, tone suggestions, and objection handling tips during your call.',
      stats: [
        { label: 'Avg. Response Time', value: '0.3s' },
        { label: 'Accuracy Score', value: '94%' },
      ],
    },
    {
      title: 'Objection libraries',
      description: 'Access 40+ realistic objection profiles across industries. From pricing pushback to competitor comparisons, practice every scenario.',
      stats: [
        { label: 'Total Scenarios', value: '40+' },
        { label: 'Industries', value: '12' },
      ],
    },
    {
      title: 'Call recordings & transcripts',
      description: 'Review every call with full transcripts, highlighted key moments, and AI-generated improvement suggestions.',
      stats: [
        { label: 'Storage', value: 'Unlimited' },
        { label: 'Search', value: 'Full-text' },
      ],
    },
  ];

  return (
    <main className="min-h-screen bg-[#020817] grid-background">
      {/* Header with Logo */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#020817]/80 backdrop-blur-xl">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-12">
          <div className="flex h-20 items-center justify-between">
            <div className="text-2xl font-extrabold text-white">
              Dial<span className="text-[#2dd4e6]">Drill</span>
            </div>
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-[#9ca3af] transition-colors hover:text-white">
                Features
              </a>
              <a href="#how-it-works" className="text-sm font-medium text-[#9ca3af] transition-colors hover:text-white">
                How it Works
              </a>
              <a href="#testimonials" className="text-sm font-medium text-[#9ca3af] transition-colors hover:text-white">
                Testimonials
              </a>
              {isSignedIn ? (
                <Link
                  href="/dashboard"
                  className="rounded-full bg-gradient-to-r from-[#2dd4e6] to-[#1ab5c4] px-6 py-2.5 text-sm font-semibold text-[#020817] transition-all hover:scale-105"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <SignUpButton mode="modal">
                  <button className="rounded-full bg-gradient-to-r from-[#2dd4e6] to-[#1ab5c4] px-6 py-2.5 text-sm font-semibold text-[#020817] transition-all hover:scale-105">
                    Get Started
                  </button>
                </SignUpButton>
              )}
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex items-center justify-center h-10 w-10 rounded-lg border border-white/10 bg-white/5 text-white transition-colors hover:bg-white/10"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-white/5 py-4 space-y-4">
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2 text-sm font-medium text-[#9ca3af] transition-colors hover:text-white hover:bg-white/5 rounded-lg"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2 text-sm font-medium text-[#9ca3af] transition-colors hover:text-white hover:bg-white/5 rounded-lg"
              >
                How it Works
              </a>
              <a
                href="#testimonials"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2 text-sm font-medium text-[#9ca3af] transition-colors hover:text-white hover:bg-white/5 rounded-lg"
              >
                Testimonials
              </a>
              <div className="px-4 pt-2">
                {isSignedIn ? (
                  <Link
                    href="/dashboard"
                    className="block w-full text-center rounded-full bg-gradient-to-r from-[#2dd4e6] to-[#1ab5c4] px-6 py-2.5 text-sm font-semibold text-[#020817] transition-all hover:scale-105"
                  >
                    Go to Dashboard
                  </Link>
                ) : (
                  <SignUpButton mode="modal">
                    <button className="w-full rounded-full bg-gradient-to-r from-[#2dd4e6] to-[#1ab5c4] px-6 py-2.5 text-sm font-semibold text-[#020817] transition-all hover:scale-105">
                      Get Started
                    </button>
                  </SignUpButton>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-16 lg:pt-28 lg:pb-24">
        <div className="radial-glow">
          <div className="relative z-10 mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-12">
            {/* Pill Badge */}
            <div className="flex justify-center mb-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-[#e5e7eb] backdrop-blur-sm">
                <span className="flex h-2 w-2">
                  <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-[#22c55e] opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#22c55e]"></span>
                </span>
                <span className="font-medium">New</span>
                <span className="text-[#9ca3af]">•</span>
                <span className="text-[#9ca3af]">AI Sales Call Simulator</span>
              </div>
            </div>

            {/* Hero Content */}
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
              {/* Left: Text */}
              <div className="text-center lg:text-left">
                <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
                  Less awkward calls.{' '}
                  <span className="text-[#2dd4e6]">Stronger closes.</span>
                </h1>
                <p className="mt-4 text-lg leading-8 text-[#9ca3af] max-w-2xl mx-auto lg:mx-0">
                  DialDrill lets founders and sales reps practice real objection handling by calling AI bots.
                  Build confidence, refine your pitch, and turn tough conversations into closed deals.
                </p>
                <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                  {isSignedIn ? (
                    <Link
                      href="/dashboard"
                      className="btn-glow group relative inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#2dd4e6] to-[#1ab5c4] px-8 py-4 text-base font-semibold text-[#020817] transition-all hover:scale-105 hover:-translate-y-0.5"
                    >
                      Go to Dashboard
                      <svg
                        className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </Link>
                  ) : (
                    <SignUpButton mode="modal">
                      <button className="btn-glow group relative inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#2dd4e6] to-[#1ab5c4] px-8 py-4 text-base font-semibold text-[#020817] transition-all hover:scale-105 hover:-translate-y-0.5">
                        Start My Trial Today!
                        <svg
                          className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </button>
                    </SignUpButton>
                  )}
                  <Link
                    href="/how-it-works"
                    className="inline-flex items-center gap-2 text-base font-medium text-[#2dd4e6] transition-all hover:text-[#1ab5c4] hover:gap-3"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    See how it works
                  </Link>
                </div>
              </div>

              {/* Right: Dashboard Card */}
              <div className="relative">
                <div className="overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-br from-[rgba(15,23,42,0.9)] to-[rgba(15,23,42,0.7)] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.5),0_0_40px_rgba(45,212,230,0.1)] backdrop-blur-xl transition-all hover:shadow-[0_20px_80px_rgba(0,0,0,0.6),0_0_60px_rgba(45,212,230,0.15)] hover:-translate-y-1">
                  {/* Status Pills */}
                  <div className="mb-6 flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#22c55e]/10 px-3 py-1.5 text-xs font-medium text-[#22c55e] ring-1 ring-[#22c55e]/20">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#22c55e]"></span>
                      AI Caller Active
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#2dd4e6]/10 px-3 py-1.5 text-xs font-medium text-[#2dd4e6] ring-1 ring-[#2dd4e6]/20">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#2dd4e6]"></span>
                      Script Coach On
                    </span>
                  </div>

                  <div className="grid gap-6 sm:grid-cols-2">
                    {/* Left: Bar Chart */}
                    <div>
                      <h3 className="mb-4 text-sm font-semibold text-[#e5e7eb]">Call Outcomes</h3>
                      <div className="flex h-40 items-end gap-3">
                        <div className="group relative flex flex-1 flex-col items-center gap-2">
                          <div className="w-full rounded-t-lg bg-gradient-to-t from-[#2dd4e6] to-[#2dd4e6]/70 transition-all group-hover:from-[#2dd4e6] group-hover:to-[#2dd4e6]" style={{ height: '75%' }}></div>
                          <span className="text-xs text-[#9ca3af]">Won</span>
                        </div>
                        <div className="group relative flex flex-1 flex-col items-center gap-2">
                          <div className="w-full rounded-t-lg bg-gradient-to-t from-[#a855f7] to-[#a855f7]/70 transition-all group-hover:from-[#a855f7] group-hover:to-[#a855f7]" style={{ height: '50%' }}></div>
                          <span className="text-xs text-[#9ca3af]">Lost</span>
                        </div>
                        <div className="group relative flex flex-1 flex-col items-center gap-2">
                          <div className="w-full rounded-t-lg bg-gradient-to-t from-[#22c55e] to-[#22c55e]/70 transition-all group-hover:from-[#22c55e] group-hover:to-[#22c55e]" style={{ height: '90%' }}></div>
                          <span className="text-xs text-[#9ca3af]">Follow-up</span>
                        </div>
                        <div className="group relative flex flex-1 flex-col items-center gap-2">
                          <div className="w-full rounded-t-lg bg-gradient-to-t from-[#2dd4e6] to-[#2dd4e6]/70 transition-all group-hover:from-[#2dd4e6] group-hover:to-[#2dd4e6]" style={{ height: '60%' }}></div>
                          <span className="text-xs text-[#9ca3af]">Demo</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Donut Chart */}
                    <div>
                      <h3 className="mb-4 text-sm font-semibold text-[#e5e7eb]">Objection Types</h3>
                      <div className="flex h-40 items-center justify-center">
                        <div className="relative h-32 w-32">
                          <svg className="h-32 w-32 -rotate-90 transform" viewBox="0 0 100 100">
                            <circle
                              cx="50"
                              cy="50"
                              r="40"
                              fill="none"
                              stroke="rgba(45, 212, 230, 0.2)"
                              strokeWidth="12"
                            />
                            <circle
                              cx="50"
                              cy="50"
                              r="40"
                              fill="none"
                              stroke="#2dd4e6"
                              strokeWidth="12"
                              strokeDasharray="150 251"
                              strokeLinecap="round"
                            />
                            <circle
                              cx="50"
                              cy="50"
                              r="40"
                              fill="none"
                              stroke="#a855f7"
                              strokeWidth="12"
                              strokeDasharray="75 251"
                              strokeDashoffset="-150"
                              strokeLinecap="round"
                            />
                            <circle
                              cx="50"
                              cy="50"
                              r="40"
                              fill="none"
                              stroke="#22c55e"
                              strokeWidth="12"
                              strokeDasharray="26 251"
                              strokeDashoffset="-225"
                              strokeLinecap="round"
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-white">87</div>
                              <div className="text-xs text-[#9ca3af]">Total</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-[#2dd4e6]"></span>
                          <span className="text-[#9ca3af]">Price</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-[#a855f7]"></span>
                          <span className="text-[#9ca3af]">Timing</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-[#22c55e]"></span>
                          <span className="text-[#9ca3af]">Authority</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Strip */}
      <section className="section-fade-top section-fade-bottom relative border-y border-white/5 bg-white/[0.02] py-10">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-12">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="group rounded-2xl border border-white/5 bg-white/[0.02] p-6 transition-all duration-300 hover:border-[#2dd4e6]/30 hover:bg-white/[0.04] hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(45,212,230,0.15)] cursor-pointer">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#2dd4e6]/20 to-[#2dd4e6]/5 ring-1 ring-[#2dd4e6]/20 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                <svg className="h-6 w-6 text-[#2dd4e6] transition-transform duration-300 group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white transition-colors duration-300 group-hover:text-[#2dd4e6]">40+</h3>
              <p className="mt-1 text-sm text-[#9ca3af]">Realistic objection profiles across industries</p>
            </div>

            <div className="group rounded-2xl border border-white/5 bg-white/[0.02] p-6 transition-all hover:border-[#22c55e]/30 hover:bg-white/[0.04] hover:-translate-y-1">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#22c55e]/20 to-[#22c55e]/5 ring-1 ring-[#22c55e]/20">
                <svg className="h-6 w-6 text-[#22c55e]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white">2x faster</h3>
              <p className="mt-1 text-sm text-[#9ca3af]">Onboarding speed for new sales reps</p>
            </div>

            <div className="group rounded-2xl border border-white/5 bg-white/[0.02] p-6 transition-all hover:border-[#a855f7]/30 hover:bg-white/[0.04] hover:-translate-y-1">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#a855f7]/20 to-[#a855f7]/5 ring-1 ring-[#a855f7]/20">
                <svg className="h-6 w-6 text-[#a855f7]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white">Instant</h3>
              <p className="mt-1 text-sm text-[#9ca3af]">Feedback and scoring after every call</p>
            </div>

            <div className="group rounded-2xl border border-white/5 bg-white/[0.02] p-6 transition-all hover:border-[#2dd4e6]/30 hover:bg-white/[0.04] hover:-translate-y-1">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#2dd4e6]/20 to-[#2dd4e6]/5 ring-1 ring-[#2dd4e6]/20">
                <svg className="h-6 w-6 text-[#2dd4e6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white">Unlimited</h3>
              <p className="mt-1 text-sm text-[#9ca3af]">Call recordings with full transcripts</p>
            </div>
          </div>
        </div>
      </section>

      {/* Tabbed Features Section */}
      <section id="features" className="relative py-16 lg:py-24">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-12">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Everything you need to <span className="text-[#2dd4e6]">level up</span>
            </h2>
            <p className="mt-3 text-base text-[#9ca3af]">
              Practice. Analyze. Improve. Repeat.
            </p>
          </div>

          <div className="grid gap-10 lg:grid-cols-[280px_1fr] lg:gap-14">
            {/* Left: Tabs */}
            <div className="flex flex-col gap-3">
              {features.map((feature, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveTab(idx)}
                  className={`group relative rounded-xl border p-5 text-left transition-all ${
                    activeTab === idx
                      ? 'border-[#2dd4e6]/50 bg-gradient-to-r from-[#2dd4e6]/10 to-transparent shadow-lg'
                      : 'border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]'
                  }`}
                >
                  {activeTab === idx && (
                    <div className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-[#2dd4e6] to-[#1ab5c4]"></div>
                  )}
                  <h3
                    className={`text-lg font-semibold transition-colors ${
                      activeTab === idx ? 'text-white' : 'text-[#9ca3af] group-hover:text-white'
                    }`}
                  >
                    {feature.title}
                  </h3>
                </button>
              ))}
            </div>

            {/* Right: Content Panel */}
            <div className="overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-br from-[rgba(15,23,42,0.9)] to-[rgba(15,23,42,0.7)] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.45)] backdrop-blur-xl lg:p-10">
              <h3 className="text-2xl font-bold text-white">{features[activeTab].title}</h3>
              <p className="mt-3 text-base leading-relaxed text-[#9ca3af]">
                {features[activeTab].description}
              </p>
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                {features[activeTab].stats.map((stat, idx) => (
                  <div key={idx} className="rounded-xl border border-white/5 bg-white/[0.03] p-6">
                    <div className="text-3xl font-bold text-[#2dd4e6]">{stat.value}</div>
                    <div className="mt-2 text-sm text-[#9ca3af]">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Mock Chart Area */}
              <div className="mt-6 rounded-2xl border border-white/5 bg-gradient-to-br from-white/[0.05] to-transparent p-6">
                <div className="flex h-28 items-end gap-2">
                  {[40, 65, 45, 80, 55, 75, 60, 85, 70, 90].map((height, idx) => (
                    <div
                      key={idx}
                      className="flex-1 rounded-t-lg bg-gradient-to-t from-[#2dd4e6] to-[#2dd4e6]/50 transition-all hover:from-[#2dd4e6] hover:to-[#2dd4e6]"
                      style={{ height: `${height}%` }}
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Step Timeline - Uplinq Style */}
      <section id="how-it-works" className="section-fade-top relative border-t border-white/5 py-24 lg:py-32">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-12">
          {/* Section Header */}
          <div className="mb-16 lg:mb-20 text-center">
            <h2 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              How it <span className="text-[#2dd4e6]">works</span>
            </h2>
            <p className="mt-5 text-xl text-[#9ca3af] max-w-3xl mx-auto">
              Three simple steps to transform your sales team
            </p>
          </div>

          {/* Timeline Container */}
          <div className="relative mx-auto max-w-6xl">
            {/* Vertical gradient line */}
            <div className="absolute left-12 top-0 bottom-0 w-1 bg-gradient-to-b from-[#2dd4e6] via-[#a855f7] to-[#22c55e] opacity-40 lg:left-1/2 lg:-ml-0.5"></div>

            <div className="space-y-16 lg:space-y-24">
              {/* Step 1: CONNECT */}
              <div className="relative grid gap-12 lg:grid-cols-2 lg:gap-20 items-center group">
                {/* Left: Content */}
                <div className="lg:text-right lg:pr-20">
                  <div className="inline-flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-[#2dd4e6] to-[#1ab5c4] text-4xl font-extrabold text-[#020817] shadow-[0_0_40px_rgba(45,212,230,0.4)] ring-4 ring-[#2dd4e6]/20 lg:float-right transition-all group-hover:scale-110 group-hover:shadow-[0_0_60px_rgba(45,212,230,0.6)]">
                    1
                  </div>
                  <div className="clear-both mt-6 lg:mt-0">
                    <h3 className="text-3xl font-extrabold text-white mb-3">Connect</h3>
                    <p className="text-lg leading-relaxed text-[#9ca3af]">
                      Choose your persona and script. Select from our library or create your own custom scenario.
                    </p>
                  </div>
                </div>

                {/* Right: UI Cards */}
                <div className="space-y-6">
                  {/* Persona Selection Card */}
                  <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[rgba(15,23,42,0.95)] to-[rgba(15,23,42,0.8)] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.5),0_0_40px_rgba(45,212,230,0.1)] backdrop-blur-xl transition-all hover:shadow-[0_20px_80px_rgba(0,0,0,0.6),0_0_60px_rgba(45,212,230,0.2)] hover:-translate-y-1">
                    <div className="space-y-4">
                      <button
                        onClick={() => setSelectedPersona('cto')}
                        className={`w-full flex items-center gap-4 rounded-2xl border p-5 transition-all ${
                          selectedPersona === 'cto'
                            ? 'border-[#2dd4e6]/30 bg-gradient-to-r from-[#2dd4e6]/10 to-transparent'
                            : 'border-white/10 bg-white/[0.02] opacity-50 hover:opacity-70'
                        }`}
                      >
                        <div className={`flex h-14 w-14 items-center justify-center rounded-xl ${
                          selectedPersona === 'cto'
                            ? 'bg-gradient-to-br from-[#2dd4e6]/30 to-[#2dd4e6]/10 ring-2 ring-[#2dd4e6]/30'
                            : 'bg-white/5'
                        }`}>
                          <svg className={`h-7 w-7 ${selectedPersona === 'cto' ? 'text-[#2dd4e6]' : 'text-[#9ca3af]'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div className="text-left">
                          <div className={`text-lg font-bold ${selectedPersona === 'cto' ? 'text-white' : 'text-[#9ca3af]'}`}>Enterprise CTO</div>
                          <div className="text-sm text-[#9ca3af]">Tech decision maker</div>
                        </div>
                      </button>
                      <button
                        onClick={() => setSelectedPersona('smb')}
                        className={`w-full flex items-center gap-4 rounded-2xl border p-5 transition-all ${
                          selectedPersona === 'smb'
                            ? 'border-[#2dd4e6]/30 bg-gradient-to-r from-[#2dd4e6]/10 to-transparent'
                            : 'border-white/10 bg-white/[0.02] opacity-50 hover:opacity-70'
                        }`}
                      >
                        <div className={`flex h-14 w-14 items-center justify-center rounded-xl ${
                          selectedPersona === 'smb'
                            ? 'bg-gradient-to-br from-[#2dd4e6]/30 to-[#2dd4e6]/10 ring-2 ring-[#2dd4e6]/30'
                            : 'bg-white/5'
                        }`}>
                          <svg className={`h-7 w-7 ${selectedPersona === 'smb' ? 'text-[#2dd4e6]' : 'text-[#9ca3af]'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div className="text-left">
                          <div className={`text-lg font-bold ${selectedPersona === 'smb' ? 'text-white' : 'text-[#9ca3af]'}`}>SMB Owner</div>
                          <div className="text-sm text-[#9ca3af]">Budget-conscious</div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Objection Preview */}
                  <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[rgba(15,23,42,0.95)] to-[rgba(15,23,42,0.8)] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.5)] backdrop-blur-xl">
                    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
                      <p className="text-lg italic text-white leading-relaxed">
                        &ldquo;{currentPersona.objection}&rdquo;
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2: DRILL */}
              <div className="relative grid gap-12 lg:grid-cols-2 lg:gap-20 items-center group">
                {/* Right: Content (order-2 on desktop) */}
                <div className="lg:order-2 lg:pl-20">
                  <div className="inline-flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-[#a855f7] to-[#9333ea] text-4xl font-extrabold text-white shadow-[0_0_40px_rgba(168,85,247,0.4)] ring-4 ring-[#a855f7]/20 transition-all group-hover:scale-110 group-hover:shadow-[0_0_60px_rgba(168,85,247,0.6)]">
                    2
                  </div>
                  <div className="mt-6 lg:mt-0">
                    <h3 className="text-3xl font-extrabold text-white mb-3">Drill</h3>
                    <p className="text-lg leading-relaxed text-[#9ca3af]">
                      Call the AI and handle objections in real-time. Practice until you perfect your responses.
                    </p>
                  </div>
                </div>

                {/* Left: UI Card (order-1 on desktop) */}
                <div className="lg:order-1 rounded-3xl border border-white/10 bg-gradient-to-br from-[rgba(15,23,42,0.95)] to-[rgba(15,23,42,0.8)] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.5),0_0_40px_rgba(168,85,247,0.1)] backdrop-blur-xl transition-all hover:shadow-[0_20px_80px_rgba(0,0,0,0.6),0_0_60px_rgba(168,85,247,0.2)] hover:-translate-y-1">
                  <div className="space-y-6">
                    {/* Live Call Indicator */}
                    <div className="flex items-center gap-4 rounded-2xl border border-[#22c55e]/30 bg-gradient-to-r from-[#22c55e]/10 to-transparent p-5">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#22c55e]/20 ring-4 ring-[#22c55e]/30">
                        <div className="h-5 w-5 animate-pulse rounded-full bg-[#22c55e] shadow-[0_0_20px_rgba(34,197,94,0.6)]"></div>
                      </div>
                      <div className="flex-1">
                        <div className="h-3 w-4/5 rounded-full bg-gradient-to-r from-[#22c55e] via-[#22c55e]/50 to-transparent"></div>
                        <div className="mt-2 h-2 w-2/3 rounded-full bg-gradient-to-r from-[#22c55e]/60 to-transparent"></div>
                      </div>
                      <span className="text-lg font-mono font-bold text-[#22c55e]">00:34</span>
                    </div>

                    {/* Objection Display */}
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                      <p className="text-xs font-semibold text-[#9ca3af] mb-2">PROSPECT</p>
                      <p className="text-lg italic text-white leading-relaxed">
                        &ldquo;{currentPersona.objection}&rdquo;
                      </p>
                    </div>

                    {/* Response Options */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => setSelectedResponse('acknowledge')}
                        className={`flex-1 rounded-xl border p-4 text-center text-base font-semibold transition-all ${
                          selectedResponse === 'acknowledge'
                            ? 'border-[#2dd4e6]/30 bg-gradient-to-r from-[#2dd4e6]/10 to-transparent text-[#2dd4e6]'
                            : 'border-white/10 bg-white/[0.02] text-[#9ca3af] hover:border-white/20 hover:bg-white/[0.05]'
                        }`}
                      >
                        Acknowledge
                      </button>
                      <button
                        onClick={() => setSelectedResponse('reframe')}
                        className={`flex-1 rounded-xl border p-4 text-center text-base font-semibold transition-all ${
                          selectedResponse === 'reframe'
                            ? 'border-[#2dd4e6]/30 bg-gradient-to-r from-[#2dd4e6]/10 to-transparent text-[#2dd4e6]'
                            : 'border-white/10 bg-white/[0.02] text-[#9ca3af] hover:border-white/20 hover:bg-white/[0.05]'
                        }`}
                      >
                        Reframe
                      </button>
                      <button
                        onClick={() => setSelectedResponse('close')}
                        className={`flex-1 rounded-xl border p-4 text-center text-base font-semibold transition-all ${
                          selectedResponse === 'close'
                            ? 'border-[#2dd4e6]/30 bg-gradient-to-r from-[#2dd4e6]/10 to-transparent text-[#2dd4e6]'
                            : 'border-white/10 bg-white/[0.02] text-[#9ca3af] hover:border-white/20 hover:bg-white/[0.05]'
                        }`}
                      >
                        Close
                      </button>
                    </div>

                    {/* Your Response (shows after selection) */}
                    {selectedResponse && (
                      <div className="rounded-2xl border border-[#2dd4e6]/20 bg-[#2dd4e6]/5 p-6">
                        <p className="text-xs font-semibold text-[#2dd4e6] mb-2">YOU</p>
                        <p className="text-base text-white leading-relaxed">
                          &ldquo;{currentPersona.responses[selectedResponse]}&rdquo;
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Step 3: GROW */}
              <div className="relative grid gap-12 lg:grid-cols-2 lg:gap-20 items-center group">
                {/* Left: Content */}
                <div className="lg:text-right lg:pr-20">
                  <div className="inline-flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-[#22c55e] to-[#16a34a] text-4xl font-extrabold text-[#020817] shadow-[0_0_40px_rgba(34,197,94,0.4)] ring-4 ring-[#22c55e]/20 lg:float-right transition-all group-hover:scale-110 group-hover:shadow-[0_0_60px_rgba(34,197,94,0.6)]">
                    3
                  </div>
                  <div className="clear-both mt-6 lg:mt-0">
                    <h3 className="text-3xl font-extrabold text-white mb-3">Grow</h3>
                    <p className="text-lg leading-relaxed text-[#9ca3af]">
                      Get scoring, feedback, and next steps. Track your improvement over time.
                    </p>
                  </div>
                </div>

                {/* Right: Scoring Card */}
                <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[rgba(15,23,42,0.95)] to-[rgba(15,23,42,0.8)] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.5),0_0_40px_rgba(34,197,94,0.1)] backdrop-blur-xl transition-all hover:shadow-[0_20px_80px_rgba(0,0,0,0.6),0_0_60px_rgba(34,197,94,0.2)] hover:-translate-y-1">
                  <div className="space-y-8">
                    {/* Overall Score Header */}
                    <div className="flex items-center justify-between pb-6 border-b border-white/10">
                      <span className="text-xl font-bold text-white">Overall Score</span>
                      <span className="text-5xl font-extrabold text-[#22c55e] tabular-nums transition-all">
                        {currentScoring.overall}
                      </span>
                    </div>

                    {/* Metrics */}
                    <div className="space-y-6">
                      {/* Confidence */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-lg font-semibold text-[#9ca3af]">Confidence</span>
                          <span className="text-lg font-bold text-white tabular-nums transition-all">
                            {currentScoring.confidence}%
                          </span>
                        </div>
                        <div className="h-4 overflow-hidden rounded-full bg-white/5 ring-1 ring-white/10">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-[#2dd4e6] to-[#22c55e] shadow-[0_0_20px_rgba(45,212,230,0.4)] transition-all duration-500"
                            style={{ width: `${currentScoring.confidence}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Objection Handling */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-lg font-semibold text-[#9ca3af]">Objection Handling</span>
                          <span className="text-lg font-bold text-white tabular-nums transition-all">
                            {currentScoring.objectionHandling}%
                          </span>
                        </div>
                        <div className="h-4 overflow-hidden rounded-full bg-white/5 ring-1 ring-white/10">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-[#a855f7] to-[#22c55e] shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all duration-500"
                            style={{ width: `${currentScoring.objectionHandling}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    {/* Feedback hint */}
                    {selectedResponse && (
                      <div className="pt-6 border-t border-white/10">
                        <p className="text-sm text-[#9ca3af] italic">
                          {selectedResponse === 'acknowledge' && '💡 Good empathy! Try reframing or closing for higher scores.'}
                          {selectedResponse === 'reframe' && '💪 Strong value positioning! Experiment with closing techniques next.'}
                          {selectedResponse === 'close' && '🎯 Excellent! Direct close with fallback options maximizes conversion.'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="relative py-16">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-12">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Trusted by <span className="text-[#2dd4e6]">sales teams</span>
            </h2>
            <p className="mt-3 text-base text-[#9ca3af]">
              See what our customers have to say
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {testimonials.map((testimonial, idx) => (
              <div
                key={idx}
                className="overflow-hidden rounded-3xl border border-[#2dd4e6]/20 bg-gradient-to-br from-[rgba(15,23,42,0.9)] to-[rgba(15,23,42,0.7)] p-5 lg:p-6 shadow-[0_0_35px_rgba(45,212,230,0.15)] backdrop-blur-xl transition-all hover:shadow-[0_0_55px_rgba(45,212,230,0.25)] hover:-translate-y-1"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#2dd4e6] to-[#1ab5c4] text-lg font-bold text-[#020817] ring-4 ring-[#2dd4e6]/20 flex-shrink-0">
                    {testimonial.initials}
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-white">{testimonial.name}</div>
                    <div className="text-sm text-[#9ca3af]">
                      {testimonial.role} at {testimonial.company}
                    </div>
                    <div className="mt-1 text-xs text-[#2dd4e6]">{testimonial.description}</div>
                  </div>
                </div>
                <blockquote className="text-base font-medium leading-relaxed text-white">
                  &ldquo;{testimonial.quote}&rdquo;
                </blockquote>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="section-fade-top relative border-t border-white/5 py-16 lg:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 text-center lg:px-12">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Make your next real call{' '}
            <span className="text-[#2dd4e6]">feel easy.</span>
          </h2>
          <p className="mt-4 text-base text-[#9ca3af]">
            Join hundreds of sales teams practicing smarter, closing faster, and growing fearlessly.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 justify-center">
            {isSignedIn ? (
              <Link
                href="/dashboard"
                className="btn-glow group inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#2dd4e6] to-[#1ab5c4] px-10 py-5 text-lg font-semibold text-[#020817] transition-all hover:scale-105 hover:-translate-y-0.5"
              >
                Go to Dashboard
                <svg
                  className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            ) : (
              <>
                <SignUpButton mode="modal">
                  <button className="btn-glow group inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#2dd4e6] to-[#1ab5c4] px-10 py-5 text-lg font-semibold text-[#020817] transition-all hover:scale-105 hover:-translate-y-0.5">
                    Start My Trial Today!
                    <svg
                      className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>
                </SignUpButton>
                <SignInButton mode="modal">
                  <button className="inline-flex items-center text-lg font-medium text-[#2dd4e6] transition-colors hover:text-[#1ab5c4]">
                    Already have an account? Sign in
                  </button>
                </SignInButton>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-12">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="text-2xl font-extrabold text-white">
              Dial<span className="text-[#2dd4e6]">Drill</span>
            </div>
            <div className="text-sm text-[#9ca3af]">
              © 2025 DialDrill. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
