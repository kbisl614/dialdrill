import { auth } from '@clerk/nextjs/server';
import { pool } from '@/lib/db';
import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { RING_COLORS } from '@/lib/profile-ring';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  logger.api('/profile/[id]', 'GET request received');

  try {
    const { userId } = await auth();

    if (!userId) {
      logger.api('/profile/[id]', 'Unauthorized - no userId');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const dbPool = pool();

    // Get the requesting user's internal ID
    const requesterResult = await dbPool.query(
      `SELECT id FROM users WHERE clerk_id = $1`,
      [userId]
    );

    if (requesterResult.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const requesterId = requesterResult.rows[0].id;

    // Get the profile user's data
    let profileResult;
    try {
      profileResult = await dbPool.query(
        `SELECT
          id,
          clerk_id,
          email,
          power_level,
          current_tier,
          current_belt,
          current_streak,
          longest_streak,
          total_calls,
          total_minutes,
          total_badges_earned,
          member_since,
          profile_visibility,
          show_stats_publicly,
          profile_ring_color
        FROM users
        WHERE id = $1`,
        [id]
      );
    } catch (error: any) {
      // Backward-compatible fallback if migration hasn't run yet
      if (error?.code === '42703') {
        profileResult = await dbPool.query(
          `SELECT
            id,
            clerk_id,
            email,
            power_level,
            current_tier,
            current_belt,
            current_streak,
            longest_streak,
            total_calls,
            total_minutes,
            total_badges_earned,
            member_since,
            profile_visibility,
            show_stats_publicly
          FROM users
          WHERE id = $1`,
          [id]
        );
      } else {
        throw error;
      }
    }

    if (profileResult.rows.length === 0) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const profileUser = profileResult.rows[0];
    const isOwner = profileUser.id === requesterId;

    // Defensive handling: validate and sanitize profile_visibility
    let profileVisibility = profileUser.profile_visibility || 'public';
    if (profileVisibility !== 'public' && profileVisibility !== 'private') {
      logger.warn('[API /profile/[id]] Invalid profile_visibility value', { 
        value: profileVisibility, 
        profileId: id 
      });
      profileVisibility = 'public';
    }

    // Privacy check: if profile is private and requester is not owner, return 404
    if (profileVisibility === 'private' && !isOwner) {
      logger.api('/profile/[id]', 'Private profile access denied', { profileId: id, userId });
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Determine if stats should be shown
    const showStatsPublicly = profileUser.show_stats_publicly !== null ? profileUser.show_stats_publicly : true;
    const shouldShowStats = isOwner || showStatsPublicly;

    // Get user badges
    const badgesResult = await dbPool.query(
      `SELECT badge_id, earned_at, progress, total
       FROM user_badges
       WHERE user_id = $1`,
      [profileUser.id]
    );

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
      [profileUser.id]
    );

    const stats = statsResult.rows[0] || {
      average_score: 0,
      objection_success_rate: 0,
      closing_rate: 0,
      average_wpm: 0,
      filler_word_average: 0
    };

    const allowedRingColors = new Set(RING_COLORS.map((color) => color.key));
    const profileRingColor = allowedRingColors.has(profileUser.profile_ring_color)
      ? profileUser.profile_ring_color
      : null;

    // Build response - always include belt, tier, badges, power_level
    const profileData: {
      username: string;
      email?: string;
      memberSince: string;
      profileRingColor?: string | null;
      currentPower: number;
      currentBelt: {
        tier: string;
        belt: string;
      };
      streak: {
        currentStreak: number;
        longestStreak: number;
      };
      badges: Array<{
        badge_id: string;
        earned_at: string;
        progress: number;
        total: number;
      }>;
      // Stats - conditionally included
      totalCalls?: number;
      totalMinutes?: number;
      statistics?: {
        averageScore: number;
        objectionSuccessRate: number;
        closingRate: number;
        averageWPM: number;
        fillerWordAverage: number;
      };
    } = {
      username: profileUser.email.split('@')[0] || 'User',
      memberSince: profileUser.member_since || 'January 2025',
      profileRingColor,
      currentPower: profileUser.power_level || 0,
      currentBelt: {
        tier: profileUser.current_tier || 'Bronze',
        belt: profileUser.current_belt || 'White',
      },
      streak: {
        currentStreak: profileUser.current_streak || 0,
        longestStreak: profileUser.longest_streak || 0,
      },
      badges: badgesResult.rows,
    };

    // Include email only if owner
    if (isOwner) {
      profileData.email = profileUser.email;
    }

    // Conditionally include stats
    if (shouldShowStats) {
      profileData.totalCalls = profileUser.total_calls || 0;
      profileData.totalMinutes = profileUser.total_minutes || 0;
      profileData.statistics = {
        averageScore: parseFloat(stats.average_score) || 0,
        objectionSuccessRate: parseFloat(stats.objection_success_rate) || 0,
        closingRate: parseFloat(stats.closing_rate) || 0,
        averageWPM: parseInt(stats.average_wpm) || 0,
        fillerWordAverage: parseFloat(stats.filler_word_average) || 0,
      };
    }

    logger.api('/profile/[id]', 'Profile retrieved successfully', { profileId: id, userId });
    return NextResponse.json(profileData);
  } catch (error) {
    logger.apiError('/profile/[id]', error, { route: '/profile/[id]', method: 'GET' });
    return NextResponse.json(
      { 
        error: 'Internal server error',
        ...(process.env.NODE_ENV !== 'production' && {
          details: error instanceof Error ? error.message : String(error)
        })
      },
      { status: 500 }
    );
  }
}
