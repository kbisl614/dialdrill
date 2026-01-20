'use client';

import { useState, useEffect } from 'react';
// Removed reactbits.dev components - using simple alternatives

interface ProfileDropdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  userData: UserProfileData | null;
  loading?: boolean;
}

interface UserProfileData {
  username: string;
  avatar: string;
  email: string;
  memberSince: string;
  currentPower: number;
  currentBelt: BeltInfo;
  nextBelt: BeltInfo;
  streak: StreakInfo;
  multiplier: MultiplierInfo;
  badges: Badge[];
  statistics: Statistics;
}

interface BeltInfo {
  tier: string;
  belt: string;
  color: string;
  minPower: number;
  maxPower: number;
}

interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  lastLogin: string;
}

interface MultiplierInfo {
  active: boolean;
  percentage: number;
  daysToNext: number | null;
  nextMultiplier: number | null;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  category: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  earned: boolean;
  earnedDate?: string;
  progress?: number;
  total?: number;
}

interface Statistics {
  totalCalls: number;
  totalMinutes: number;
  averageScore: number;
  objectionSuccessRate: number;
  closingRate: number;
  averageWPM: number;
  fillerWordAverage: number;
}

type TabType = 'statistics' | 'notifications' | 'badges' | 'journey' | 'leaderboard';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

interface LeaderboardUser {
  username: string;
  power_level: number;
  current_tier: string;
  current_belt: string;
  total_calls: number;
}

interface LeaderboardData {
  leaderboard: LeaderboardUser[];
  currentUser: {
    username: string;
    powerLevel: number;
    tier: string;
    belt: string;
    rank: number;
  };
}

