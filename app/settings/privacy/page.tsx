'use client';

import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Breadcrumb from '@/components/Breadcrumb';
import { SidebarProvider, useSidebar } from '@/components/SidebarContext';
import clientLogger from '@/lib/client-logger';

export const dynamic = 'force-dynamic';

interface PrivacySettings {
  profile_visibility: 'public' | 'private';
  show_stats_publicly: boolean;
  show_on_leaderboard: boolean;
}

function PrivacySettingsContent() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();
  const { isCollapsed } = useSidebar();
  const [settings, setSettings] = useState<PrivacySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null); // Track which setting is being saved
  const [savedKey, setSavedKey] = useState<string | null>(null); // Show "Saved" feedback for specific toggle
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/');
    }
  }, [isSignedIn, isLoaded, router]);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const response = await fetch('/api/privacy');
        if (!response.ok) {
          throw new Error('Failed to fetch privacy settings');
        }
        const data = await response.json();
        setSettings(data);
      } catch (err) {
        clientLogger.error('Error fetching privacy settings', err);
        setError('Failed to load your privacy settings. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    }

    if (isSignedIn) {
      fetchSettings();
    }
  }, [isSignedIn]);

  async function updateSetting(
    key: keyof PrivacySettings,
    value: string | boolean
  ) {
    if (!settings) return;

    setSaving(key);
    setError(null);
    setSavedKey(null);

    // Optimistically update UI
    const previousSettings = { ...settings };
    setSettings({ ...settings, [key]: value });

    try {
      const response = await fetch('/api/privacy', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: value }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update setting');
      }

      const updatedSettings = await response.json();
      setSettings(updatedSettings);
      setSavedKey(key);

      // Clear "Saved" message after 2 seconds
      setTimeout(() => {
        setSavedKey(null);
      }, 2000);
    } catch (err) {
      clientLogger.error('Error updating privacy setting', err);
      setError(err instanceof Error ? err.message : 'Failed to update setting');
      // Revert optimistic update on error
      setSettings(previousSettings);
    } finally {
      setSaving(null);
    }
  }

  if (!isLoaded || loading) {
    return (
      <>
        <Sidebar />
        <main className="min-h-screen bg-[var(--color-dark-bg)] grid-background lg:pl-64">
          <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-12 py-12 sm:py-16">
            <div className="h-10 w-64 mb-8 bg-white/5 rounded animate-pulse"></div>
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-white/5 rounded-2xl animate-pulse"></div>
              ))}
            </div>
          </div>
        </main>
      </>
    );
  }

  if (!isSignedIn || !settings) {
    return null;
  }

  return (
    <>
      <Sidebar />
      <main
        className={`min-h-screen bg-[var(--color-dark-bg)] grid-background transition-all duration-300 ${
          isCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-12 py-12 sm:py-16">
          {/* Header */}
          <div className="mb-8">
            <Breadcrumb
              items={[{ label: 'Settings' }, { label: 'Privacy' }]}
            />
            <h1 className="text-4xl font-extrabold text-white mt-4">
              Privacy Settings
            </h1>
            <p className="text-[var(--color-text-secondary)] mt-2">
              Control how your profile and stats appear to other users
            </p>
          </div>

          {error && (
            <div className="mb-8 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-red-400">
              {error}
            </div>
          )}

          {/* Settings List */}
          <div className="space-y-4">
            {/* Profile Visibility */}
            <div className="group rounded-2xl border border-[var(--color-border-subtle)]/50 bg-gradient-to-br from-card-bg to-[rgba(5,9,17,0.8)] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.7)] backdrop-blur-xl hover:border-[var(--color-cyan-bright)]/30 transition-all duration-300">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-cyan-bright)]/30 to-[#00ffea]/30 ring-2 ring-[var(--color-cyan-bright)]/40">
                      <svg
                        className="h-5 w-5 text-[var(--color-cyan-bright)]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">
                        Profile Visibility
                      </h3>
                      {savedKey === 'profile_visibility' && (
                        <span className="text-sm text-green-400 animate-fadeIn">
                          ✓ Saved
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-[var(--color-text-secondary)] mt-2">
                    When set to private, other users cannot view your profile page.
                    Your profile will return a 404 error to anyone except you.
                  </p>
                  {settings.profile_visibility === 'private' && (
                    <div className="mt-3 rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-3 py-2 flex items-center gap-2 animate-fadeIn">
                      <span className="text-lg">🔒</span>
                      <p className="text-xs text-yellow-300 font-medium">
                        Others won&apos;t be able to view your profile
                      </p>
                    </div>
                  )}
                </div>
                <button
                  onClick={() =>
                    updateSetting(
                      'profile_visibility',
                      settings.profile_visibility === 'public' ? 'private' : 'public'
                    )
                  }
                  disabled={saving === 'profile_visibility'}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-cyan-bright)] focus:ring-offset-2 focus:ring-offset-[var(--color-dark-bg)] ${
                    settings.profile_visibility === 'public'
                      ? 'bg-[var(--color-cyan-bright)]'
                      : 'bg-[var(--color-border-subtle)]'
                  } ${
                    saving === 'profile_visibility' ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${
                      settings.profile_visibility === 'public'
                        ? 'translate-x-7'
                        : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Show Stats Publicly */}
            <div className="group rounded-2xl border border-[var(--color-border-subtle)]/50 bg-gradient-to-br from-card-bg to-[rgba(5,9,17,0.8)] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.7)] backdrop-blur-xl hover:border-[var(--color-cyan-bright)]/30 transition-all duration-300">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-purple)]/30 to-[var(--color-purple-dark)]/30 ring-2 ring-[var(--color-purple)]/40">
                      <svg
                        className="h-5 w-5 text-[#d8b4fe]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Show Stats Publicly</h3>
                      {savedKey === 'show_stats_publicly' && (
                        <span className="text-sm text-green-400 animate-fadeIn">
                          ✓ Saved
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-[var(--color-text-secondary)] mt-2">
                    Hide your call statistics (total calls, total minutes, scores) from
                    other users. Your belt, tier, badges, and power level will still be
                    visible.
                  </p>
                </div>
                <button
                  onClick={() =>
                    updateSetting('show_stats_publicly', !settings.show_stats_publicly)
                  }
                  disabled={saving === 'show_stats_publicly'}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-purple)] focus:ring-offset-2 focus:ring-offset-[var(--color-dark-bg)] ${
                    settings.show_stats_publicly ? 'bg-[var(--color-purple)]' : 'bg-[var(--color-border-subtle)]'
                  } ${
                    saving === 'show_stats_publicly' ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${
                      settings.show_stats_publicly ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Show on Leaderboard */}
            <div className="group rounded-2xl border border-[var(--color-border-subtle)]/50 bg-gradient-to-br from-card-bg to-[rgba(5,9,17,0.8)] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.7)] backdrop-blur-xl hover:border-[var(--color-cyan-bright)]/30 transition-all duration-300">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[#fbbf24]/30 to-[var(--color-warning)]/30 ring-2 ring-[#fbbf24]/40">
                      <svg
                        className="h-5 w-5 text-[#fbbf24]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">
                        Show on Leaderboard
                      </h3>
                      {savedKey === 'show_on_leaderboard' && (
                        <span className="text-sm text-green-400 animate-fadeIn">
                          ✓ Saved
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-[var(--color-text-secondary)] mt-2">
                    Opt out of appearing on the global leaderboard. Your ranking will not
                    be visible to others and will not count in rank calculations.
                  </p>
                </div>
                <button
                  onClick={() =>
                    updateSetting('show_on_leaderboard', !settings.show_on_leaderboard)
                  }
                  disabled={saving === 'show_on_leaderboard'}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#fbbf24] focus:ring-offset-2 focus:ring-offset-[var(--color-dark-bg)] ${
                    settings.show_on_leaderboard ? 'bg-[#fbbf24]' : 'bg-[var(--color-border-subtle)]'
                  } ${
                    saving === 'show_on_leaderboard' ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${
                      settings.show_on_leaderboard ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

export default function PrivacySettingsPage() {
  return (
    <SidebarProvider>
      <PrivacySettingsContent />
    </SidebarProvider>
  );
}
