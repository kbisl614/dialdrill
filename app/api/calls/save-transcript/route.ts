import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { scoreCall, isCallTooShort, generateShortCallScore } from '@/lib/scoring-engine';
import { parseTranscript } from '@/lib/transcript-parser';
import { matchAndSaveObjections } from '@/lib/objection-matcher';

interface TranscriptEntry {
  role: 'user' | 'agent';
  text: string;
  timestamp?: string | null;
}

type RawTranscriptEntry = {
  role?: unknown;
  text?: unknown;
  timestamp?: unknown;
};

function normalizeTranscriptEntry(item: RawTranscriptEntry): TranscriptEntry {
  const role = item.role === 'agent' ? 'agent' : 'user';
  const text = typeof item.text === 'string' ? item.text : '';
  let timestamp: string | null = null;

  if (typeof item.timestamp === 'string') {
    timestamp = item.timestamp;
  } else if (
    item.timestamp &&
    typeof item.timestamp === 'object' &&
    'toISOString' in item.timestamp &&
    typeof (item.timestamp as { toISOString: () => string }).toISOString === 'function'
  ) {
    timestamp = (item.timestamp as { toISOString: () => string }).toISOString();
  }

  return { role, text, timestamp };
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { callLogId, transcript, durationSeconds } = body ?? {};

    if (!callLogId || typeof callLogId !== 'string') {
      return NextResponse.json({ error: 'callLogId is required' }, { status: 400 });
    }

    if (!Array.isArray(transcript)) {
      return NextResponse.json({ error: 'transcript must be an array' }, { status: 400 });
    }

    const normalizedTranscript: TranscriptEntry[] = (transcript as RawTranscriptEntry[]).map((item) =>
      normalizeTranscriptEntry(item)
    );

    const parsedDuration =
      typeof durationSeconds === 'number' && Number.isFinite(durationSeconds)
        ? Math.max(0, Math.round(durationSeconds))
        : null;

    const result = await pool().query(
      `UPDATE call_logs
       SET transcript = $1,
           duration_seconds = $2
       WHERE id = $3
         AND user_id = (SELECT id FROM users WHERE clerk_id = $4)
       RETURNING id`,
      [JSON.stringify(normalizedTranscript), parsedDuration, callLogId, userId]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Call log not found' }, { status: 404 });
    }

    // Automatically score the call after saving transcript
    try {
      const duration = parsedDuration || 0;
      const score = isCallTooShort(duration, normalizedTranscript)
        ? generateShortCallScore(callLogId, normalizedTranscript, duration)
        : scoreCall(callLogId, normalizedTranscript, duration);

      // Save score to database (upsert)
      await pool().query(
        `INSERT INTO call_scores (call_log_id, overall_score, category_scores, metadata)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (call_log_id)
         DO UPDATE SET
           overall_score = EXCLUDED.overall_score,
           category_scores = EXCLUDED.category_scores,
           metadata = EXCLUDED.metadata,
           created_at = NOW()`,
        [
          score.callLogId,
          score.overallScore,
          JSON.stringify(score.categoryScores),
          JSON.stringify(score.metadata)
        ]
      );

      // Match and save triggered objections
      const signals = parseTranscript(normalizedTranscript);
      await matchAndSaveObjections(callLogId, signals);

      // ========== GAMIFICATION: Award Power & Update Stats ==========
      try {
        const durationMinutes = Math.floor((parsedDuration || 0) / 60);

        // Get user data with streak multiplier
        const userResult = await pool().query(
          `SELECT id, streak_multiplier, total_calls, current_streak, longest_streak, last_login_date, power_level, current_tier, current_belt
           FROM users
           WHERE clerk_id = $1`,
          [userId]
        );

        if (userResult.rows.length > 0) {
          const user = userResult.rows[0];

          // Update streak since a call also counts as activity for the day
          const streakUpdate = await updateStreak(pool(), user);
          const streakMultiplier = streakUpdate.streakMultiplier || 1.0;
          user.current_streak = streakUpdate.currentStreak;
          user.streak_multiplier = streakUpdate.streakMultiplier;

          // Base power: 5 per call + 2 per minute
          const basePower = 5 + (durationMinutes * 2);
          const powerGained = Math.round(basePower * streakMultiplier);

          // Update user stats
          await pool().query(
            `UPDATE users
             SET total_calls = total_calls + 1,
                 total_minutes = total_minutes + $1,
                 power_level = power_level + $2
             WHERE id = $3`,
            [durationMinutes, powerGained, user.id]
          );

          console.log(`[Gamification] User earned ${powerGained} power (${basePower} base × ${streakMultiplier} multiplier)`);

          // Check and auto-upgrade belt if needed
          const newPowerLevel = user.power_level + powerGained;
          await checkAndUpgradeBelt(user.id, newPowerLevel);

          // Check and award badges
          await checkAndAwardBadges(user.id, userId);
        }
      } catch (gamificationError) {
        // Log but don't fail the request if gamification fails
        console.error('[API /calls/save-transcript] Gamification failed:', gamificationError);
      }
    } catch (scoreError) {
      // Log but don't fail the request if scoring fails
      console.error('[API /calls/save-transcript] Scoring failed:', scoreError);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API /calls/save-transcript] ERROR:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// ========== GAMIFICATION HELPER FUNCTIONS ==========

// Belt progression (same as in profile route)
const BELT_PROGRESSION = [
  { tier: 'Bronze', belt: 'White', min: 0, max: 500 },
  { tier: 'Bronze', belt: 'Yellow', min: 501, max: 750 },
  { tier: 'Bronze', belt: 'Orange', min: 751, max: 1000 },
  { tier: 'Bronze', belt: 'Green', min: 1001, max: 1250 },
  { tier: 'Bronze', belt: 'Blue', min: 1251, max: 1500 },
  { tier: 'Bronze', belt: 'Brown', min: 1501, max: 1750 },
  { tier: 'Bronze', belt: 'Black', min: 1751, max: 3500 },
  { tier: 'Silver', belt: 'White', min: 3501, max: 4500 },
  { tier: 'Silver', belt: 'Yellow', min: 4501, max: 5500 },
  { tier: 'Silver', belt: 'Orange', min: 5501, max: 6500 },
  { tier: 'Silver', belt: 'Green', min: 6501, max: 7500 },
  { tier: 'Silver', belt: 'Blue', min: 7501, max: 8500 },
  { tier: 'Silver', belt: 'Brown', min: 8501, max: 9500 },
  { tier: 'Silver', belt: 'Black', min: 9501, max: 10000 },
  { tier: 'Gold', belt: 'White', min: 10001, max: 12500 },
  { tier: 'Gold', belt: 'Yellow', min: 12501, max: 15000 },
  { tier: 'Gold', belt: 'Orange', min: 15001, max: 17500 },
  { tier: 'Gold', belt: 'Green', min: 17501, max: 20000 },
  { tier: 'Gold', belt: 'Blue', min: 20001, max: 22500 },
  { tier: 'Gold', belt: 'Brown', min: 22501, max: 25000 },
  { tier: 'Gold', belt: 'Black', min: 25001, max: 42500 },
  { tier: 'Platinum', belt: 'White', min: 42501, max: 48000 },
  { tier: 'Platinum', belt: 'Yellow', min: 48001, max: 53500 },
  { tier: 'Platinum', belt: 'Orange', min: 53501, max: 59000 },
  { tier: 'Platinum', belt: 'Green', min: 59001, max: 64500 },
  { tier: 'Platinum', belt: 'Blue', min: 64501, max: 70000 },
  { tier: 'Platinum', belt: 'Brown', min: 70001, max: 75500 },
  { tier: 'Platinum', belt: 'Black', min: 75501, max: 84000 },
  { tier: 'Diamond', belt: 'White', min: 84001, max: 93000 },
  { tier: 'Diamond', belt: 'Yellow', min: 93001, max: 102000 },
  { tier: 'Diamond', belt: 'Orange', min: 102001, max: 111000 },
  { tier: 'Diamond', belt: 'Green', min: 111001, max: 120000 },
  { tier: 'Diamond', belt: 'Blue', min: 120001, max: 129000 },
  { tier: 'Diamond', belt: 'Brown', min: 129001, max: 138000 },
  { tier: 'Diamond', belt: 'Black', min: 138001, max: 165000 },
  { tier: 'Sales Master', belt: 'White', min: 165001, max: 185000 },
  { tier: 'Sales Master', belt: 'Yellow', min: 185001, max: 205000 },
  { tier: 'Sales Master', belt: 'Orange', min: 205001, max: 225000 },
  { tier: 'Sales Master', belt: 'Green', min: 225001, max: 245000 },
  { tier: 'Sales Master', belt: 'Blue', min: 245001, max: 265000 },
  { tier: 'Sales Master', belt: 'Brown', min: 265001, max: 285000 },
  { tier: 'Sales Master', belt: 'Black', min: 285001, max: 335000 },
  { tier: 'Sales Predator', belt: 'White', min: 335001, max: 375000 },
  { tier: 'Sales Predator', belt: 'Yellow', min: 375001, max: 415000 },
  { tier: 'Sales Predator', belt: 'Orange', min: 415001, max: 455000 },
  { tier: 'Sales Predator', belt: 'Green', min: 455001, max: 495000 },
  { tier: 'Sales Predator', belt: 'Blue', min: 495001, max: 535000 },
  { tier: 'Sales Predator', belt: 'Brown', min: 535001, max: 575000 },
  { tier: 'Sales Predator', belt: 'Black', min: 575001, max: 999999999 },
];

// Update streak + multiplier when a call is logged (counts as activity for the day)
async function updateStreak(dbPool: ReturnType<typeof pool>, user: any) {
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

  return { currentStreak, longestStreak, streakMultiplier };
}

async function checkAndUpgradeBelt(userId: string, powerLevel: number) {
  // Find correct belt for power level
  const belt = BELT_PROGRESSION.find(b => powerLevel >= b.min && powerLevel <= b.max);

  if (belt) {
    await pool().query(
      `UPDATE users
       SET current_tier = $1, current_belt = $2
       WHERE id = $3`,
      [belt.tier, belt.belt, userId]
    );
    console.log(`[Gamification] Belt updated to ${belt.tier} ${belt.belt} (${powerLevel} power)`);
  }
}

// Badge definitions (same as in profile route)
const ALL_BADGES = [
  { id: 'badge_5_calls', requirement: 5, field: 'total_calls' },
  { id: 'badge_10_calls', requirement: 10, field: 'total_calls' },
  { id: 'badge_25_calls', requirement: 25, field: 'total_calls' },
  { id: 'badge_50_calls', requirement: 50, field: 'total_calls' },
  { id: 'badge_7_day_streak', requirement: 7, field: 'current_streak' },
  { id: 'badge_14_day_streak', requirement: 14, field: 'current_streak' },
  { id: 'badge_30_day_streak', requirement: 30, field: 'current_streak' },
];

async function checkAndAwardBadges(internalUserId: string, clerkUserId: string) {
  // Get current user stats
  const userResult = await pool().query(
    `SELECT total_calls, current_streak FROM users WHERE id = $1`,
    [internalUserId]
  );

  if (userResult.rows.length === 0) return;

  const user = userResult.rows[0];

  // Check each badge
  for (const badge of ALL_BADGES) {
    const currentValue = user[badge.field] || 0;

    // Check if badge should be earned
    if (currentValue >= badge.requirement) {
      // Check if badge is already earned
      const existingBadge = await pool().query(
        `SELECT id FROM user_badges WHERE user_id = $1 AND badge_id = $2`,
        [internalUserId, badge.id]
      );

      // Award badge if not already earned
      if (existingBadge.rows.length === 0) {
        await pool().query(
          `INSERT INTO user_badges (user_id, badge_id, earned_at, progress, total)
           VALUES ($1, $2, NOW(), $3, $3)
           ON CONFLICT (user_id, badge_id) DO NOTHING`,
          [internalUserId, badge.id, badge.requirement]
        );

        // Increment total badges earned
        await pool().query(
          `UPDATE users SET total_badges_earned = total_badges_earned + 1 WHERE id = $1`,
          [internalUserId]
        );

        console.log(`[Gamification] Badge awarded: ${badge.id}`);
      }
    }
  }
}
