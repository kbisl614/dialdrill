// Mock data for Profile Dropdown Modal

export const mockUserData = {
  username: 'SalesWarrior',
  avatar: '', // Will use initial
  email: 'user@dialdrill.com',
  memberSince: 'January 2025',
  currentPower: 1850,
  currentBelt: {
    tier: 'Bronze',
    belt: 'Black',
    color: '#cd7f32',
    minPower: 1751,
    maxPower: 3500
  },
  nextBelt: {
    tier: 'Silver',
    belt: 'White',
    color: '#c0c0c0',
    minPower: 3501,
    maxPower: 4500
  },
  streak: {
    currentStreak: 14,
    longestStreak: 21,
    lastLogin: '2025-01-07'
  },
  multiplier: {
    active: true,
    percentage: 15,
    daysToNext: 16,
    nextMultiplier: 17
  },
  badges: [
    {
      id: 'badge_5_calls',
      name: 'First Steps',
      description: 'Complete 5 total calls',
      category: 'volume',
      rarity: 'common' as const,
      earned: true,
      earnedDate: '2025-01-05'
    },
    {
      id: 'badge_10_calls',
      name: 'Building Momentum',
      description: 'Complete 10 total calls',
      category: 'volume',
      rarity: 'common' as const,
      earned: true,
      earnedDate: '2025-01-06'
    },
    {
      id: 'badge_25_calls',
      name: 'Quarter Century',
      description: 'Complete 25 total calls',
      category: 'volume',
      rarity: 'uncommon' as const,
      earned: false,
      progress: 18,
      total: 25
    },
    {
      id: 'badge_50_calls',
      name: 'Halfway Master',
      description: 'Complete 50 total calls',
      category: 'volume',
      rarity: 'uncommon' as const,
      earned: false,
      progress: 18,
      total: 50
    },
    {
      id: 'badge_7_day_streak',
      name: 'Week Warrior',
      description: '7 day login streak',
      category: 'streak',
      rarity: 'uncommon' as const,
      earned: true,
      earnedDate: '2025-01-06'
    },
    {
      id: 'badge_14_day_streak',
      name: 'Fortnight Fighter',
      description: '14 day login streak',
      category: 'streak',
      rarity: 'rare' as const,
      earned: true,
      earnedDate: '2025-01-07'
    },
    {
      id: 'badge_30_day_streak',
      name: 'Monthly Master',
      description: '30 day login streak',
      category: 'streak',
      rarity: 'rare' as const,
      earned: false,
      progress: 14,
      total: 30
    },
    {
      id: 'badge_objection_70',
      name: 'Objection Handler',
      description: '70% objection success rate across 10 calls',
      category: 'objection',
      rarity: 'rare' as const,
      earned: false,
      progress: 6,
      total: 10
    },
    {
      id: 'badge_closing_60',
      name: 'Deal Closer',
      description: '60% closing rate across 15 calls',
      category: 'closing',
      rarity: 'rare' as const,
      earned: false,
      progress: 3,
      total: 15
    },
    {
      id: 'badge_speed_demon',
      name: 'Speed Demon',
      description: 'Complete 3 calls in one session',
      category: 'speed',
      rarity: 'uncommon' as const,
      earned: true,
      earnedDate: '2025-01-05'
    },
    {
      id: 'badge_power_hour',
      name: 'Power Hour',
      description: 'Complete 10 calls in one day',
      category: 'speed',
      rarity: 'epic' as const,
      earned: false,
      progress: 8,
      total: 10
    },
    {
      id: 'badge_fluency_wpm',
      name: 'Smooth Talker',
      description: 'Maintain 120-150 WPM across 10 calls',
      category: 'fluency',
      rarity: 'rare' as const,
      earned: false,
      progress: 4,
      total: 10
    }
  ],
  statistics: {
    totalCalls: 18,
    totalMinutes: 87,
    averageScore: 72.5,
    objectionSuccessRate: 68.3,
    closingRate: 55.6,
    averageWPM: 142,
    fillerWordAverage: 7.2
  }
};
