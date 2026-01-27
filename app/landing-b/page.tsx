'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth, SignUpButton, SignInButton } from '@clerk/nextjs';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import { BlurText } from '@/components/ui/react-bits';
import Threads from '@/components/Threads';
import Button from '@/components/ui/Button';

// Memoized color to prevent Threads WebGL context recreation on re-renders
const THREADS_COLOR: [number, number, number] = [0, 217, 255];

type Feature = {
  title: string;
  description: string;
  stats: { label: string; value: string }[];
};

type MetricCard = {
  icon: string;
  value: string;
  label: string;
  color: string;
};

export default function LandingB() {
  const [activeTab, setActiveTab] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const { isSignedIn } = useAuth();

  // Track scroll position for back to top button
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const features: Feature[] = [
    {
      title: 'Practice without embarrassment',
      description: "No one's watching. No judgment. Just you getting better at your own pace.",
      stats: [
        { label: 'Private Sessions', value: '100%' },
        { label: 'Your Data', value: 'Protected' },
      ],
    },
    {
      title: 'Learn by doing',
      description: "Videos and books don't build reflexes. Real practice does. Get it here with AI that pushes back.",
      stats: [
        { label: 'AI Scenarios', value: '40+' },
        { label: 'Real Objections', value: 'Yes' },
      ],
    },
    {
      title: 'Build real confidence',
      description: "Not fake-it-til-you-make-it confidence. The kind that comes from knowing you've done this before.",
      stats: [
        { label: 'Instant Feedback', value: 'Every Call' },
        { label: 'Progress Tracking', value: 'Built-in' },
      ],
    },
  ];

  return (
    <main className="min-h-screen bg-[var(--color-dark-bg)] grid-background">
      {/* Header with Logo */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--color-border-subtle)]/50 bg-[var(--color-dark-bg)]/90 backdrop-blur-xl"
      >
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-12">
          <div className="flex h-20 items-center justify-between">
            <div className="text-2xl font-extrabold text-white">
              Dial<span className="text-[var(--color-cyan-bright)]">Drill</span>
            </div>
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-[var(--color-text-muted)] transition-colors hover:text-white">
                Features
              </a>
              <a href="#how-it-works" className="text-sm font-medium text-[var(--color-text-muted)] transition-colors hover:text-white">
                How it Works
              </a>
              <a href="#pricing" className="text-sm font-medium text-[var(--color-text-muted)] transition-colors hover:text-white">
                Pricing
              </a>
              <a href="#proof" className="text-sm font-medium text-[var(--color-text-muted)] transition-colors hover:text-white">
                Why It Works
              </a>
              <a href="#faq" className="text-sm font-medium text-[var(--color-text-muted)] transition-colors hover:text-white">
                FAQ
              </a>
              {isSignedIn ? (
                <Link href="/dashboard">
                  <Button variant="primary" size="sm">
                    Go to Dashboard
                  </Button>
                </Link>
              ) : (
                <SignUpButton mode="modal">
                  <Button variant="primary" size="sm">
                    Try 5 Calls for $5
                  </Button>
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
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-[var(--color-border-subtle)]/50 py-4 space-y-4"
            >
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2 text-sm font-medium text-[var(--color-text-muted)] transition-colors hover:text-white hover:bg-white/5 rounded-lg"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2 text-sm font-medium text-[var(--color-text-muted)] transition-colors hover:text-white hover:bg-white/5 rounded-lg"
              >
                How it Works
              </a>
              <a
                href="#pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2 text-sm font-medium text-[var(--color-text-muted)] transition-colors hover:text-white hover:bg-white/5 rounded-lg"
              >
                Pricing
              </a>
              <a
                href="#proof"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2 text-sm font-medium text-[var(--color-text-muted)] transition-colors hover:text-white hover:bg-white/5 rounded-lg"
              >
                Why It Works
              </a>
              <a
                href="#faq"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2 text-sm font-medium text-[var(--color-text-muted)] transition-colors hover:text-white hover:bg-white/5 rounded-lg"
              >
                FAQ
              </a>
              <div className="px-4 pt-2">
                {isSignedIn ? (
                  <Link href="/dashboard">
                    <Button variant="primary" size="sm" fullWidth>
                      Go to Dashboard
                    </Button>
                  </Link>
                ) : (
                  <SignUpButton mode="modal">
                    <Button variant="primary" size="sm" fullWidth>
                      Try 5 Calls for $5
                    </Button>
                  </SignUpButton>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </motion.header>

      <HeroSection isSignedIn={!!isSignedIn} />
      <TrustedByStrip />
      <MetricsStrip />
      <FeaturesSection features={features} activeTab={activeTab} setActiveTab={setActiveTab} />
      <HowItWorksSection />
      <PricingSection isSignedIn={!!isSignedIn} />
      <ProofSection />
      <ObjectionsSection />
      <FAQSection />
      <FinalCTA isSignedIn={!!isSignedIn} />
      <Footer />

      {/* Back to Top Button */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: showBackToTop ? 1 : 0, scale: showBackToTop ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="fixed bottom-8 right-8 z-50"
      >
        <Button
          onClick={scrollToTop}
          variant="primary"
          size="md"
          className="h-14 w-14 p-0"
          aria-label="Back to top"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </Button>
      </motion.div>
    </main>
  );
}

// Hero Section - Variant B Copy
function HeroSection({ isSignedIn }: { isSignedIn: boolean }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.3 });
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);

  return (
    <section ref={ref} className="relative overflow-hidden pt-24 pb-16 lg:pt-28 lg:pb-24">
      {/* Threads Background */}
      <Threads
        color={THREADS_COLOR}
        amplitude={1.2}
        distance={0.3}
        enableMouseInteraction={true}
        className="fixed inset-0 opacity-30"
        style={{ zIndex: 0 }}
      />
      {/* Readability protection overlay */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: 1,
          background: 'radial-gradient(ellipse 120% 60% at 50% 35%, rgba(8, 13, 26, 0.6) 0%, rgba(8, 13, 26, 0.3) 40%, transparent 70%)',
        }}
      />
      <motion.div style={{ y }} className="radial-glow" />
      <div className="relative z-10 mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-12">
        {/* Pill Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex justify-center mb-6"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-cyan-bright)]/30 bg-[var(--color-cyan-bright)]/10 px-4 py-1.5 text-sm text-[var(--color-text-secondary)] backdrop-blur-sm">
            <span className="flex h-2 w-2">
              <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-[var(--color-cyan-bright)] opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--color-cyan-bright)]"></span>
            </span>
            <span className="font-medium text-white">Private Practice</span>
            <span className="text-[var(--color-text-muted)]">•</span>
            <span className="text-[var(--color-text-secondary)]">AI Sales Calls</span>
          </div>
        </motion.div>

        {/* Hero Content */}
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          {/* Left: Text */}
          <div className="text-center lg:text-left">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl"
            >
              <BlurText
                text="Practice without"
                delay={100}
                animateBy="words"
                className="text-white"
              />{' '}
              <BlurText
                text="first call jitters."
                delay={150}
                animateBy="words"
                className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-cyan-bright)] to-[var(--color-cyan-bright-alt-2)]"
              />
            </motion.h1>
            {/* Caption */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="mt-2 text-lg font-medium text-[var(--color-text-muted)] italic"
            >
              Stop blowing potential $$
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mt-4 text-lg leading-8 text-[var(--color-text-secondary)] max-w-2xl mx-auto lg:mx-0"
            >
              DialDrill gives you a private space to practice sales calls with AI — so you sound confident when it actually counts.
            </motion.p>
            {/* Supporting Bullets */}
            <motion.ul
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.8, delay: 0.45 }}
              className="mt-6 space-y-2 text-left max-w-md mx-auto lg:mx-0"
            >
              <li className="flex items-center gap-3 text-[var(--color-text-secondary)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-cyan-bright)]"></span>
                Rehearse with AI prospects that respond like real buyers
              </li>
              <li className="flex items-center gap-3 text-[var(--color-text-secondary)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-cyan-bright)]"></span>
                Get clear feedback on what&apos;s working and what&apos;s not
              </li>
              <li className="flex items-center gap-3 text-[var(--color-text-secondary)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-cyan-bright)]"></span>
                Build real skill on your own terms, at your own pace
              </li>
            </motion.ul>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="mt-8 flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start"
            >
              {isSignedIn ? (
                <Link href="/dashboard">
                  <Button variant="primary" size="md" className="btn-glow group">
                    Go to Dashboard
                    <svg
                      className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Button>
                </Link>
              ) : (
                <SignUpButton mode="modal">
                  <Button variant="primary" size="md" className="btn-glow group">
                    Try 5 Calls for $5
                    <svg
                      className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Button>
                </SignUpButton>
              )}
              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2 text-base font-medium text-[var(--color-text-secondary)] transition-all hover:text-[var(--color-cyan-bright)] hover:gap-3"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                See How It Works
              </a>
            </motion.div>
          </div>

          {/* Right: Dashboard Card */}
          <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={isInView ? { opacity: 1, x: 0, scale: 1 } : { opacity: 0, x: 50, scale: 0.9 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative"
          >
            <DashboardCard />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function DashboardCard() {
  return (
    <div className="overflow-hidden rounded-3xl border border-[var(--color-border-subtle)]/50 bg-gradient-to-br from-card-bg to-[rgba(5,9,17,0.8)] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.7)] backdrop-blur-xl transition-all hover:shadow-[0_20px_80px_rgba(0,0,0,0.8)] hover:-translate-y-1">
      {/* Status Pills */}
      <div className="mb-6 flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-green)]/10 px-3 py-1.5 text-xs font-medium text-[var(--color-green)] ring-1 ring-[var(--color-green)]/20">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-green)]"></span>
          AI Caller Active
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#c026d3]/10 px-3 py-1.5 text-xs font-medium text-[#e879f9] ring-1 ring-[#c026d3]/20">
          <span className="h-1.5 w-1.5 rounded-full bg-[#e879f9]"></span>
          Script Coach On
        </span>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {/* Left: Bar Chart */}
        <div>
          <h3 className="mb-4 text-sm font-semibold text-[#e5e7eb]">Call Outcomes</h3>
          <div className="flex h-40 items-end gap-3">
            {[
              { height: 75, color: 'from-[var(--color-cyan-bright)] to-[var(--color-cyan-bright)]/70', label: 'Won' },
              { height: 50, color: 'from-[var(--color-text-secondary)] to-[var(--color-text-secondary)]/70', label: 'Lost' },
              { height: 90, color: 'from-[#10b981] to-[#10b981]/70', label: 'Follow-up' },
              { height: 60, color: 'from-[#e879f9] to-[#e879f9]/70', label: 'Demo' },
            ].map((bar, i) => (
              <motion.div
                key={i}
                initial={{ height: 0, opacity: 0 }}
                whileInView={{ height: `${bar.height}%`, opacity: 1 }}
                transition={{ duration: 0.8, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="group relative flex flex-1 flex-col items-center gap-2"
              >
                <div className={`w-full rounded-t-lg bg-gradient-to-t ${bar.color} transition-all group-hover:from-[var(--color-cyan-bright)] group-hover:to-[var(--color-cyan-bright)]`} style={{ height: '100%' }}></div>
                <span className="text-xs text-[var(--color-text-muted)]">{bar.label}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right: Donut Chart */}
        <div>
          <h3 className="mb-4 text-sm font-semibold text-[#e5e7eb]">Objection Types</h3>
          <div className="flex h-40 items-center justify-center">
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="relative h-32 w-32"
            >
              <svg className="h-32 w-32 -rotate-90 transform" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(0, 217, 255, 0.2)" strokeWidth="12" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="#00d9ff" strokeWidth="12" strokeDasharray="150 251" strokeLinecap="round" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="#fbbf24" strokeWidth="12" strokeDasharray="75 251" strokeDashoffset="-150" strokeLinecap="round" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="#10b981" strokeWidth="12" strokeDasharray="26 251" strokeDashoffset="-225" strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">87</div>
                  <div className="text-xs text-[var(--color-text-muted)]">Total</div>
                </div>
              </div>
            </motion.div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[var(--color-cyan-bright)]"></span>
              <span className="text-[var(--color-text-muted)]">Price</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#fbbf24]"></span>
              <span className="text-[var(--color-text-muted)]">Timing</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#10b981]"></span>
              <span className="text-[var(--color-text-muted)]">Authority</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TrustedByStrip() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.4 });
  const logos = ['CloudScale', 'TechFlow', 'GrowthLabs', 'Northwind', 'SignalForge', 'BluePeak'];

  return (
    <section ref={ref} className="relative border-y border-[var(--color-border-subtle)]/50 bg-[var(--color-dark-bg)]/60 py-10">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <p className="text-sm uppercase tracking-[0.3em] text-[var(--color-text-muted)]">Trusted by high-performing teams</p>
        </motion.div>
        <div className="mt-6 grid grid-cols-2 gap-4 text-center sm:grid-cols-3 lg:grid-cols-6">
          {logos.map((logo, index) => (
            <motion.div
              key={logo}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className="rounded-xl border border-[var(--color-border-subtle)]/50 bg-[var(--color-card-bg)]/20 px-4 py-3 text-sm font-semibold text-[var(--color-text-secondary)]"
            >
              {logo}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function MetricsStrip() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.3 });

  const metrics: MetricCard[] = [
    { icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', value: '40+', label: 'Realistic scenarios to practice', color: '#fbbf24' },
    { icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z', value: '100%', label: 'Private — no one watching', color: '#fbbf24' },
    { icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', value: '2-3 min', label: 'Per call — fits in any schedule', color: '#fbbf24' },
    { icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', value: 'Instant', label: 'Feedback after every session', color: '#fbbf24' },
  ];

  return (
    <section ref={ref} className="section-fade-top section-fade-bottom relative border-y border-[var(--color-border-subtle)]/50 bg-[var(--color-dark-bg)]/50 py-10">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="group rounded-2xl border border-[var(--color-border-subtle)]/50 bg-gradient-to-br from-[var(--color-card-bg)]/30 to-transparent p-6 transition-all duration-300 hover:border-[#fbbf24]/40 hover:bg-[var(--color-card-bg)]/50 hover:shadow-[0_0_35px_rgba(251,191,36,0.25)] cursor-pointer"
            >
              <div
                className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br transition-all duration-300 group-hover:scale-110 group-hover:rotate-3"
                style={{
                  backgroundImage: `linear-gradient(135deg, ${metric.color}20, ${metric.color}05)`,
                  boxShadow: `0 0 0 1px ${metric.color}20`
                }}
              >
                <svg className="h-6 w-6 transition-transform duration-300 group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: metric.color }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={metric.icon} />
                </svg>
              </div>
              <h3 className="text-2xl font-bold transition-colors duration-300" style={{ color: metric.color }}>
                {metric.value}
              </h3>
              <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{metric.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturesSection({
  features,
  activeTab,
  setActiveTab,
}: {
  features: Feature[];
  activeTab: number;
  setActiveTab: (index: number) => void;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.2 });

  return (
    <section ref={ref} id="features" className="relative py-16 lg:py-24">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="mb-10 text-center"
        >
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Everything you need to <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-cyan-bright)] to-[#00ffea]">level up</span>
          </h2>
          <p className="mt-3 text-base text-[var(--color-text-secondary)]">
            Train on your own time. Get better at your own pace.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid gap-10 lg:grid-cols-[280px_1fr] lg:gap-14"
        >
          <div className="flex flex-col gap-3">
            {features.map((feature, idx) => (
              <motion.button
                key={idx}
                initial={{ opacity: 0, x: -30 }}
                animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
                transition={{ duration: 0.5, delay: 0.3 + idx * 0.1 }}
                onClick={() => setActiveTab(idx)}
                className={`group relative rounded-xl border p-5 text-left transition-all ${
                  activeTab === idx
                    ? 'border-[var(--color-cyan-bright)]/50 bg-gradient-to-r from-[var(--color-cyan-bright)]/10 to-transparent shadow-lg shadow-[var(--color-cyan-bright)]/20'
                    : 'border-[var(--color-border-subtle)]/50 bg-[var(--color-card-bg)]/30 hover:border-[var(--color-border-medium)] hover:bg-[var(--color-card-bg)]/50'
                }`}
              >
                {activeTab === idx && (
                  <div className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-[var(--color-cyan-bright)] to-[var(--color-cyan-bright-alt-2)]"></div>
                )}
                <h3
                  className={`text-lg font-semibold transition-colors ${
                    activeTab === idx ? 'text-white' : 'text-[var(--color-text-secondary)] group-hover:text-white'
                  }`}
                >
                  {feature.title}
                </h3>
              </motion.button>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="overflow-hidden rounded-3xl border border-[var(--color-border-subtle)]/50 bg-gradient-to-br from-card-bg to-[rgba(5,9,17,0.8)] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.7)] backdrop-blur-xl lg:p-10"
          >
            <h3 className="text-2xl font-bold text-white">{features[activeTab].title}</h3>
            <p className="mt-3 text-base leading-relaxed text-[var(--color-text-secondary)]">
              {features[activeTab].description}
            </p>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              {features[activeTab].stats.map((stat, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ duration: 0.5, delay: 0.5 + idx * 0.1 }}
                  className="rounded-xl border border-[var(--color-border-subtle)]/50 bg-gradient-to-br from-[var(--color-card-bg)]/30 to-transparent p-6"
                >
                  <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#fbbf24] to-[#fcd34d]">{stat.value}</div>
                  <div className="mt-2 text-sm text-[var(--color-text-secondary)]">{stat.label}</div>
                </motion.div>
              ))}
            </div>

            {/* Mock Chart Area */}
            <div className="mt-6 rounded-2xl border border-[var(--color-border-subtle)]/50 bg-gradient-to-br from-[var(--color-card-bg)]/30 to-transparent p-6">
              <div className="flex h-28 items-end gap-2">
                {[40, 65, 45, 80, 55, 75, 60, 85, 70, 90].map((height, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ height: 0 }}
                    animate={isInView ? { height: `${height}%` } : { height: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 + idx * 0.05 }}
                    className="flex-1 rounded-t-lg bg-gradient-to-t from-[var(--color-cyan-bright)] to-[var(--color-cyan-bright)]/50 transition-all hover:from-[var(--color-cyan-bright-alt-2)] hover:to-[var(--color-cyan-bright-alt-2)]"
                  ></motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.2 });

  return (
    <section ref={ref} id="how-it-works" className="section-fade-top relative border-t border-white/5 py-24 lg:py-32">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="mb-16 lg:mb-20 text-center"
        >
          <h2 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Practice on <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-cyan-bright)] to-[#00ffea]">your terms</span>
          </h2>
          <p className="mt-5 text-xl text-[var(--color-text-secondary)] max-w-3xl mx-auto">
            Three steps to building the skill that pays.
          </p>
        </motion.div>

        {/* Timeline Steps */}
        <div className="relative max-w-4xl mx-auto">
          {/* Step 1 */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative mb-12 flex items-start gap-6"
          >
            <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-cyan-bright)] to-[#00b8d4] text-2xl font-bold text-white ring-4 ring-[var(--color-cyan-bright)]/30 shadow-[0_0_40px_rgba(0,217,255,0.5)]">
              1
            </div>
            <div className="flex-1 pt-2">
              <h3 className="text-2xl font-bold text-white mb-3">Choose your challenge</h3>
              <p className="text-lg text-[var(--color-text-secondary)] leading-relaxed">
                Pick a scenario that matches your real calls — cold outreach, following up, handling pushback, or asking for the sale.
              </p>
            </div>
          </motion.div>

          {/* Step 2 */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="relative mb-12 flex items-start gap-6"
          >
            <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#fbbf24] to-[var(--color-warning)] text-2xl font-bold text-white ring-4 ring-[#fbbf24]/30 shadow-[0_0_40px_rgba(251,191,36,0.5)]">
              2
            </div>
            <div className="flex-1 pt-2">
              <h3 className="text-2xl font-bold text-white mb-3">Have the conversation</h3>
              <p className="text-lg text-[var(--color-text-secondary)] leading-relaxed">
                Call an AI prospect that talks back. It won&apos;t go easy on you. Expect objections, hesitation, and real resistance.
              </p>
            </div>
          </motion.div>

          {/* Step 3 */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="relative flex items-start gap-6"
          >
            <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#e879f9] to-[#c026d3] text-2xl font-bold text-white ring-4 ring-[#e879f9]/30 shadow-[0_0_40px_rgba(232,121,249,0.5)]">
              3
            </div>
            <div className="flex-1 pt-2">
              <h3 className="text-2xl font-bold text-white mb-3">See what to fix</h3>
              <p className="text-lg text-[var(--color-text-secondary)] leading-relaxed">
                After each call, get specific feedback. Not generic tips — actual notes on your pacing, tone, and responses.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function PricingSection({ isSignedIn }: { isSignedIn: boolean }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.2 });
  const plans = [
    {
      name: 'Trial',
      price: '$5',
      cadence: 'one-time',
      highlight: 'Minimal risk, real practice',
      features: ['5 calls with AI buyers', 'Coaching feedback after every call', 'All scenarios unlocked', 'Can purchase twice'],
      cta: 'Try 5 Calls for $5',
      tone: 'from-[var(--color-cyan-bright)] to-[var(--color-cyan-bright-alt-2)]',
    },
    {
      name: 'Monthly',
      price: '$11.99',
      cadence: '/month',
      highlight: 'For serious skill-building',
      features: ['20 minutes of calling per month', 'Full coaching and progress tracking', 'Skill badges, streaks, and level progression', 'Custom AI personalities (coming soon)'],
      cta: 'Get Started',
      tone: 'from-[#fbbf24] to-[#f97316]',
    },
  ];

  return (
    <section ref={ref} id="pricing" className="section-fade-top relative border-t border-[var(--color-border-subtle)]/50 py-20 lg:py-28">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Minimal risk, <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-cyan-bright)] to-[#00ffea]">real practice</span>
          </h2>
          <p className="mt-4 text-base text-[var(--color-text-secondary)]">
            Cancel whenever. No commitments.
          </p>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-2">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="relative overflow-hidden rounded-3xl border border-[var(--color-border-subtle)]/50 bg-gradient-to-br from-card-bg to-[rgba(5,9,17,0.8)] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.7)] backdrop-blur-xl"
            >
              <div className={`absolute right-0 top-0 h-40 w-40 -translate-y-1/2 translate-x-1/2 rounded-full bg-gradient-to-br ${plan.tone} opacity-20 blur-3xl`}></div>
              <div className="relative">
                <p className="text-sm uppercase tracking-[0.2em] text-[var(--color-text-muted)]">{plan.highlight}</p>
                <h3 className="mt-2 text-2xl font-bold text-white">{plan.name}</h3>
                <div className="mt-4 flex items-end gap-2">
                  <span className="text-4xl font-extrabold text-white">{plan.price}</span>
                  <span className="text-sm text-[var(--color-text-muted)]">{plan.cadence}</span>
                </div>
                <ul className="mt-6 space-y-3 text-sm text-[var(--color-text-secondary)]">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-cyan-bright)]"></span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  {isSignedIn ? (
                    <Link href="/plans">
                      <Button variant="primary" size="md" className="w-full">
                        {plan.cta}
                      </Button>
                    </Link>
                  ) : (
                    <SignUpButton mode="modal">
                      <Button variant="primary" size="md" className="w-full">
                        {plan.cta}
                      </Button>
                    </SignUpButton>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProofSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.2 });

  const quotes = [
    {
      quote: "Sales is the one part of running my business I genuinely dread.",
      context: "On the hardest part of the job",
    },
    {
      quote: "I've lost deals because I couldn't get the words out right. It's embarrassing.",
      context: "On missed opportunities",
    },
    {
      quote: "I need practice but I don't have anyone to practice with.",
      context: "Looking for a way to train",
    },
  ];

  return (
    <section ref={ref} id="proof" className="relative py-16">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="mb-10 text-center"
        >
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            This struggle is <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-cyan-bright)] to-[#00ffea]">common</span>
          </h2>
          <p className="mt-3 text-base text-[var(--color-text-secondary)]">
            A lot of people talk about call anxiety. You&apos;re not the only one.
          </p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {quotes.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 50, scale: 0.9 }}
              transition={{ duration: 0.6, delay: idx * 0.15 }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="overflow-hidden rounded-3xl border border-[var(--color-border-subtle)]/50 bg-gradient-to-br from-card-bg to-[rgba(5,9,17,0.8)] p-5 lg:p-6 shadow-[0_20px_40px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-all hover:shadow-[0_20px_60px_rgba(0,0,0,0.7)] hover:border-[var(--color-border-medium)]"
            >
              <div className="mb-4">
                <svg className="h-8 w-8 text-[var(--color-cyan-bright)]/40" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
              </div>
              <blockquote className="text-base font-medium leading-relaxed text-white mb-4">
                &ldquo;{item.quote}&rdquo;
              </blockquote>
              <div className="text-sm text-[var(--color-text-muted)]">
                — {item.context}
              </div>
            </motion.div>
          ))}
        </div>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-10 text-center text-lg text-[var(--color-text-secondary)]"
        >
          DialDrill gives you that practice space.
        </motion.p>
      </div>
    </section>
  );
}

function ObjectionsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.2 });

  const objections = [
    {
      question: "Can AI really simulate a real sales call?",
      answer: "Better than you'd expect. The AI pushes back, asks tough questions, and doesn't let you off easy. The pressure feels real.",
    },
    {
      question: "I don't have a sales background. Will this work for me?",
      answer: "Yes — that's exactly who this is for. You'll learn faster by doing than by reading about it.",
    },
    {
      question: "I barely have time to make real calls.",
      answer: "One practice call takes 2-3 minutes. You can fit three sessions into a lunch break.",
    },
    {
      question: "What if I'm already decent at sales?",
      answer: "Decent isn't the same as sharp. DialDrill helps you refine your delivery and test new angles without consequences.",
    },
    {
      question: "Why pay $5 when I could just practice in my head?",
      answer: "Thinking through a call isn't the same as actually doing it. Saying words out loud — and hearing something unexpected back — is where the real learning happens.",
    },
  ];

  return (
    <section ref={ref} className="section-fade-top relative border-t border-[var(--color-border-subtle)]/50 py-20 lg:py-28">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Fair questions, <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-cyan-bright)] to-[#00ffea]">honest answers</span>
          </h2>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-2 max-w-5xl mx-auto">
          {objections.map((item, index) => (
            <motion.div
              key={item.question}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.6, delay: index * 0.08 }}
              className="rounded-3xl border border-[var(--color-border-subtle)]/50 bg-gradient-to-br from-card-bg to-[rgba(5,9,17,0.8)] p-6 shadow-[0_20px_40px_rgba(0,0,0,0.5)] backdrop-blur-xl"
            >
              <h3 className="text-lg font-semibold text-white">{item.question}</h3>
              <p className="mt-3 text-sm text-[var(--color-text-secondary)]">{item.answer}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.2 });
  const faqs = [
    {
      question: 'How realistic are the AI conversations?',
      answer: "Realistic enough to make you sweat. The AI responds dynamically based on what you say, not from a script.",
    },
    {
      question: 'Do I need any special equipment?',
      answer: 'Just a device with a browser and a microphone. Phone, tablet, or laptop all work.',
    },
    {
      question: 'What kind of feedback do I get?',
      answer: 'Specific notes on your pacing, tone, objection handling, and overall delivery. Not vague encouragement — actionable takeaways.',
    },
    {
      question: 'Is my data kept private?',
      answer: 'Yes. Your calls are only used to generate your personal feedback. Nothing is shared.',
    },
    {
      question: 'Can I practice specific situations?',
      answer: "Yes. Pick scenarios that match your real-world challenges. We're adding new ones regularly.",
    },
    {
      question: 'Can I cancel anytime?',
      answer: 'Yes. You can manage or cancel your plan from the billing page at any time.',
    },
  ];

  return (
    <section ref={ref} id="faq" className="section-fade-top relative border-t border-[var(--color-border-subtle)]/50 py-20 lg:py-28">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Frequently asked <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-cyan-bright)] to-[#00ffea]">questions</span>
          </h2>
          <p className="mt-4 text-base text-[var(--color-text-secondary)]">
            Only questions that reduce friction.
          </p>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-2">
          {faqs.map((faq, index) => (
            <motion.div
              key={faq.question}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.6, delay: index * 0.05 }}
              className="rounded-3xl border border-[var(--color-border-subtle)]/50 bg-gradient-to-br from-card-bg to-[rgba(5,9,17,0.8)] p-6 shadow-[0_20px_40px_rgba(0,0,0,0.5)] backdrop-blur-xl"
            >
              <h3 className="text-lg font-semibold text-white">{faq.question}</h3>
              <p className="mt-3 text-sm text-[var(--color-text-secondary)]">{faq.answer}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCTA({ isSignedIn }: { isSignedIn: boolean }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.5 });

  return (
    <section ref={ref} className="section-fade-top relative border-t border-[var(--color-border-subtle)]/50 py-16 lg:py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 text-center lg:px-12">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl"
        >
          You already know you need{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-cyan-bright)] to-[#00ffea]">the practice.</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-4 text-base text-[var(--color-text-secondary)]"
        >
          Stop putting it off. Start building the skill that pays.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8 flex flex-col sm:flex-row items-center gap-4 justify-center"
        >
          {isSignedIn ? (
            <Link href="/dashboard">
              <Button variant="primary" size="lg" className="btn-glow group">
                Go to Dashboard
                <svg
                  className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Button>
            </Link>
          ) : (
            <>
              <SignUpButton mode="modal">
                <Button variant="primary" size="lg" className="btn-glow group">
                  Try 5 Calls for $5
                  <svg
                    className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Button>
              </SignUpButton>
              <a
                href="#how-it-works"
                className="inline-flex items-center text-lg font-medium text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-cyan-bright)]"
              >
                See How It Works
              </a>
            </>
          )}
        </motion.div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-[var(--color-border-subtle)]/50 py-8">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-12">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="text-2xl font-extrabold text-white">
            Dial<span className="text-[var(--color-cyan-bright)]">Drill</span>
          </div>
          <div className="text-sm text-[var(--color-text-muted)]">
            © 2025 DialDrill. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
