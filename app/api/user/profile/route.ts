import { auth } from '@clerk/nextjs/server';
import { pool } from '@/lib/db';
import { NextResponse } from 'next/server';

// Belt progression configuration (49 total levels)
const BELT_PROGRESSION = [
  // Bronze
  { tier: 'Bronze', belt: 'White', color: '#cd7f32', min: 0, max: 500 },
  { tier: 'Bronze', belt: 'Yellow', color: '#cd7f32', min: 501, max: 750 },
  { tier: 'Bronze', belt: 'Orange', color: '#cd7f32', min: 751, max: 1000 },
  { tier: 'Bronze', belt: 'Green', color: '#cd7f32', min: 1001, max: 1250 },
  { tier: 'Bronze', belt: 'Blue', color: '#cd7f32', min: 1251, max: 1500 },
  { tier: 'Bronze', belt: 'Brown', color: '#cd7f32', min: 1501, max: 1750 },
  { tier: 'Bronze', belt: 'Black', color: '#cd7f32', min: 1751, max: 3500 },
  // Silver
  { tier: 'Silver', belt: 'White', color: '#c0c0c0', min: 3501, max: 4500 },
  { tier: 'Silver', belt: 'Yellow', color: '#c0c0c0', min: 4501, max: 5500 },
  { tier: 'Silver', belt: 'Orange', color: '#c0c0c0', min: 5501, max: 6500 },
  { tier: 'Silver', belt: 'Green', color: '#c0c0c0', min: 6501, max: 7500 },
  { tier: 'Silver', belt: 'Blue', color: '#c0c0c0', min: 7501, max: 8500 },
  { tier: 'Silver', belt: 'Brown', color: '#c0c0c0', min: 8501, max: 9500 },
  { tier: 'Silver', belt: 'Black', color: '#c0c0c0', min: 9501, max: 10000 },
  // Gold
  { tier: 'Gold', belt: 'White', color: '#ffd700', min: 10001, max: 12500 },
  { tier: 'Gold', belt: 'Yellow', color: '#ffd700', min: 12501, max: 15000 },
  { tier: 'Gold', belt: 'Orange', color: '#ffd700', min: 15001, max: 17500 },
  { tier: 'Gold', belt: 'Green', color: '#ffd700', min: 17501, max: 20000 },
  { tier: 'Gold', belt: 'Blue', color: '#ffd700', min: 20001, max: 22500 },
  { tier: 'Gold', belt: 'Brown', color: '#ffd700', min: 22501, max: 25000 },
  { tier: 'Gold', belt: 'Black', color: '#ffd700', min: 25001, max: 42500 },
  // Platinum
  { tier: 'Platinum', belt: 'White', color: '#e5e4e2', min: 42501, max: 48000 },
  { tier: 'Platinum', belt: 'Yellow', color: '#e5e4e2', min: 48001, max: 53500 },
  { tier: 'Platinum', belt: 'Orange', color: '#e5e4e2', min: 53501, max: 59000 },
  { tier: 'Platinum', belt: 'Green', color: '#e5e4e2', min: 59001, max: 64500 },
  { tier: 'Platinum', belt: 'Blue', color: '#e5e4e2', min: 64501, max: 70000 },
  { tier: 'Platinum', belt: 'Brown', color: '#e5e4e2', min: 70001, max: 75500 },
  { tier: 'Platinum', belt: 'Black', color: '#e5e4e2', min: 75501, max: 84000 },
  // Diamond
  { tier: 'Diamond', belt: 'White', color: '#b9f2ff', min: 84001, max: 93000 },
  { tier: 'Diamond', belt: 'Yellow', color: '#b9f2ff', min: 93001, max: 102000 },
  { tier: 'Diamond', belt: 'Orange', color: '#b9f2ff', min: 102001, max: 111000 },
  { tier: 'Diamond', belt: 'Green', color: '#b9f2ff', min: 111001, max: 120000 },
  { tier: 'Diamond', belt: 'Blue', color: '#b9f2ff', min: 120001, max: 129000 },
  { tier: 'Diamond', belt: 'Brown', color: '#b9f2ff', min: 129001, max: 138000 },
  { tier: 'Diamond', belt: 'Black', color: '#b9f2ff', min: 138001, max: 165000 },
  // Sales Master
  { tier: 'Sales Master', belt: 'White', color: '#ff6b6b', min: 165001, max: 185000 },
  { tier: 'Sales Master', belt: 'Yellow', color: '#ff6b6b', min: 185001, max: 205000 },
  { tier: 'Sales Master', belt: 'Orange', color: '#ff6b6b', min: 205001, max: 225000 },
  { tier: 'Sales Master', belt: 'Green', color: '#ff6b6b', min: 225001, max: 245000 },
  { tier: 'Sales Master', belt: 'Blue', color: '#ff6b6b', min: 245001, max: 265000 },
  { tier: 'Sales Master', belt: 'Brown', color: '#ff6b6b', min: 265001, max: 285000 },
  { tier: 'Sales Master', belt: 'Black', color: '#ff6b6b', min: 285001, max: 335000 },
  // Sales Predator
  { tier: 'Sales Predator', belt: 'White', color: '#8b00ff', min: 335001, max: 375000 },
  { tier: 'Sales Predator', belt: 'Yellow', color: '#8b00ff', min: 375001, max: 415000 },
  { tier: 'Sales Predator', belt: 'Orange', color: '#8b00ff', min: 415001, max: 455000 },
  { tier: 'Sales Predator', belt: 'Green', color: '#8b00ff', min: 455001, max: 495000 },
  { tier: 'Sales Predator', belt: 'Blue', color: '#8b00ff', min: 495001, max: 535000 },
  { tier: 'Sales Predator', belt: 'Brown', color: '#8b00ff', min: 535001, max: 575000 },
  { tier: 'Sales Predator', belt: 'Black', color: '#8b00ff', min: 575001, max: 999999999 },
];

