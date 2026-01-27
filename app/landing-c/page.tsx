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

type Testimonial = {
  name: string;
  role: string;
  company: string;
  description: string;
  quote: string;
  initials: string;
};

type FeatureStat = {
  label: string;
  value: string;
};

type Feature = {
  title: string;
  description: string;
  stats: FeatureStat[];
};

type MetricCard = {
  icon: string;
  value: string;
  label: string;
  color: string;
};

export default function LandingC() {
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
      // Esc key closes mobile menu
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

  const testimonials: Testimonial[] = [
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

  const features: Feature[] = [
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
              <a href="#testimonials" className="text-sm font-medium text-[var(--color-text-muted)] transition-colors hover:text-white">
                Testimonials
              </a>
              <a href="#security" className="text-sm font-medium text-[var(--color-text-muted)] transition-colors hover:text-white">
                Security
              </a>
              <a href="#faq" className="text-sm font-medium text-[var(--color-text-muted)] transition-colors hover:text-white">
                FAQ
              </a>
              <a href="#contact" className="text-sm font-medium text-[var(--color-text-muted)] transition-colors hover:text-white">
                Contact
              </a>
              {isSignedIn ? (
                <Link href="/dashboard" >
                  <Button variant="primary" size="sm">
                    Go to Dashboard
                  </Button>
                </Link>
              ) : (
                <SignUpButton mode="modal">
                  <Button variant="primary" size="sm">
                    Get Started
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
                href="#testimonials"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2 text-sm font-medium text-[var(--color-text-muted)] transition-colors hover:text-white hover:bg-white/5 rounded-lg"
              >
                Testimonials
              </a>
              <a
                href="#security"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2 text-sm font-medium text-[var(--color-text-muted)] transition-colors hover:text-white hover:bg-white/5 rounded-lg"
              >
                Security
              </a>
              <a
                href="#faq"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2 text-sm font-medium text-[var(--color-text-muted)] transition-colors hover:text-white hover:bg-white/5 rounded-lg"
              >
                FAQ
              </a>
              <a
                href="#contact"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2 text-sm font-medium text-[var(--color-text-muted)] transition-colors hover:text-white hover:bg-white/5 rounded-lg"
              >
                Contact
              </a>
              <div className="px-4 pt-2">
                {isSignedIn ? (
                  <Link href="/dashboard" >
                    <Button variant="primary" size="sm" fullWidth>
                      Go to Dashboard
                    </Button>
                  </Link>
                ) : (
                  <SignUpButton mode="modal">
                    <Button variant="primary" size="sm" fullWidth>
                      Get Started
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
      <TestimonialsSection testimonials={testimonials} />
      <SecurityPrivacySection />
      <FAQSection />
      <ContactSection />
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

// Hero Section with Parallax
function HeroSection({ isSignedIn }: { isSignedIn: boolean }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.3 });
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);

  return (
    <section ref={ref} className="relative overflow-hidden pt-24 pb-16 lg:pt-28 lg:pb-24">
      {/* Threads Background - Interactive animated threads matching DialDrill brand colors */}
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
            <span className="font-medium text-white">New</span>
            <span className="text-[var(--color-text-muted)]">•</span>
            <span className="text-[var(--color-text-secondary)]">AI Sales Call Simulator</span>
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
                text="Less awkward calls."
                delay={100}
                animateBy="words"
                className="text-white"
              />{' '}
              <BlurText
                text="Stronger closes."
                delay={150}
                animateBy="words"
                className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-cyan-bright)] to-[var(--color-cyan-bright-alt-2)]"
              />
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mt-4 text-lg leading-8 text-[var(--color-text-secondary)] max-w-2xl mx-auto lg:mx-0"
            >
              DialDrill lets founders and sales reps practice real objection handling by calling AI bots.
              Build confidence, refine your pitch, and turn tough conversations into closed deals.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="mt-8 flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start"
            >
              {isSignedIn ? (
                <Link href="/dashboard" >
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
                    Start My Trial Today!
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
              <Link
                href="/how-it-works"
                className="inline-flex items-center gap-2 text-base font-medium text-[var(--color-text-secondary)] transition-all hover:text-[var(--color-cyan-bright)] hover:gap-3"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                See how it works
              </Link>
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
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="rgba(0, 217, 255, 0.2)"
                  strokeWidth="12"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#00d9ff"
                  strokeWidth="12"
                  strokeDasharray="150 251"
                  strokeLinecap="round"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#fbbf24"
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
                  stroke="#10b981"
                  strokeWidth="12"
                  strokeDasharray="26 251"
                  strokeDashoffset="-225"
                  strokeLinecap="round"
                />
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

// Metrics Strip with Scroll Animation
function MetricsStrip() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.3 });

  const metrics: MetricCard[] = [
    { icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', value: '40+', label: 'Realistic objection profiles across industries', color: '#fbbf24' },
    { icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6', value: '2x faster', label: 'Onboarding speed for new sales reps', color: '#fbbf24' },
    { icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', value: 'Instant', label: 'Feedback and scoring after every call', color: '#fbbf24' },
    { icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', value: 'Unlimited', label: 'Call recordings with full transcripts', color: '#fbbf24' },
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
              <h3
                className="text-2xl font-bold transition-colors duration-300"
                style={{ color: metric.color }}
              >
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

// Features Section (abbreviated for space - would continue similarly)
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
            Practice. Analyze. Improve. Repeat.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid gap-10 lg:grid-cols-[280px_1fr] lg:gap-14"
        >
          {/* Feature tabs and content would continue here - same structure with animations */}
          <div className="flex flex-col gap-3">
            {features.map((feature: Feature, idx: number) => (
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
              {features[activeTab].stats.map((stat: FeatureStat, idx: number) => (
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

// Abbreviated sections - continuing the pattern...
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
            How it <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-cyan-bright)] to-[#00ffea]">works</span>
          </h2>
          <p className="mt-5 text-xl text-[var(--color-text-secondary)] max-w-3xl mx-auto">
            Three simple steps to transform your sales team
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
              <h3 className="text-2xl font-bold text-white mb-3">Sign Up & Choose Your Plan</h3>
              <p className="text-lg text-[var(--color-text-secondary)] leading-relaxed">
                Start with our <span className="text-[#fbbf24] font-semibold">$5 trial</span> for 5 practice calls, or go Pro for <span className="text-[#fbbf24] font-semibold">20 minutes per month</span> with all 8 personalities unlocked.
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
              <h3 className="text-2xl font-bold text-white mb-3">Practice Real Sales Scenarios</h3>
              <p className="text-lg text-[var(--color-text-secondary)] leading-relaxed">
                Choose from approachable business owners or challenging boss personalities. Each call presents realistic objections that test your handling skills in real-time.
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
              <h3 className="text-2xl font-bold text-white mb-3">Review & Improve</h3>
              <p className="text-lg text-[var(--color-text-secondary)] leading-relaxed">
                Get instant scores on your opening, discovery, objection handling, clarity, and closing. Review full transcripts, see which objections you faced, and track your progress over time.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection({ testimonials }: { testimonials: Testimonial[] }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.2 });

  return (
    <section ref={ref} id="testimonials" className="relative py-16">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="mb-10 text-center"
        >
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Trusted by <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-cyan-bright)] to-[#00ffea]">sales teams</span>
          </h2>
          <p className="mt-3 text-base text-[var(--color-text-secondary)]">
            See what our customers have to say
          </p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {testimonials.map((testimonial: Testimonial, idx: number) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 50, scale: 0.9 }}
              transition={{ duration: 0.6, delay: idx * 0.15 }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="overflow-hidden rounded-3xl border border-[var(--color-border-subtle)]/50 bg-gradient-to-br from-card-bg to-[rgba(5,9,17,0.8)] p-5 lg:p-6 shadow-[0_20px_40px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-all hover:shadow-[0_20px_60px_rgba(0,0,0,0.7)] hover:border-[var(--color-border-medium)]"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-cyan-bright)] to-[#00b8d4] text-lg font-bold text-white ring-4 ring-[var(--color-cyan-bright)]/30 flex-shrink-0 shadow-[0_0_20px_rgba(0,217,255,0.4)]">
                  {testimonial.initials}
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-white">{testimonial.name}</div>
                  <div className="text-sm text-[var(--color-text-secondary)]">
                    {testimonial.role} at {testimonial.company}
                  </div>
                  <div className="mt-1 text-xs text-[var(--color-text-muted)]">{testimonial.description}</div>
                </div>
              </div>
              <blockquote className="text-base font-medium leading-relaxed text-white">
                &ldquo;{testimonial.quote}&rdquo;
              </blockquote>
            </motion.div>
          ))}
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
      name: 'Starter Trial',
      price: '$5',
      cadence: 'one-time',
      highlight: 'Great for first-time users',
      features: ['5 AI practice calls', '3 base personalities', '90 second call limit', 'Up to 2 trial packs'],
      cta: 'Start trial',
      tone: 'from-[var(--color-cyan-bright)] to-[var(--color-cyan-bright-alt-2)]',
    },
    {
      name: 'Pro',
      price: '$11.99',
      cadence: '/month',
      highlight: 'Best for teams and reps',
      features: ['20 minutes per month', 'All 8 personalities', '5 minute call limit', '$1/min overage', 'Priority support'],
      cta: 'See full pricing',
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
            Simple <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-cyan-bright)] to-[#00ffea]">pricing</span>
          </h2>
          <p className="mt-4 text-base text-[var(--color-text-secondary)]">
            Start small, scale up as your reps get sharper.
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

        <div className="mt-8 text-center text-sm text-[var(--color-text-muted)]">
          Need enterprise pricing or a custom domain? <Link href="/plans" className="text-[var(--color-cyan-bright)] hover:text-white">Contact sales</Link>.
        </div>
      </div>
    </section>
  );
}

function SecurityPrivacySection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.2 });
  const items = [
    {
      title: 'Privacy controls',
      description: 'Set your profile visibility, hide your stats from others, and opt out of public leaderboards.',
    },
    {
      title: 'Data handling',
      description: 'Your practice calls, scores, and transcripts stay inside your account and are never shared publicly without your consent.',
    },
    {
      title: 'Secure access',
      description: 'Protected by Clerk authentication, server-side rate limiting, and monitored error reporting.',
    },
  ];

  return (
    <section ref={ref} id="security" className="section-fade-top relative border-t border-[var(--color-border-subtle)]/50 py-20 lg:py-28">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Security & <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-cyan-bright)] to-[#00ffea]">privacy</span>
          </h2>
          <p className="mt-4 text-base text-[var(--color-text-secondary)]">
            Built for teams that care about protecting data and reputation.
          </p>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-3">
          {items.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="rounded-3xl border border-[var(--color-border-subtle)]/50 bg-gradient-to-br from-card-bg to-[rgba(5,9,17,0.8)] p-6 shadow-[0_20px_40px_rgba(0,0,0,0.5)] backdrop-blur-xl"
            >
              <h3 className="text-xl font-semibold text-white">{item.title}</h3>
              <p className="mt-3 text-sm text-[var(--color-text-secondary)]">{item.description}</p>
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
      question: 'How quickly can my team start?',
      answer: 'Create an account, pick a plan, and start practicing in minutes. No setup required.',
    },
    {
      question: 'What do reps get after each call?',
      answer: 'Instant scoring across key areas, a transcript, and targeted feedback on objections.',
    },
    {
      question: 'Can I cancel anytime?',
      answer: 'Yes. You can manage or cancel your plan from the billing page at any time.',
    },
    {
      question: 'Do you support teams and managers?',
      answer: 'Yes. Managers can review performance trends and focus coaching sessions where it matters most.',
    },
    {
      question: 'Do you offer custom pricing?',
      answer: 'We do for teams that need multiple seats or custom usage. Reach out to sales for details.',
    },
    {
      question: 'How do privacy controls work?',
      answer: 'You can set your profile visibility, hide stats publicly, and opt out of the leaderboard.',
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
            Everything you need to know before your first call.
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

function ContactSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.2 });
  const contacts = [
    {
      title: 'Sales',
      description: 'Questions about pricing, seats, or custom domains?',
      email: 'sales@dialdrill.ai',
    },
    {
      title: 'Support',
      description: 'Need help or found a bug? We respond fast.',
      email: 'support@dialdrill.ai',
    },
    {
      title: 'Security',
      description: 'Request security docs or report a vulnerability.',
      email: 'security@dialdrill.ai',
    },
  ];

  return (
    <section ref={ref} id="contact" className="section-fade-top relative border-t border-[var(--color-border-subtle)]/50 py-20 lg:py-28">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Contact <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-cyan-bright)] to-[#00ffea]">DialDrill</span>
          </h2>
          <p className="mt-4 text-base text-[var(--color-text-secondary)]">
            We’re here to help with onboarding, billing, and security.
          </p>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-3">
          {contacts.map((contact, index) => (
            <motion.div
              key={contact.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="rounded-3xl border border-[var(--color-border-subtle)]/50 bg-gradient-to-br from-card-bg to-[rgba(5,9,17,0.8)] p-6 shadow-[0_20px_40px_rgba(0,0,0,0.5)] backdrop-blur-xl"
            >
              <h3 className="text-lg font-semibold text-white">{contact.title}</h3>
              <p className="mt-3 text-sm text-[var(--color-text-secondary)]">{contact.description}</p>
              <a
                href={`mailto:${contact.email}`}
                className="mt-4 inline-flex items-center text-sm font-semibold text-[var(--color-cyan-bright)] transition-colors hover:text-white"
              >
                {contact.email}
              </a>
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
          Make your next real call{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-cyan-bright)] to-[#00ffea]">feel easy.</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-4 text-base text-[var(--color-text-secondary)]"
        >
          Join hundreds of sales teams practicing smarter, closing faster, and growing fearlessly.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8 flex flex-col sm:flex-row items-center gap-4 justify-center"
        >
          {isSignedIn ? (
            <Link href="/dashboard" >
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
                  Start My Trial Today!
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
              <SignInButton mode="modal">
                <button className="inline-flex items-center text-lg font-medium text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-cyan-bright)]">
                  Already have an account? Sign in
                </button>
              </SignInButton>
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
