'use client';

import { useAuth, useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import PersonalitySelector, { type Personality } from '@/components/PersonalitySelector';
import QuickPracticeModal from '@/components/QuickPracticeModal';
import ObjectionLibraryModal from '@/components/ObjectionLibraryModal';
import ProfileDropdownModal from '@/components/ProfileDropdownModal';
import Sidebar from '@/components/Sidebar';
import Breadcrumb from '@/components/Breadcrumb';
import Link from 'next/link';
import { SidebarProvider, useSidebar } from '@/components/SidebarContext';

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

  const fetchProfileData = useCallback(async () => {
    setProfileLoading(true);
    try {
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const data = await response.json();
        setProfileData(data);
      } else {
        const errorData = await response.json();
        console.error('Failed to fetch profile:', response.status, errorData);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setProfileLoading(false);
    }
  }, []);

  // Fetch profile data when modal opens
  useEffect(() => {
    if (showProfileDropdown && !profileData) {
      fetchProfileData();
    }
  }, [showProfileDropdown, profileData, fetchProfileData]);

  // Fetch unread notifications count on mount and periodically
  useEffect(() => {
    fetchUnreadNotificationsCount();
    const interval = setInterval(fetchUnreadNotificationsCount, 30000); // Every 30 seconds
    return () => clearInterval(interval);
  }, []);

  async function fetchUnreadNotificationsCount() {
    try {
      const response = await fetch('/api/notifications?unreadOnly=true');
      if (response.ok) {
        const data = await response.json();
        setUnreadNotificationsCount(data.unreadCount);
      } else {
        // Silently fail - notifications are non-critical
        console.warn('Failed to fetch notifications:', response.status);
      }
    } catch (error) {
      // Silently fail - notifications are non-critical
      // Only log in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching unread notifications count:', error);
      }
    }
  }

  async function handleStartCall() {
    const perfStart = performance.now();
    console.log('[PERF] Button click → Start call flow');

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
      console.log(`[PERF] ${(apiCallStart - perfStart).toFixed(0)}ms - Calling /api/calls/start`);

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
      console.log(`[PERF] ${(apiCallEnd - perfStart).toFixed(0)}ms - API response received (took ${(apiCallEnd - apiCallStart).toFixed(0)}ms)`);

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to start call');
      }
      console.log('Call started:', data);

      // Refresh entitlements after call starts
      try {
        const entitlementsResponse = await fetch('/api/user/entitlements');
        if (entitlementsResponse.ok) {
          const updatedEntitlements = await entitlementsResponse.json();
          setEntitlements(updatedEntitlements);
        } else {
          console.warn('Failed to refresh entitlements after call start:', entitlementsResponse.status);
        }
      } catch (entitlementsError) {
        // Log but don't block navigation - entitlements will refresh on next page load
        console.error('Error refreshing entitlements:', entitlementsError);
      }

      const navStart = performance.now();
      console.log(`[PERF] ${(navStart - perfStart).toFixed(0)}ms - Navigating to call page`);

      // Navigate to call interface with max duration param
      const maxDuration = data.maxDurationSeconds || 300;
      const query = new URLSearchParams({
        maxDuration: maxDuration.toString(),
      });
      if (data.callLogId) {
        query.set('callLogId', data.callLogId);
      }
      router.push(`/call/${data.agentId}?${query.toString()}`);

      console.log(`[PERF] Total dashboard flow: ${(navStart - perfStart).toFixed(0)}ms`);
    } catch (err) {
      console.error('Error starting call:', err);
      setError(err instanceof Error ? err.message : 'Failed to start call');
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
      <main className={`min-h-screen bg-[#080d1a] grid-background transition-all duration-300 ${
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
            className="relative h-10 w-10 rounded-full bg-gradient-to-br from-[#00d9ff] to-[#9d4edd] p-0.5 transition hover:scale-105"
          >
            <div className="h-full w-full rounded-full bg-[#1A1F2E] flex items-center justify-center">
              <span className="text-sm font-bold text-white">
                {user?.firstName?.charAt(0) || user?.username?.charAt(0) || 'U'}
              </span>
            </div>
            {/* Notification badge - show when there are unread notifications */}
            {unreadNotificationsCount > 0 && (
              <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white ring-2 ring-[#080d1a]">
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
          <h1 className="text-4xl font-extrabold text-white sm:text-5xl">
            Welcome back, <span className="text-[#00d9ff]">{user?.firstName || user?.username || 'there'}</span>
          </h1>
          <p className="mt-4 text-xl text-[#94a3b8]">
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
          <div className="rounded-3xl border border-[#1e293b]/50 bg-gradient-to-br from-[rgba(15,23,42,0.6)] to-[rgba(5,9,17,0.8)] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.7),0_0_40px_rgba(0,217,255,0.08)] backdrop-blur-xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[#00d9ff]/30 to-[#00d9ff]/10 ring-2 ring-[#00d9ff]/30">
                <svg className="h-7 w-7 text-[#00d9ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-[#94a3b8]">{creditsDisplay.label}</p>
                <p className="text-4xl font-extrabold text-white tabular-nums">
                  {creditsDisplay.value}
                </p>
                {creditsDisplay.subValue && (
                  <p className="text-sm text-[#94a3b8] mt-1">{creditsDisplay.subValue}</p>
                )}
              </div>
            </div>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/5 ring-1 ring-[#1e293b]/50">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#00d9ff] to-[#00ffea] shadow-[0_0_20px_rgba(0,217,255,0.4)] transition-all"
                style={{ width: `${(creditsDisplay.current / creditsDisplay.max) * 100}%` }}
              ></div>
            </div>
            {creditsDisplay.isOverage && (
              <div className="mt-4 rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-3">
                <p className="text-sm text-yellow-400">
                  Out of minutes - Additional calls billed at $1/min
                </p>
              </div>
            )}

            {/* Upgrade Button - Show for trial users */}
            {entitlements?.plan === 'trial' && (
              <Link
                href="/plans"
                className="mt-4 w-full block text-center rounded-xl bg-gradient-to-r from-[#a855f7] to-[#9333ea] px-6 py-3 text-sm font-semibold text-white transition-all hover:scale-[1.02] shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)]"
              >
                View Plans
              </Link>
            )}
          </div>

          {/* Account Info Card */}
          <div className="rounded-3xl border border-[#1e293b]/50 bg-gradient-to-br from-[rgba(15,23,42,0.6)] to-[rgba(5,9,17,0.8)] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.7)] backdrop-blur-xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[#a855f7]/30 to-[#a855f7]/10 ring-2 ring-[#a855f7]/30">
                <svg className="h-7 w-7 text-[#a855f7]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-[#94a3b8]">Account Type</p>
                <p className="text-2xl font-extrabold text-white">
                  {entitlements?.plan === 'trial' ? 'Trial' : 'Pro'}
                </p>
              </div>
            </div>
            <p className="text-sm text-[#64748b] mt-2">
              {entitlements?.plan === 'trial'
                ? 'Upgrade to Pro for more personalities and longer calls'
                : 'Pro plan with all features unlocked'}
            </p>
          </div>
        </div>

        {shouldShowPersonalitySelector && (
          <div className="mb-12">
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

        {/* Start Call CTA */}
        <div className="rounded-3xl border border-[#1e293b]/50 bg-gradient-to-br from-[rgba(15,23,42,0.6)] to-[rgba(5,9,17,0.8)] p-12 shadow-[0_20px_60px_rgba(0,0,0,0.7),0_0_40px_rgba(0,217,255,0.08)] backdrop-blur-xl text-center">
          <h2 className="text-3xl font-extrabold text-white mb-4">
            Ready to practice?
          </h2>
          <p className="text-lg text-[#94a3b8] mb-8 max-w-2xl mx-auto">
            Start a new AI-powered sales call simulation and master objection handling in real-time.
          </p>

          <div className="mb-6 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => setShowQuickPractice(true)}
              className="inline-flex items-center gap-2 rounded-full border border-[#a855f7]/30 bg-gradient-to-r from-[#a855f7]/20 to-[#9333ea]/20 px-6 py-3 text-sm font-semibold text-[#d8b4fe] transition hover:scale-105 shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)]"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              ⚡ Quick Practice (30sec drills)
            </button>
            <button
              onClick={() => setShowObjectionLibrary(true)}
              className="inline-flex items-center gap-2 rounded-full border border-[#00d9ff]/30 bg-[#00d9ff]/10 px-6 py-3 text-sm font-semibold text-[#00d9ff] transition hover:bg-[#00d9ff]/20 hover:border-[#00d9ff]/50"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              📖 View Objection Library
            </button>
          </div>

          <button
            onClick={handleStartCall}
            className="rounded-full bg-gradient-to-r from-[#00d9ff] to-[#00ffea] px-12 py-5 text-xl font-semibold text-[#080d1a] transition-all hover:scale-105 shadow-[0_0_40px_rgba(0,217,255,0.6)] hover:shadow-[0_0_60px_rgba(0,255,234,0.8)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            disabled={
              !entitlements ||
              !entitlements.canCall ||
              startingCall ||
              (selectionMode === 'select' && !selectedPersonalityId)
            }
          >
            {startingCall
              ? 'Starting Call...'
              : (!entitlements || !entitlements.canCall)
              ? 'Out of Call Credits'
              : selectionMode === 'select' && !selectedPersonalityId
              ? 'Select a Personality'
              : 'Start Call'}
          </button>
          {entitlements && !entitlements.canCall && entitlements.plan === 'trial' && (
            <div className="mt-6">
              <p className="text-sm text-[#94a3b8] mb-4">
                You&apos;re out of call credits. Please upgrade to continue.
              </p>
              <Link
                href="/plans"
                className="inline-block rounded-full bg-gradient-to-r from-[#a855f7] to-[#9333ea] px-8 py-3 text-base font-semibold text-white transition-all hover:scale-105 shadow-[0_0_30px_rgba(168,85,247,0.4)] hover:shadow-[0_0_40px_rgba(168,85,247,0.6)]"
              >
                View Plans
              </Link>
            </div>
          )}
        </div>

        {/* Quick Stats - Hidden until user has call history */}
        {/* TODO: Unhide this section and populate with real data from call history */}
        {false && (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-[#1e293b]/50 bg-white/[0.02] p-6 backdrop-blur-xl text-center">
              <p className="text-sm font-medium text-[#94a3b8] mb-2">Total Calls</p>
              <p className="text-3xl font-extrabold text-white">0</p>
            </div>
            <div className="rounded-2xl border border-[#1e293b]/50 bg-white/[0.02] p-6 backdrop-blur-xl text-center">
              <p className="text-sm font-medium text-[#94a3b8] mb-2">Avg. Score</p>
              <p className="text-3xl font-extrabold text-white">—</p>
            </div>
            <div className="rounded-2xl border border-[#1e293b]/50 bg-white/[0.02] p-6 backdrop-blur-xl text-center">
              <p className="text-sm font-medium text-[#94a3b8] mb-2">Success Rate</p>
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

      {showUpgradePrompt && entitlements?.plan === 'trial' && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-md rounded-2xl border border-[#1e293b]/50 bg-[#050911] p-6 text-center shadow-2xl">
            <h3 className="text-2xl font-bold text-white">Unlock Boss Personalities</h3>
            <p className="mt-3 text-sm text-[#94a3b8]">
              Upgrade to the Pro plan to access The Wolf, The Shark, and three more advanced personalities.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <Link
                href="/plans"
                className="w-full rounded-full bg-gradient-to-r from-[#a855f7] to-[#9333ea] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                onClick={() => setShowUpgradePrompt(false)}
              >
                Upgrade to Pro
              </Link>
              <button
                onClick={() => setShowUpgradePrompt(false)}
                className="w-full rounded-full border border-[#1e293b]/50 px-6 py-3 text-sm font-semibold text-white/70 transition hover:text-white hover:border-[#334155]"
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