function getBeltForPower(power: number) {
  for (const belt of BELT_PROGRESSION) {
    if (power >= belt.min && power <= belt.max) {
      return belt;
    }
  }
  // Default to first belt if somehow out of range
  return BELT_PROGRESSION[0];
}

function getNextBelt(currentPower: number) {
  const currentIndex = BELT_PROGRESSION.findIndex(
    belt => currentPower >= belt.min && currentPower <= belt.max
  );

  if (currentIndex === -1 || currentIndex === BELT_PROGRESSION.length - 1) {
    // Return same belt if at max
    return BELT_PROGRESSION[BELT_PROGRESSION.length - 1];
  }

  return BELT_PROGRESSION[currentIndex + 1];
}

interface UserForStreak {
  id: string;
  last_login_date: Date | null;
  current_streak: number;
  longest_streak: number;
}

interface BadgeStats {
  totalCalls: number;
  currentStreak: number;
  objectionSuccessRate: number;
  closingRate: number;
  averageWPM: number;
}

// Calculate streak + multiplier based on last login (UTC)
async function updateStreak(dbPool: ReturnType<typeof pool>, user: UserForStreak) {
  const today = new Date();
  const todayUTC = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());

  const lastLogin = user.last_login_date ? new Date(user.last_login_date) : null;
  const lastLoginUTC = lastLogin
    ? Date.UTC(lastLogin.getUTCFullYear(), lastLogin.getUTCMonth(), lastLogin.getUTCDate())
    : null;

  let currentStreak = user.current_streak || 0;
  let longestStreak = user.longest_streak || 0;

  if (!lastLoginUTC) {
    currentStreak = 1;
  } else {
    const diffDays = Math.floor((todayUTC - lastLoginUTC) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) {
      // Already counted today
    } else if (diffDays === 1) {
      currentStreak += 1;
    } else {
      currentStreak = 1;
    }
  }

  if (currentStreak > longestStreak) {
    longestStreak = currentStreak;
  }

  let streakMultiplier = 1.0;
  if (currentStreak >= 365) streakMultiplier = 2.5;
  else if (currentStreak >= 180) streakMultiplier = 1.5;
  else if (currentStreak >= 30) streakMultiplier = 1.17;
  else if (currentStreak >= 14) streakMultiplier = 1.15;

  await dbPool.query(
    `UPDATE users
     SET current_streak = $1,
         longest_streak = $2,
         last_login_date = NOW()::date,
         streak_multiplier = $3
     WHERE id = $4`,
    [currentStreak, longestStreak, streakMultiplier, user.id]
  );

  return { currentStreak, longestStreak, streakMultiplier, lastLogin: new Date(todayUTC) };
}

