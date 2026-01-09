import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

// GET /api/leaderboard - Get top users by power level
export async function GET(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');

    const dbPool = pool();

    // Get user's internal ID and rank
    const userResult = await dbPool.query(
      `SELECT id,
              COALESCE(username, SPLIT_PART(email, '@', 1)) as username,
              power_level,
              current_tier,
              current_belt,
              total_calls,
              current_streak
       FROM users
       WHERE clerk_id = $1`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const currentUser = userResult.rows[0];

    // Get top users by power level
    const leaderboardResult = await dbPool.query(
      `SELECT
        COALESCE(username, SPLIT_PART(email, '@', 1)) as username,
        power_level,
        current_tier,
        current_belt,
        total_calls,
        total_minutes,
        current_streak,
        total_badges_earned,
        ROW_NUMBER() OVER (ORDER BY power_level DESC) as rank
       FROM users
       WHERE power_level > 0
       ORDER BY power_level DESC
       LIMIT $1`,
      [limit]
    );

    // Get current user's rank
    const userRankResult = await dbPool.query(
      `SELECT COUNT(*) + 1 as rank
       FROM users
       WHERE power_level > $1`,
      [currentUser.power_level]
    );

    const userRank = parseInt(userRankResult.rows[0].rank);

    // Get user's position in context (users around them)
    const contextResult = await dbPool.query(
      `WITH ranked_users AS (
        SELECT
          COALESCE(username, SPLIT_PART(email, '@', 1)) as username,
          power_level,
          current_tier,
          current_belt,
          total_calls,
          current_streak,
          ROW_NUMBER() OVER (ORDER BY power_level DESC) as rank
        FROM users
        WHERE power_level > 0
      )
      SELECT * FROM ranked_users
      WHERE rank BETWEEN $1 - 2 AND $1 + 2
      ORDER BY rank`,
      [userRank]
    );

    return NextResponse.json({
      leaderboard: leaderboardResult.rows,
      currentUser: {
        username: currentUser.username,
        powerLevel: currentUser.power_level,
        tier: currentUser.current_tier,
        belt: currentUser.current_belt,
        totalCalls: currentUser.total_calls,
        currentStreak: currentUser.current_streak,
        rank: userRank,
      },
      userContext: contextResult.rows,
    });
  } catch (error) {
    console.error('[API /leaderboard] ERROR:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
