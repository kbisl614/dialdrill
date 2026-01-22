'use client';

import { useAuth, useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import PersonalitySelector, { type Personality } from '@/components/PersonalitySelector';
import QuickPracticeModal from '@/components/QuickPracticeModal';
import ObjectionLibraryModal from '@/components/ObjectionLibraryModal';
import ProfileDropdownModal from '@/components/ProfileDropdownModal';
import OnboardingModal from '@/components/OnboardingModal';
import Sidebar from '@/components/Sidebar';
import Breadcrumb from '@/components/Breadcrumb';
import SkeletonLoader from '@/components/SkeletonLoader';
import Link from 'next/link';
import { SidebarProvider, useSidebar } from '@/components/SidebarContext';
import { BlurText } from '@/components/ui/react-bits';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { clientLogger } from '@/lib/client-logger';

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';

interface Entitlements {
  plan: 'trial' | 'paid';
  canCall: boolean;
  trialCallsRemaining?: number;
  tokensRemaining?: number;
  isOverage: boolean;
  trialPurchasesCount: number;
  canBuyAnotherTrial: boolean;
  unlockedPersonalities?: Personality[];
  lockedPersonalities?: Personality[];
}

interface UserProfileData {
  username: string;
  avatar: string;
  email: string;
  memberSince: string;
  currentPower: number;
  currentBelt: {
    tier: string;
    belt: string;
    color: string;
    minPower: number;
    maxPower: number;
  };
  nextBelt: {
    tier: string;
    belt: string;
    color: string;
    minPower: number;
    maxPower: number;
  };
  streak: {
    currentStreak: number;
    longestStreak: number;
    lastLogin: string;
  };
  multiplier: {
    active: boolean;
    percentage: number;
    daysToNext: number | null;
    nextMultiplier: number | null;
  };
  badges: Array<{
    id: string;
    name: string;
    description: string;
    category: string;
    rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
    earned: boolean;
    earnedDate?: string;
    progress?: number;
    total?: number;
  }>;
  statistics: {
    totalCalls: number;
    totalMinutes: number;
    averageScore: number;
    objectionSuccessRate: number;
    closingRate: number;
    averageWPM: number;
    fillerWordAverage: number;
  };
}

function DashboardContent() {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const { isCollapsed } = useSidebar();
  const [entitlements, setEntitlements] = useState<Entitlements | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startingCall, setStartingCall] = useState(false);
  const [selectionMode, setSelectionMode] = useState<'select' | 'random'>('random');
  const [selectedPersonalityId, setSelectedPersonalityId] = useState<string | null>(null);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [showQuickPractice, setShowQuickPractice] = useState(false);
  const [showObjectionLibrary, setShowObjectionLibrary] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [profileData, setProfileData] = useState<UserProfileData | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const [showOnboarding, setShowOnboarding] = useState(false);

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
          // Handle 401 (unauthorized) gracefully - user needs to sign in
          if (response.status === 401) {
            setError('Please sign in to view your dashboard.');
            return;
          }
          // Handle other errors
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Failed to fetch entitlements (${response.status})`);
        }
        const data = await response.json();
        setEntitlements(data);
        setError(null); // Clear any previous errors on success
      } catch (err) {
        clientLogger.warn('[Dashboard] Error fetching entitlements', { error: err });
        // Set user-friendly error message
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        if (errorMessage.includes('Unauthorized') || errorMessage.includes('401')) {
          setError('Please sign in to view your dashboard.');
        } else {
          setError('We couldn\'t load your dashboard. Please refresh the page or try again in a moment.');
        }
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      fetchEntitlements();
    }
  }, [user]);

  useEffect(() => {
    if (entitlements?.plan === 'paid' && showUpgradePrompt) {
      setShowUpgradePrompt(false);
    }
  }, [entitlements?.plan, showUpgradePrompt]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Esc key closes any open modals
      if (e.key === 'Escape') {
        if (showUpgradePrompt) {
          setShowUpgradePrompt(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showUpgradePrompt]);

  useEffect(() => {
    if (!entitlements?.unlockedPersonalities || !entitlements.unlockedPersonalities.length) {
      if (selectedPersonalityId !== null) {
        setSelectedPersonalityId(null);
      }
      return;
    }

    if (selectionMode === 'random') {
      if (selectedPersonalityId !== null) {
        setSelectedPersonalityId(null);
      }
      return;
    }

    const availableIds = entitlements.unlockedPersonalities.map((p) => p.id);
    if (!selectedPersonalityId || !availableIds.includes(selectedPersonalityId)) {
      setSelectedPersonalityId(availableIds[0]);
    }
  }, [selectionMode, entitlements, selectedPersonalityId]);

  // Fetch profile data when modal opens
  useEffect(() => {
    if (showProfileDropdown && !profileData) {
      fetchProfileData();
    }
  }, [showProfileDropdown, profileData]);

  // Fetch unread notifications count on mount and periodically
  useEffect(() => {
    fetchUnreadNotificationsCount();
    const interval = setInterval(fetchUnreadNotificationsCount, 30000); // Every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Check if user has seen onboarding
  useEffect(() => {
    const onboardingComplete = localStorage.getItem('onboardingComplete');
    if (onboardingComplete !== 'true' && isLoaded && isSignedIn && entitlements) {
      // Show onboarding for new users
      setShowOnboarding(true);
    }
  }, [isLoaded, isSignedIn, entitlements]);

  async function fetchProfileData() {
    setProfileLoading(true);
    try {
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const data = await response.json();
        setProfileData(data);
      } else {
        const errorData = await response.json();
        clientLogger.error('Failed to fetch profile', undefined, { status: response.status, errorData });
      }
    } catch (error) {
      clientLogger.error('Error fetching profile', error);
    } finally {
      setProfileLoading(false);
    }
  }

  async function fetchUnreadNotificationsCount() {
    try {
      const response = await fetch('/api/notifications?unreadOnly=true');
      if (response.ok) {
        const data = await response.json();
        setUnreadNotificationsCount(data.unreadCount || 0);
      } else {
        // Silently handle errors - don't break UI if notifications fail
        clientLogger.warn('[Dashboard] Failed to fetch notifications', { status: response.status, statusText: response.statusText });
        setUnreadNotificationsCount(0);
      }
    } catch (error) {
      // Silently handle network errors - don't break UI
      clientLogger.warn('[Dashboard] Error fetching unread notifications count', { error });
      setUnreadNotificationsCount(0);
    }
  }

  async function handleCompleteOnboarding(userData?: {
    role?: string;
    experience?: string;
    mainStruggles?: string[];
    howFound?: string;
    goals?: string;
  }) {
    // Save onboarding completion
    localStorage.setItem('onboardingComplete', 'true');
    setShowOnboarding(false);

    // If user provided data, save it to the backend
    if (userData && Object.keys(userData).length > 0) {
      try {
        await fetch('/api/user/onboarding', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData),
        });
        clientLogger.info('Onboarding data saved', { userData });
      } catch (error) {
        clientLogger.error('Failed to save onboarding data', error);
      }
    }
  }

  async function handleStartCall() {
    const perfStart = performance.now();
    const perfTimer = clientLogger.startTimer('Button click → Start call flow');

    // UI-level check
    if (!entitlements || !entitlements.canCall) {
      setError("You're out of call credits. Please upgrade to continue.");
      return;
    }

    if (selectionMode === 'select' && !selectedPersonalityId) {
      setError('Please select a personality before starting a call.');
      return;
    }

    setStartingCall(true);
    setError(null);

    try {
      const apiCallStart = performance.now();
      clientLogger.perf('Calling /api/calls/start', apiCallStart - perfStart);

      const payload: { personalityId?: string } = {};
      if (selectionMode === 'select' && selectedPersonalityId) {
        payload.personalityId = selectedPersonalityId;
      }

      const response = await fetch('/api/calls/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const apiCallEnd = performance.now();
      clientLogger.perf('API response received', apiCallEnd - apiCallStart, { totalTime: apiCallEnd - perfStart });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to start call');
      }
      clientLogger.info('Call started', { agentId: data.agentId, callLogId: data.callLogId });

      // Refresh entitlements after call starts
      const entitlementsResponse = await fetch('/api/user/entitlements');
      if (entitlementsResponse.ok) {
        const updatedEntitlements = await entitlementsResponse.json();
        setEntitlements(updatedEntitlements);
      }

      const navStart = performance.now();
      clientLogger.perf('Navigating to call page', navStart - perfStart);

      // Navigate to call interface with max duration param
      const maxDuration = data.maxDurationSeconds || 300;
      const query = new URLSearchParams({
        maxDuration: maxDuration.toString(),
      });
      if (data.callLogId) {
        query.set('callLogId', data.callLogId);
      }
      router.push(`/call/${data.agentId}?${query.toString()}`);

      perfTimer();
      clientLogger.perf('Total dashboard flow', navStart - perfStart);
    } catch (err) {
      clientLogger.error('Error starting call', err);
      setError(err instanceof Error ? err.message : 'Something went wrong starting your call. Please try again.');
    } finally {
      setStartingCall(false);
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
      // Paid plan - Convert tokens to minutes (1000 tokens = 1 minute)
      const tokens = entitlements.tokensRemaining || 0;
      const minutes = Math.floor(tokens / 1000);
      return {
        label: 'Minutes Remaining',
        value: `${minutes}`,
        subValue: `min`,
        max: 20, // 20,000 tokens = 20 minutes
        current: minutes,
        isOverage: entitlements.isOverage,
      };
    }
  }

  const creditsDisplay = getCreditsDisplay();
  const unlockedPersonalities = entitlements?.unlockedPersonalities ?? [];
  const lockedPersonalities = entitlements?.lockedPersonalities ?? [];
  const shouldShowPersonalitySelector = unlockedPersonalities.length > 0 || lockedPersonalities.length > 0;

  if (!isLoaded || loading) {
    return (
      <>
        <Sidebar />
        <main className="min-h-screen bg-[var(--color-dark-bg)] grid-background lg:pl-64">
          <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-12 py-12 sm:py-16">
            {/* Header Skeleton */}
            <div className="mb-12">
              <SkeletonLoader variant="text" className="h-10 w-64 mb-4" />
              <SkeletonLoader variant="text" className="h-6 w-96" />
            </div>

            {/* Stats Grid Skeleton */}
            <div className="mb-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              <SkeletonLoader variant="stat" count={3} />
            </div>

            {/* Start Call Button Skeleton */}
            <SkeletonLoader variant="text" className="h-14 w-full max-w-md mx-auto mb-12" />

            {/* Personalities Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <SkeletonLoader key={i} variant="badge" />
              ))}
            </div>
          </div>
        </main>
      </>
    );
  }

  if (!isSignedIn) {
    return null;
  }

  return (
    <>
      <Sidebar />
      <main className={`min-h-screen bg-[var(--color-dark-bg)] grid-background transition-all duration-300 ${
        isCollapsed ? 'lg:pl-20' : 'lg:pl-64'
      }`}>
      {/* Dashboard Content */}
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-12 py-12 sm:py-16">
        {/* Header with Breadcrumb and Profile Avatar */}
        <div className="flex items-center justify-between mb-8">
          <Breadcrumb items={[{ label: 'Dashboard' }]} />

          {/* Profile Avatar Button */}
          <button
            onClick={() => {
              setShowProfileDropdown(true);
              // Refresh notifications count when opening profile
              fetchUnreadNotificationsCount();
            }}
            className="relative h-10 w-10 rounded-full bg-gradient-to-br from-[var(--color-cyan-bright)] to-[var(--color-purple-magenta)] p-0.5 transition hover:scale-105"
          >
            <div className="h-full w-full rounded-full bg-[var(--color-card-bg-dark)] flex items-center justify-center">
              <span className="text-sm font-bold text-white">
                {user?.firstName?.charAt(0) || user?.username?.charAt(0) || 'U'}
              </span>
            </div>
            {/* Notification badge - show when there are unread notifications */}
            {unreadNotificationsCount > 0 && (
              <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white ring-2 ring-[var(--color-dark-bg)]">
                {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
              </div>
            )}
            {/* Streak badge - show when profile is loaded */}
            {(profileData?.streak?.currentStreak ?? 0) > 0 && (
              <div className="absolute -bottom-1 -right-1 rounded-full bg-gradient-to-r from-orange-500 to-red-500 px-1.5 py-0.5 text-xs font-bold text-white">
                🔥 {profileData?.streak?.currentStreak}
              </div>
            )}
          </button>
        </div>

        {/* Welcome Section */}
        <div className="mb-12">
          <h1 className="text-4xl font-extrabold text-white sm:text-5xl mb-2">
            <BlurText
              text={`Hey ${user?.firstName || user?.username || 'there'} 👋`}
              delay={80}
              animateBy="words"
              className="bg-gradient-to-r from-white via-[var(--color-cyan-bright)] to-[var(--color-cyan-bright-alt-2)] bg-clip-text text-transparent"
            />
          </h1>
        </div>

        {error && (
          <div className="mb-8 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-red-400">
            {error}
          </div>
        )}

        {/* Main Content - Full Width */}
        <div className="space-y-6">
          {/* Start Call Hero Section - Using standardized Card component */}
          <Card variant="glow" padding="xl" className="group">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-2xl bg-gradient-to-br from-[var(--color-cyan-bright)]/20 to-[var(--color-cyan-bright-alt-2)]/20 ring-2 ring-[var(--color-cyan-bright)]/30 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-[var(--color-cyan-bright)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <h2 className="text-5xl font-extrabold text-white mb-2 bg-gradient-to-r from-white to-[var(--color-cyan-bright)] bg-clip-text text-transparent">
                  Start Practice
                </h2>
              </div>

              {/* Personality Selector Integrated */}
              {shouldShowPersonalitySelector && (
                <div className="mb-8">
                  <PersonalitySelector
                    unlockedPersonalities={unlockedPersonalities}
                    lockedPersonalities={lockedPersonalities}
                    selectionMode={selectionMode}
                    selectedPersonalityId={selectedPersonalityId}
                    onModeChange={(mode) => {
                      setSelectionMode(mode);
                      if (mode === 'random') {
                        setShowUpgradePrompt(false);
                      }
                    }}
                    onSelectPersonality={(id) => {
                      setSelectedPersonalityId(id);
                      setShowUpgradePrompt(false);
                    }}
                    onRequestUpgrade={() => {
                      if (entitlements?.plan === 'trial') {
                        setShowUpgradePrompt(true);
                      }
                    }}
                  />
                </div>
              )}

              {/* Start Call Button - Using standardized Button component */}
              <Button
                onClick={handleStartCall}
                variant="primary"
                size="md"
                fullWidth
                disabled={
                  !entitlements ||
                  !entitlements.canCall ||
                  startingCall ||
                  (selectionMode === 'select' && !selectedPersonalityId)
                }
              >
                {startingCall ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Starting...</span>
                  </>
                ) : (!entitlements || !entitlements.canCall) ? (
                  <>
                    <span>🚫</span>
                    <span>No Credits</span>
                  </>
                ) : selectionMode === 'select' && !selectedPersonalityId ? (
                  <>
                    <span>👆</span>
                    <span>Pick One</span>
                  </>
                ) : (
                  <>
                    <span>🎯</span>
                    <span>Start Call</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </Button>

              {entitlements && !entitlements.canCall && entitlements.plan === 'trial' && (
                <div className="mt-6 text-center animate-fadeIn">
                  <Link href="/plans">
                    <Button variant="purple" size="lg" className="group/upgrade">
                      <span className="group-hover/upgrade:scale-110 transition-transform duration-300">✨</span>
                      Unlock More
                      <svg className="w-5 h-5 group-hover/upgrade:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </Button>
                  </Link>
                </div>
              )}
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <button
              onClick={() => setShowQuickPractice(true)}
              className="group/quick relative overflow-hidden rounded-2xl border border-[var(--color-purple)]/30 bg-gradient-to-br from-[var(--color-purple)]/10 to-[var(--color-purple-dark)]/10 p-6 text-left transition-all duration-300 hover:scale-[1.03] hover:border-[var(--color-purple)]/60 shadow-[0_0_20px_rgba(168,85,247,0.2)] hover:shadow-[0_0_40px_rgba(168,85,247,0.5)] active:scale-[0.99]"
            >
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-purple)]/0 to-[var(--color-purple)]/20 opacity-0 group-hover/quick:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-purple)]/30 to-[var(--color-purple-dark)]/30 ring-2 ring-[var(--color-purple)]/40 group-hover/quick:scale-110 group-hover/quick:rotate-3 transition-all duration-300">
                      <svg className="h-5 w-5 text-[var(--color-purple-light)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-white group-hover/quick:text-[var(--color-purple-light)] transition-colors duration-300">Quick Practice</h3>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[var(--color-purple)] font-semibold">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--color-purple)] animate-pulse"></span>
                    30-sec drills
                  </div>
                </div>
              </button>

              <button
                onClick={() => setShowObjectionLibrary(true)}
                className="group/lib relative overflow-hidden rounded-2xl border border-[var(--color-cyan-bright)]/30 bg-gradient-to-br from-[var(--color-cyan-bright)]/10 to-[var(--color-cyan-bright-alt-2)]/10 p-6 text-left transition-all duration-300 hover:scale-[1.03] hover:border-[var(--color-cyan-bright)]/60 shadow-[0_0_20px_rgba(0,217,255,0.2)] hover:shadow-[0_0_40px_rgba(0,217,255,0.5)] active:scale-[0.99]"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-cyan-bright)]/0 to-[var(--color-cyan-bright)]/20 opacity-0 group-hover/lib:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-cyan-bright)]/30 to-[var(--color-cyan-bright-alt-2)]/30 ring-2 ring-[var(--color-cyan-bright)]/40 group-hover/lib:scale-110 group-hover/lib:-rotate-3 transition-all duration-300">
                      <svg className="h-5 w-5 text-[var(--color-cyan-bright)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-white group-hover/lib:text-[var(--color-cyan-bright)] transition-colors duration-300">Objection Library</h3>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[var(--color-cyan-bright)] font-semibold">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--color-cyan-bright)] animate-pulse"></span>
                    35+ responses
                  </div>
                </div>
            </button>

            {/* Credits Card - Using standardized Card component */}
            <Card variant="hover" padding="lg" className="group/credits text-left">
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--color-cyan-bright)]/30 to-[var(--color-cyan-bright)]/10 ring-2 ring-[var(--color-cyan-bright)]/40 group-hover/credits:scale-110 group-hover/credits:rotate-6 transition-all duration-300">
                    <svg className="h-5 w-5 text-[var(--color-cyan-bright)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white group-hover/credits:text-[var(--color-cyan-bright)] transition-colors duration-300">
                    {creditsDisplay.label}
                  </h3>
                </div>
                <div className="flex items-baseline gap-2 mb-3">
                  <p className="text-4xl font-extrabold text-white tabular-nums">
                    {creditsDisplay.value}
                  </p>
                  {creditsDisplay.subValue && (
                    <span className="text-sm text-[var(--color-text-muted)] font-medium">{creditsDisplay.subValue}</span>
                  )}
                  <span className="text-xs text-[var(--color-text-muted)] ml-auto">
                    {entitlements?.plan === 'trial' ? '🌱 Trial' : '⭐ Pro'}
                  </span>
                </div>
                <div className="relative h-2.5 overflow-hidden rounded-full bg-white/5 ring-1 ring-[var(--color-border-subtle)]/50">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[var(--color-cyan-bright)] via-[var(--color-cyan-bright-alt-2)] to-[var(--color-cyan-bright)] shadow-[0_0_20px_rgba(0,217,255,0.5)] transition-all duration-500 ease-out relative overflow-hidden"
                    style={{ width: `${(creditsDisplay.current / creditsDisplay.max) * 100}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-40 animate-shimmer"></div>
                  </div>
                </div>
                {creditsDisplay.isOverage && (
                  <div className="mt-3 rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-3 py-2 flex items-center gap-2 animate-fadeIn">
                    <span className="text-lg">⚠️</span>
                    <p className="text-xs text-yellow-300 font-medium">
                      Overage: $1/min
                    </p>
                  </div>
                )}
                {entitlements?.plan === 'trial' && (
                  <Link href="/plans">
                    <Button variant="purple" size="sm" fullWidth className="group/upgrade-btn mt-3">
                      <span className="group-hover/upgrade-btn:scale-110 transition-transform duration-300">✨</span>
                      Upgrade
                      <svg className="w-4 h-4 group-hover/upgrade-btn:translate-x-0.5 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Button>
                  </Link>
                )}
              </div>
            </Card>
          </div>
        </div>

        {/* Quick Stats - Hidden until user has call history */}
        {/* TODO: Unhide this section and populate with real data from call history */}
        {false && (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-[var(--color-border-subtle)]/50 bg-white/[0.02] p-6 backdrop-blur-xl text-center">
              <p className="text-sm font-medium text-[var(--color-text-secondary)] mb-2">Total Calls</p>
              <p className="text-3xl font-extrabold text-white">0</p>
            </div>
            <div className="rounded-2xl border border-[var(--color-border-subtle)]/50 bg-white/[0.02] p-6 backdrop-blur-xl text-center">
              <p className="text-sm font-medium text-[var(--color-text-secondary)] mb-2">Avg. Score</p>
              <p className="text-3xl font-extrabold text-white">—</p>
            </div>
            <div className="rounded-2xl border border-[var(--color-border-subtle)]/50 bg-white/[0.02] p-6 backdrop-blur-xl text-center">
              <p className="text-sm font-medium text-[var(--color-text-secondary)] mb-2">Success Rate</p>
              <p className="text-3xl font-extrabold text-white">—</p>
            </div>
          </div>
        )}
      </div>
      </main>

      {/* Quick Practice Modal */}
      <QuickPracticeModal
        isOpen={showQuickPractice}
        onClose={() => setShowQuickPractice(false)}
      />

      {/* Objection Library Modal */}
      <ObjectionLibraryModal
        isOpen={showObjectionLibrary}
        onClose={() => setShowObjectionLibrary(false)}
      />

      {/* Profile Dropdown Modal */}
      <ProfileDropdownModal
        isOpen={showProfileDropdown}
        onClose={() => setShowProfileDropdown(false)}
        userData={profileData}
        loading={profileLoading}
      />

      {/* Onboarding Modal */}
      <OnboardingModal
        isOpen={showOnboarding}
        onClose={() => {
          localStorage.setItem('onboardingComplete', 'true');
          setShowOnboarding(false);
        }}
        onComplete={handleCompleteOnboarding}
      />

      {showUpgradePrompt && entitlements?.plan === 'trial' && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-md rounded-2xl border border-[var(--color-border-subtle)]/50 bg-[var(--color-darker-bg)] p-6 text-center shadow-2xl">
            <h3 className="text-2xl font-bold text-white">Unlock Boss Personalities</h3>
            <p className="mt-3 text-sm text-[var(--color-text-secondary)]">
              Upgrade to the Pro plan to access The Wolf, The Shark, and three more advanced personalities.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <Link href="/plans">
                <Button
                  variant="purple"
                  size="sm"
                  fullWidth
                  onClick={() => setShowUpgradePrompt(false)}
                >
                  Upgrade to Pro
                </Button>
              </Link>
              <button
                onClick={() => setShowUpgradePrompt(false)}
                className="w-full rounded-full border border-[var(--color-border-subtle)]/50 px-6 py-3 text-sm font-semibold text-white/70 transition hover:text-white hover:border-[var(--color-border-medium)]"
              >
                Maybe later
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function Dashboard() {
  return (
    <SidebarProvider>
      <DashboardContent />
    </SidebarProvider>
  );
}