// Badge definitions (sample - you'll expand this)
const ALL_BADGES = [
  { id: 'badge_5_calls', name: 'First Steps', description: 'Complete 5 total calls', category: 'volume', rarity: 'common' as const, unlockCondition: (stats: BadgeStats) => stats.totalCalls >= 5 },
  { id: 'badge_10_calls', name: 'Building Momentum', description: 'Complete 10 total calls', category: 'volume', rarity: 'common' as const, unlockCondition: (stats: BadgeStats) => stats.totalCalls >= 10 },
  { id: 'badge_25_calls', name: 'Quarter Century', description: 'Complete 25 total calls', category: 'volume', rarity: 'uncommon' as const, unlockCondition: (stats: BadgeStats) => stats.totalCalls >= 25 },
  { id: 'badge_50_calls', name: 'Halfway Master', description: 'Complete 50 total calls', category: 'volume', rarity: 'uncommon' as const, unlockCondition: (stats: BadgeStats) => stats.totalCalls >= 50 },
  { id: 'badge_7_day_streak', name: 'Week Warrior', description: '7 day login streak', category: 'streak', rarity: 'uncommon' as const, unlockCondition: (stats: BadgeStats) => stats.currentStreak >= 7 },
  { id: 'badge_14_day_streak', name: 'Fortnight Fighter', description: '14 day login streak', category: 'streak', rarity: 'rare' as const, unlockCondition: (stats: BadgeStats) => stats.currentStreak >= 14 },
  { id: 'badge_30_day_streak', name: 'Monthly Master', description: '30 day login streak', category: 'streak', rarity: 'rare' as const, unlockCondition: (stats: BadgeStats) => stats.currentStreak >= 30 },
  { id: 'badge_speed_demon', name: 'Speed Demon', description: 'Complete 3 calls in one session', category: 'speed', rarity: 'uncommon' as const, unlockCondition: () => false }, // Track separately
  { id: 'badge_power_hour', name: 'Power Hour', description: 'Complete 10 calls in one day', category: 'speed', rarity: 'epic' as const, unlockCondition: () => false }, // Track separately
  { id: 'badge_objection_70', name: 'Objection Handler', description: '70% objection success rate across 10 calls', category: 'objection', rarity: 'rare' as const, unlockCondition: (stats: BadgeStats) => stats.objectionSuccessRate >= 70 && stats.totalCalls >= 10 },
  { id: 'badge_closing_60', name: 'Deal Closer', description: '60% closing rate across 15 calls', category: 'closing', rarity: 'rare' as const, unlockCondition: (stats: BadgeStats) => stats.closingRate >= 60 && stats.totalCalls >= 15 },
  { id: 'badge_fluency_wpm', name: 'Smooth Talker', description: 'Maintain 120-150 WPM across 10 calls', category: 'fluency', rarity: 'rare' as const, unlockCondition: (stats: BadgeStats) => stats.averageWPM >= 120 && stats.averageWPM <= 150 && stats.totalCalls >= 10 },
];