export default function ProfileDropdownModal({ isOpen, onClose, userData, loading = false }: ProfileDropdownModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('statistics');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData | null>(null);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [leaderboardError, setLeaderboardError] = useState(false);

  // Fetch notifications when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
      fetchLeaderboard();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  async function fetchNotifications() {
    setNotificationsLoading(true);
    try {
      const response = await fetch('/api/notifications');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setNotificationsLoading(false);
    }
  }

  async function markAsRead(notificationId: string) {
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId }),
      });
      // Refresh notifications
      fetchNotifications();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }

  async function markAllAsRead() {
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllRead: true }),
      });
      // Refresh notifications
      fetchNotifications();
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  }

  async function fetchLeaderboard() {
    setLeaderboardLoading(true);
    try {
      const response = await fetch('/api/leaderboard?limit=50');
      if (response.ok) {
        const data = await response.json();
        setLeaderboardData(data);
        setLeaderboardError(false);
      } else {
        // Silently fall back if the leaderboard API isn't available yet
        setLeaderboardError(true);
        // Set empty leaderboard data on error
        setLeaderboardData({
          leaderboard: [],
          currentUser: {
            username: userData?.username || 'Unknown',
            powerLevel: userData?.currentPower || 0,
            tier: userData?.currentBelt?.tier || 'Bronze',
            belt: userData?.currentBelt?.belt || 'White',
            rank: 0,
          },
        });
      }
    } catch {
      // Silently fall back if the leaderboard API isn't available yet
      setLeaderboardError(true);
      // Set empty leaderboard data on error
      setLeaderboardData({
        leaderboard: [],
        currentUser: {
          username: userData?.username || 'Unknown',
          powerLevel: userData?.currentPower || 0,
          tier: userData?.currentBelt?.tier || 'Bronze',
          belt: userData?.currentBelt?.belt || 'White',
          rank: 0,
        },
      });
    } finally {
      setLeaderboardLoading(false);
    }
  }

  if (!isOpen) return null;

  // Show loading state
  if (loading || !userData) {
    return (
      <>
        <div className="fixed inset-0 z-40 bg-black/50" onClick={onClose} />
        <div className="fixed top-20 right-6 z-50 w-[480px] rounded-2xl border border-white/10 bg-[#1A1F2E] shadow-2xl p-6">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00d9ff] mx-auto mb-4"></div>
              <p className="text-sm text-[#9ca3af]">Loading profile...</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Calculate progress to next belt
  const progressPercentage =
    ((userData.currentPower - userData.currentBelt.minPower) /
    (userData.nextBelt.minPower - userData.currentBelt.minPower)) * 100;

  const powerToNextBelt = userData.nextBelt.minPower - userData.currentPower;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50"
        onClick={onClose}
      />

      {/* Dropdown Modal */}
      <div className="fixed top-20 right-6 z-50 w-[480px] max-h-[calc(100vh-120px)] rounded-2xl border border-white/10 bg-[#1A1F2E] shadow-2xl">
        {/* Header */}
        <div className="border-b border-white/10 bg-gradient-to-r from-[#00d9ff]/10 to-[#9d4edd]/10 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="relative">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-[#00d9ff] to-[#9d4edd] p-0.5">
                  <div className="h-full w-full rounded-full bg-[#1A1F2E] flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">
                      {(userData.username?.charAt(0) || 'U').toUpperCase()}
                    </span>
                  </div>
                </div>
                {/* Streak indicator */}
                {userData.streak.currentStreak > 0 && (
                  <div className="absolute -bottom-1 -right-1 flex items-center gap-1 rounded-full bg-gradient-to-r from-orange-500 to-red-500 px-2 py-0.5 text-xs font-bold text-white">
                    🔥 {userData.streak.currentStreak}
                  </div>
                )}
              </div>

              {/* Username and Belt */}
              <div>
                <h2 className="text-xl font-bold text-white">{userData.username}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: userData.currentBelt.color }}
                  />
                  <span className="text-sm font-semibold" style={{ color: userData.currentBelt.color }}>
                    {userData.currentBelt.tier} {userData.currentBelt.belt} Belt
                  </span>
                </div>
              </div>
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              className="rounded-full p-2 text-white/60 transition hover:bg-white/10 hover:text-white"
              aria-label="Close"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Power Level Display */}
          <div className="text-center">
            <p className="text-sm text-[#9ca3af] mb-1">Power Level</p>
            <span className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#00d9ff] to-[#9d4edd]">
              {userData.currentPower.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Scrollable Content */}
        <div
          data-lenis-prevent
          className="overflow-y-scroll p-6 scrollbar-custom"
          style={{
            height: '600px',
            scrollbarWidth: 'auto',
            scrollbarColor: '#00d9ff #1e293b',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {/* Next Milestone Card */}
          <div className="mb-6 rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <h3 className="text-sm font-semibold text-white mb-3">Next Milestone</h3>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[#9ca3af]">
                {userData.currentBelt.tier} {userData.currentBelt.belt} Belt
              </span>
              <span className="text-xs text-[#9ca3af]">
                {userData.nextBelt.tier} {userData.nextBelt.belt} Belt
              </span>
            </div>
            {/* Progress bar */}
            <div className="h-3 w-full rounded-full bg-white/10 overflow-hidden mb-2">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#00d9ff] to-[#9d4edd] transition-all duration-500"
                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
              />
            </div>
            <p className="text-xs text-[#9ca3af] text-center">
              {powerToNextBelt.toLocaleString()} power to next belt ({progressPercentage.toFixed(1)}%)
            </p>
          </div>

          {/* Multiplier Status Card */}
          {userData.multiplier.active && (
            <div className="mb-6 rounded-xl border border-[#00d9ff]/30 bg-gradient-to-r from-[#00d9ff]/10 to-[#9d4edd]/10 p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-white">Active Multiplier</h3>
                <span className="rounded-full bg-[#00d9ff]/20 px-3 py-1 text-sm font-bold text-[#00d9ff]">
                  +{userData.multiplier.percentage}%
                </span>
              </div>
              {userData.multiplier.daysToNext && userData.multiplier.nextMultiplier && (
                <p className="text-xs text-[#9ca3af]">
                  {userData.multiplier.daysToNext} more days to unlock +{userData.multiplier.nextMultiplier}% multiplier
                </p>
              )}
            </div>
          )}

          {/* Tab Navigation */}
          <div className="mb-6 relative">
            <div className="flex gap-2 overflow-x-auto">
              {[
                { id: 'statistics', label: 'Stats', icon: '📊' },
                { id: 'notifications', label: unreadCount > 0 ? `Alerts (${unreadCount > 9 ? '9+' : unreadCount})` : 'Alerts', icon: '🔔' },
                { id: 'badges', label: 'Badges', icon: '🏆' },
                { id: 'leaderboard', label: 'Ranks', icon: '👑' },
                { id: 'journey', label: 'Journey', icon: '🥋' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-[#00d9ff] text-[#080d1a] shadow-[0_0_20px_rgba(0,217,255,0.5)]'
                      : 'bg-[#1e293b] text-[#9ca3af] hover:bg-[#334155] hover:text-white'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'statistics' && <StatisticsTab statistics={userData.statistics} />}
          {activeTab === 'notifications' && (
            <NotificationsTab
              notifications={notifications}
              loading={notificationsLoading}
              onMarkAsRead={markAsRead}
              onMarkAllAsRead={markAllAsRead}
            />
          )}
          {activeTab === 'badges' && <BadgesTab badges={userData.badges} />}
          {activeTab === 'leaderboard' && (
            <LeaderboardTab
              data={leaderboardData}
              loading={leaderboardLoading}
              error={leaderboardError}
            />
          )}
          {activeTab === 'journey' && <JourneyTab userData={userData} />}
        </div>

        {/* Scrollbar styles - ALWAYS VISIBLE */}
        <style jsx>{`
          .scrollbar-custom {
            overflow-y: scroll !important;
            scrollbar-width: auto !important;
            scrollbar-color: #00d9ff #1e293b !important;
          }

          .scrollbar-custom::-webkit-scrollbar {
            width: 12px !important;
            display: block !important;
          }

          .scrollbar-custom::-webkit-scrollbar-track {
            background: #1e293b !important;
            border-radius: 0px !important;
            display: block !important;
          }

          .scrollbar-custom::-webkit-scrollbar-thumb {
            background: #00d9ff !important;
            border-radius: 6px !important;
            border: 2px solid #1e293b !important;
            min-height: 50px !important;
            display: block !important;
          }

          .scrollbar-custom::-webkit-scrollbar-thumb:hover {
            background: #00ffea !important;
            cursor: pointer !important;
          }

          .scrollbar-custom::-webkit-scrollbar-thumb:active {
            background: #00d9ff !important;
          }

          /* Force scrollbar to always appear */
          .scrollbar-custom::-webkit-scrollbar-button {
            display: block !important;
            height: 0px !important;
          }
        `}</style>
      </div>
    </>
  );
}

// Leaderboard Tab Component
function LeaderboardTab({
  data,
  loading,
  error,
}: {
  data: LeaderboardData | null;
  loading: boolean;
  error: boolean;
}) {
  if (loading || !data) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00d9ff] mx-auto mb-2"></div>
          <p className="text-xs text-[#9ca3af]">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  const { leaderboard, currentUser } = data;

  if (error) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center space-y-2">
          <p className="text-sm font-semibold text-white">Leaderboard unavailable</p>
          <p className="text-xs text-[#9ca3af]">We’ll show rankings once the API is live.</p>
        </div>
      </div>
    );
  }

  const getTierColor = (tier: string) => {
    const colors: Record<string, string> = {
      'Bronze': '#cd7f32',
      'Silver': '#c0c0c0',
      'Gold': '#ffd700',
      'Platinum': '#e5e4e2',
      'Diamond': '#b9f2ff',
      'Sales Master': '#ff6b6b',
      'Sales Predator': '#8b00ff',
    };
    return colors[tier] || '#9ca3af';
  };

  const getAvatarUrl = (username: string) => {
    // Generate DiceBear avatar URL based on username
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(username)}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
  };

  const getBeltBorderColor = (tier: string) => {
    const colors: Record<string, string> = {
      'Bronze': '#cd7f32',
      'Silver': '#c0c0c0',
      'Gold': '#ffd700',
      'Platinum': '#e5e4e2',
      'Diamond': '#b9f2ff',
      'Sales Master': '#ff6b6b',
      'Sales Predator': '#8b00ff',
    };
    return colors[tier] || '#9ca3af';
  };

  return (
    <div className="space-y-4">
      {/* Current User Card */}
      <div className="rounded-xl border-2 border-[#00d9ff]/50 bg-gradient-to-r from-[#00d9ff]/10 to-[#9d4edd]/10 p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={getAvatarUrl(currentUser.username)}
              alt={currentUser.username}
              className="w-10 h-10 rounded-full border-2"
              style={{ borderColor: getBeltBorderColor(currentUser.tier) }}
            />
            <div>
              <p className="text-sm font-bold text-white">{currentUser.username}</p>
              <p className="text-xs" style={{ color: getTierColor(currentUser.tier) }}>
                {currentUser.tier} {currentUser.belt} Belt
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-white">{currentUser.powerLevel.toLocaleString()}</p>
            <p className="text-xs text-[#9ca3af]">power</p>
          </div>
        </div>
      </div>

      {/* Top 3 Podium */}
      {leaderboard.length >= 3 && (
        <div className="grid grid-cols-3 gap-2 mb-4">
          {/* 2nd Place */}
          <div className="flex flex-col items-center pt-8">
            <div className="relative mb-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={getAvatarUrl(leaderboard[1]?.username)}
                alt={leaderboard[1]?.username}
                className="w-12 h-12 rounded-full border-2"
                style={{ borderColor: getBeltBorderColor(leaderboard[1]?.current_tier) }}
              />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-br from-[#c0c0c0] to-[#a8a8a8] flex items-center justify-center text-white text-xs font-bold">
                2
              </div>
            </div>
            <p className="text-xs font-semibold text-white text-center line-clamp-1">{leaderboard[1]?.username}</p>
            <p className="text-xs text-[#9ca3af]">{leaderboard[1]?.power_level.toLocaleString()}</p>
          </div>

          {/* 1st Place */}
          <div className="flex flex-col items-center">
            <div className="relative mb-2">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <div className="text-2xl">👑</div>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={getAvatarUrl(leaderboard[0]?.username)}
                alt={leaderboard[0]?.username}
                className="w-16 h-16 rounded-full border-4"
                style={{ borderColor: getBeltBorderColor(leaderboard[0]?.current_tier) }}
              />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-br from-[#ffd700] to-[#ffaa00] flex items-center justify-center text-white text-sm font-bold">
                1
              </div>
            </div>
            <p className="text-sm font-bold text-white text-center line-clamp-1">{leaderboard[0]?.username}</p>
            <p className="text-xs text-[#9ca3af]">{leaderboard[0]?.power_level.toLocaleString()}</p>
          </div>

          {/* 3rd Place */}
          <div className="flex flex-col items-center pt-12">
            <div className="relative mb-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={getAvatarUrl(leaderboard[2]?.username)}
                alt={leaderboard[2]?.username}
                className="w-10 h-10 rounded-full border-2"
                style={{ borderColor: getBeltBorderColor(leaderboard[2]?.current_tier) }}
              />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-br from-[#cd7f32] to-[#b87333] flex items-center justify-center text-white text-xs font-bold">
                3
              </div>
            </div>
            <p className="text-xs font-semibold text-white text-center line-clamp-1">{leaderboard[2]?.username}</p>
            <p className="text-xs text-[#9ca3af]">{leaderboard[2]?.power_level.toLocaleString()}</p>
          </div>
        </div>
      )}

      {/* Rest of Leaderboard */}
      <div className="space-y-2">
        {leaderboard.slice(3, 20).map((user: LeaderboardUser, index: number) => {
          const rank = index + 4;
          const isCurrentUser = user.username === currentUser.username;

          return (
            <div
              key={rank}
              className={`flex items-center justify-between rounded-lg border p-3 ${
                isCurrentUser
                  ? 'border-[#00d9ff]/50 bg-[#00d9ff]/5'
                  : 'border-white/10 bg-white/[0.02]'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={getAvatarUrl(user.username)}
                    alt={user.username}
                    className="w-8 h-8 rounded-full border-2"
                    style={{ borderColor: getBeltBorderColor(user.current_tier) }}
                  />
                  <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    isCurrentUser ? 'bg-[#00d9ff] text-white' : 'bg-white/10 text-[#9ca3af]'
                  }`}>
                    {rank}
                  </div>
                </div>
                <div>
                  <p className={`text-sm font-semibold ${isCurrentUser ? 'text-[#00d9ff]' : 'text-white'}`}>
                    {user.username}
                  </p>
                  <p className="text-xs" style={{ color: getTierColor(user.current_tier) }}>
                    {user.current_tier} {user.current_belt} Belt
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-white">{user.power_level.toLocaleString()}</p>
                <p className="text-xs text-[#9ca3af]">{user.total_calls} calls</p>
              </div>
            </div>
          );
        })}
      </div>

      {leaderboard.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">🏆</div>
          <p className="text-sm text-[#9ca3af]">No leaderboard data yet</p>
          <p className="text-xs text-[#9ca3af] mt-1">Complete calls to earn power and climb the ranks!</p>
        </div>
      )}
    </div>
  );
}

// Notifications Tab Component
function NotificationsTab({
  notifications,
  loading,
  onMarkAsRead,
  onMarkAllAsRead,
}: {
  notifications: Notification[];
  loading: boolean;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00d9ff] mx-auto mb-2"></div>
          <p className="text-xs text-[#9ca3af]">Loading notifications...</p>
        </div>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-3">🔔</div>
        <p className="text-sm text-[#9ca3af]">No notifications yet</p>
        <p className="text-xs text-[#9ca3af] mt-1">We&apos;ll notify you when you earn badges and level up!</p>
      </div>
    );
  }

  const unreadNotifications = notifications.filter(n => !n.read);

  return (
    <div className="space-y-3">
      {/* Mark all as read button */}
      {unreadNotifications.length > 0 && (
        <button
          onClick={onMarkAllAsRead}
          className="w-full rounded-lg border border-[#00d9ff]/30 bg-[#00d9ff]/10 px-4 py-2 text-xs font-semibold text-[#00d9ff] transition hover:bg-[#00d9ff]/20"
        >
          Mark all as read
        </button>
      )}

      {/* Notifications list */}
      {notifications.map((notification) => {
        const notificationIcons: Record<string, string> = {
          badge_earned: '🏆',
          belt_upgrade: '🥋',
          power_gained: '⚡',
          streak_milestone: '🔥',
          level_up: '📈',
        };

        const icon = notificationIcons[notification.type] || '📬';

        return (
          <div
            key={notification.id}
            className={`rounded-lg border p-4 transition cursor-pointer ${
              notification.read
                ? 'border-white/10 bg-white/[0.02] opacity-60'
                : 'border-[#00d9ff]/30 bg-[#00d9ff]/5'
            }`}
            onClick={() => !notification.read && onMarkAsRead(notification.id)}
          >
            <div className="flex items-start gap-3">
              <div className="text-2xl">{icon}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-1">
                  <h4 className="text-sm font-bold text-white">{notification.title}</h4>
                  {!notification.read && (
                    <div className="h-2 w-2 rounded-full bg-[#00d9ff] flex-shrink-0 ml-2 mt-1" />
                  )}
                </div>
                <p className="text-xs text-[#9ca3af] mb-2">{notification.message}</p>
                <p className="text-xs text-[#9ca3af]">
                  {new Date(notification.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}


// Badges Tab Component
function BadgesTab({ badges }: { badges: Badge[] }) {
  const rarityColors = {
    common: '#9ca3af',
    uncommon: '#10b981',
    rare: '#3b82f6',
    epic: '#a855f7',
    legendary: '#f59e0b'
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      {badges.map((badge) => (
        <div
          key={badge.id}
          className={`rounded-lg border p-3 transition ${
            badge.earned
              ? 'border-white/20 bg-white/[0.05]'
              : 'border-white/5 bg-white/[0.02] opacity-50'
          }`}
        >
          <div className="flex items-start justify-between mb-2">
            <div
              className="h-10 w-10 rounded-lg flex items-center justify-center text-xl"
              style={{ backgroundColor: `${rarityColors[badge.rarity]}20` }}
            >
              🏆
            </div>
            {badge.earned && (
              <div className="rounded-full bg-green-500/20 px-2 py-0.5">
                <span className="text-xs font-bold text-green-400">✓</span>
              </div>
            )}
          </div>
          <h4
            className="text-xs font-bold mb-1"
            style={{ color: rarityColors[badge.rarity] }}
          >
            {badge.name}
          </h4>
          <p className="text-xs text-[#9ca3af] line-clamp-2">
            {badge.description}
          </p>
          {!badge.earned && badge.progress !== undefined && badge.total !== undefined && (
            <div className="mt-2">
              <div className="h-1 w-full rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#00d9ff] to-[#9d4edd]"
                  style={{ width: `${(badge.progress / badge.total) * 100}%` }}
                />
              </div>
              <p className="text-xs text-[#9ca3af] mt-1">
                {badge.progress} / {badge.total}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// Belt Icon SVG Component
interface BeltIconProps {
  tier: string;
  belt: string;
  isCurrent: boolean;
}

function BeltIcon({ tier, belt, isCurrent }: BeltIconProps) {
  // Tier-specific border colors
  const tierBorderColors: Record<string, string> = {
    'Bronze': '#cd7f32',
    'Silver': '#c0c0c0',
    'Gold': '#fbbf24',
    'Platinum': '#22d3ee',
    'Diamond': '#0f4c81',
    'Sales Master': '#9d4edd',
    'Sales Predator': '#ef4444',
  };

  // Belt colors - consistent across all tiers
  const beltColors: Record<string, { main: string; light: string; dark: string }> = {
    'White': { main: '#ffffff', light: '#f8fafc', dark: '#e2e8f0' },
    'Yellow': { main: '#facc15', light: '#fef08a', dark: '#eab308' },
    'Orange': { main: '#fb923c', light: '#fdba74', dark: '#f97316' },
    'Green': { main: '#22c55e', light: '#4ade80', dark: '#16a34a' },
    'Blue': { main: '#3b82f6', light: '#60a5fa', dark: '#2563eb' },
    'Brown': { main: '#92400e', light: '#b45309', dark: '#78350f' },
    'Black': { main: '#0f172a', light: '#1e293b', dark: '#020617' },
  };

  const tierBorderColor = tierBorderColors[tier] || '#334155';
  const beltColor = beltColors[belt] || { main: '#0f172a', light: '#1e293b', dark: '#020617' };
  const gradientId = `belt-gradient-${tier.replace(/\s+/g, '-')}-${belt}`;

  return (
    <svg viewBox="0 0 80 30" className="w-full h-8" xmlns="http://www.w3.org/2000/svg">
      <defs>
        {/* Belt gradient - gives it depth and texture */}
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={beltColor.light} />
          <stop offset="50%" stopColor={beltColor.main} />
          <stop offset="100%" stopColor={beltColor.dark} />
        </linearGradient>
      </defs>

      {/* Tier border - thick outer border in tier color */}
      <rect
        x="3"
        y="3"
        width="74"
        height="24"
        rx="3"
        ry="3"
        fill="none"
        stroke={tierBorderColor}
        strokeWidth={isCurrent ? "4" : "3.5"}
      />

      {/* Belt body with gradient for 3D effect */}
      <rect
        x="8"
        y="8"
        width="64"
        height="14"
        rx="2"
        ry="2"
        fill={`url(#${gradientId})`}
      />

      {/* Belt texture lines for realistic look */}
      <line x1="12" y1="10" x2="12" y2="20" stroke={beltColor.dark} strokeWidth="0.5" opacity="0.3" />
      <line x1="20" y1="10" x2="20" y2="20" stroke={beltColor.dark} strokeWidth="0.5" opacity="0.3" />
      <line x1="28" y1="10" x2="28" y2="20" stroke={beltColor.dark} strokeWidth="0.5" opacity="0.3" />
      <line x1="36" y1="10" x2="36" y2="20" stroke={beltColor.dark} strokeWidth="0.5" opacity="0.3" />
      <line x1="44" y1="10" x2="44" y2="20" stroke={beltColor.dark} strokeWidth="0.5" opacity="0.3" />
      <line x1="52" y1="10" x2="52" y2="20" stroke={beltColor.dark} strokeWidth="0.5" opacity="0.3" />
      <line x1="60" y1="10" x2="60" y2="20" stroke={beltColor.dark} strokeWidth="0.5" opacity="0.3" />
      <line x1="68" y1="10" x2="68" y2="20" stroke={beltColor.dark} strokeWidth="0.5" opacity="0.3" />

      {/* Current belt cyan glow */}
      {isCurrent && (
        <rect
          x="3"
          y="3"
          width="74"
          height="24"
          rx="3"
          ry="3"
          fill="none"
          stroke="#00d9ff"
          strokeWidth="3"
          opacity="0.9"
        />
      )}
    </svg>
  );
}

// Hero's Journey Tab Component
function JourneyTab({ userData }: { userData: UserProfileData }) {
  const allBelts = [
    { tier: 'Bronze', belts: ['White', 'Yellow', 'Orange', 'Green', 'Blue', 'Brown', 'Black'], color: '#cd7f32' },
    { tier: 'Silver', belts: ['White', 'Yellow', 'Orange', 'Green', 'Blue', 'Brown', 'Black'], color: '#c0c0c0' },
    { tier: 'Gold', belts: ['White', 'Yellow', 'Orange', 'Green', 'Blue', 'Brown', 'Black'], color: '#ffd700' },
    { tier: 'Platinum', belts: ['White', 'Yellow', 'Orange', 'Green', 'Blue', 'Brown', 'Black'], color: '#22d3ee' },
    { tier: 'Diamond', belts: ['White', 'Yellow', 'Orange', 'Green', 'Blue', 'Brown', 'Black'], color: '#0f4c81' },
    { tier: 'Sales Master', belts: ['White', 'Yellow', 'Orange', 'Green', 'Blue', 'Brown', 'Black'], color: '#9d4edd' },
    { tier: 'Sales Predator', belts: ['White', 'Yellow', 'Orange', 'Green', 'Blue', 'Brown', 'Black'], color: '#ef4444' }
  ];

  return (
    <div className="space-y-6">
      {allBelts.map((tierGroup) => (
        <div key={tierGroup.tier}>
          <h4 className="text-sm font-bold mb-3" style={{ color: tierGroup.color }}>
            {tierGroup.tier}
          </h4>
          <div className="grid grid-cols-7 gap-2">
            {tierGroup.belts.map((belt) => {
              const isCurrentBelt =
                userData.currentBelt.tier === tierGroup.tier &&
                userData.currentBelt.belt === belt;

              return (
                <div
                  key={`${tierGroup.tier}-${belt}`}
                  className={`aspect-square rounded-lg border flex items-center justify-center p-2 ${
                    isCurrentBelt
                      ? 'border-[#00d9ff] bg-[#00d9ff]/20 ring-2 ring-[#00d9ff]'
                      : 'border-white/10 bg-white/[0.02]'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2 w-full">
                    <BeltIcon tier={tierGroup.tier} belt={belt} isCurrent={isCurrentBelt} />
                    <span className="text-[10px] text-center text-[#e2e8f0] font-semibold">{belt}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// Statistics Tab Component
function StatisticsTab({ statistics }: { statistics: Statistics }) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10b981'; // green
    if (score >= 60) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  };

  return (
    <div className="space-y-4">
      {/* Volume Stats */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-[#9ca3af] uppercase tracking-wide">Volume</h3>
        <StatCard
          label="Total Calls"
          value={statistics.totalCalls.toLocaleString()}
          icon="📞"
        />
        <StatCard
          label="Total Minutes"
          value={statistics.totalMinutes.toLocaleString()}
          icon="⏱️"
        />
      </div>

      {/* Performance Stats with Progress Bars */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-[#9ca3af] uppercase tracking-wide">Performance</h3>

        <StatCardWithProgress
          label="Average Score"
          value={statistics.averageScore}
          max={100}
          icon="⭐"
          color={getScoreColor(statistics.averageScore)}
        />

        <StatCardWithProgress
          label="Objection Success Rate"
          value={statistics.objectionSuccessRate}
          max={100}
          icon="🛡️"
          color={getScoreColor(statistics.objectionSuccessRate)}
        />

        <StatCardWithProgress
          label="Closing Rate"
          value={statistics.closingRate}
          max={100}
          icon="🎯"
          color={getScoreColor(statistics.closingRate)}
        />
      </div>

      {/* Communication Stats */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-[#9ca3af] uppercase tracking-wide">Communication</h3>
        <StatCard
          label="Average WPM"
          value={statistics.averageWPM.toString()}
          icon="💬"
        />
        <StatCard
          label="Filler Word Average"
          value={`${statistics.fillerWordAverage.toFixed(1)}/call`}
          icon="🔇"
        />
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] p-4">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <span className="text-sm text-[#9ca3af]">{label}</span>
      </div>
      <span className="text-lg font-bold text-white">{value}</span>
    </div>
  );
}

function StatCardWithProgress({
  label,
  value,
  max,
  icon,
  color,
}: {
  label: string;
  value: number;
  max: number;
  icon: string;
  color: string;
}) {
  const percentage = (value / max) * 100;

  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{icon}</span>
          <span className="text-sm text-[#9ca3af]">{label}</span>
        </div>
        <span className="text-lg font-bold text-white">{value.toFixed(1)}%</span>
      </div>
      {/* Progress bar */}
      <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  );
}