export async function GET() {
  console.log('[API /user/profile] Request received');

  try {
    const { userId } = await auth();

    if (!userId) {
      console.log('[API /user/profile] No userId found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbPool = pool();

    // Get user data
    const userResult = await dbPool.query(
      `SELECT
        id,
        clerk_id,
        email,
        power_level,
        current_tier,
        current_belt,
        current_streak,
        longest_streak,
        last_login_date,
        streak_multiplier,
        total_calls,
        total_minutes,
        total_badges_earned,
        member_since,
        created_at
      FROM users
      WHERE clerk_id = $1`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = userResult.rows[0];

    // Update streak on profile fetch (counts as a login)
    const streakUpdate = await updateStreak(dbPool, user);

    // Refresh user streak + multiplier values locally
    user.current_streak = streakUpdate.currentStreak;
    user.longest_streak = streakUpdate.longestStreak;
    user.streak_multiplier = streakUpdate.streakMultiplier;
    user.last_login_date = streakUpdate.lastLogin;

    // Get user statistics
    const statsResult = await dbPool.query(
      `SELECT
        average_score,
        objection_success_rate,
        closing_rate,
        average_wpm,
        filler_word_average
      FROM user_statistics
      WHERE user_id = $1`,
      [user.id]
    );

    const stats = statsResult.rows[0] || {
      average_score: 0,
      objection_success_rate: 0,
      closing_rate: 0,
      average_wpm: 0,
      filler_word_average: 0
    };

    // Get user badges
    const badgesResult = await dbPool.query(
      `SELECT badge_id, earned_at, progress, total
      FROM user_badges
      WHERE user_id = $1`,
      [user.id]
    );

    const earnedBadges = new Map(
      badgesResult.rows.map(row => [
        row.badge_id,
        { earnedDate: row.earned_at, progress: row.progress, total: row.total }
      ])
    );

    // Calculate current and next belt
    const currentBelt = getBeltForPower(user.power_level || 0);
    const nextBelt = getNextBelt(user.power_level || 0);

    // Calculate multiplier info
    const currentStreak = user.current_streak || 0;
    let activeMultiplier = 1.0;
    let daysToNext = null;
    let nextMultiplier = null;

    if (currentStreak >= 365) {
      activeMultiplier = 2.5;
    } else if (currentStreak >= 180) {
      activeMultiplier = 1.5;
      daysToNext = 365 - currentStreak;
      nextMultiplier = 150;
    } else if (currentStreak >= 30) {
      activeMultiplier = 1.17;
      daysToNext = 180 - currentStreak;
      nextMultiplier = 50;
    } else if (currentStreak >= 14) {
      activeMultiplier = 1.15;
      daysToNext = 30 - currentStreak;
      nextMultiplier = 17;
    } else if (currentStreak > 0) {
      daysToNext = 14 - currentStreak;
      nextMultiplier = 15;
    }

    // Build badges array with earned status
    const badges = ALL_BADGES.map(badge => {
      const earnedData = earnedBadges.get(badge.id);
      const isEarned = !!earnedData?.earnedDate;

      // Check if badge should be earned based on current stats
      const shouldBeEarned = badge.unlockCondition({
        totalCalls: user.total_calls,
        currentStreak,
        ...stats
      });

      return {
        id: badge.id,
        name: badge.name,
        description: badge.description,
        category: badge.category,
        rarity: badge.rarity,
        earned: isEarned,
        earnedDate: earnedData?.earnedDate,
        progress: shouldBeEarned ? undefined : (earnedData?.progress || 0),
        total: shouldBeEarned ? undefined : (earnedData?.total || 100)
      };
    });

    // Build response - safely extract username from email
    const emailParts = user.email?.split('@') || [];
    const username = emailParts[0] || 'User';

    const profileData = {
      username,
      avatar: '',
      email: user.email,
      memberSince: user.member_since || 'January 2025',
      currentPower: user.power_level || 0,
      currentBelt: {
        tier: currentBelt.tier,
        belt: currentBelt.belt,
        color: currentBelt.color,
        minPower: currentBelt.min,
        maxPower: currentBelt.max
      },
      nextBelt: {
        tier: nextBelt.tier,
        belt: nextBelt.belt,
        color: nextBelt.color,
        minPower: nextBelt.min,
        maxPower: nextBelt.max
      },
      streak: {
        currentStreak,
        longestStreak: user.longest_streak || 0,
        lastLogin: user.last_login_date?.toISOString() || new Date().toISOString()
      },
      multiplier: {
        active: activeMultiplier > 1.0,
        percentage: Math.round((activeMultiplier - 1) * 100),
        daysToNext,
        nextMultiplier
      },
      badges,
      statistics: {
        totalCalls: user.total_calls || 0,
        totalMinutes: user.total_minutes || 0,
        averageScore: parseFloat(stats.average_score) || 0,
        objectionSuccessRate: parseFloat(stats.objection_success_rate) || 0,
        closingRate: parseFloat(stats.closing_rate) || 0,
        averageWPM: parseInt(stats.average_wpm) || 0,
        fillerWordAverage: parseFloat(stats.filler_word_average) || 0
      }
    };

    return NextResponse.json(profileData);
  } catch (error) {
    console.error('[API /user/profile] ERROR:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
