import { auth } from '@clerk/nextjs/server';
import { pool } from '@/lib/db';
import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

export async function GET() {
  logger.api('/privacy', 'GET request received');

  try {
    const { userId } = await auth();

    if (!userId) {
      logger.api('/privacy', 'Unauthorized - no userId');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbPool = pool();

    // Get user privacy settings
    const result = await dbPool.query(
      `SELECT
        profile_visibility,
        show_stats_publicly,
        show_on_leaderboard
      FROM users
      WHERE clerk_id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = result.rows[0];

    // Defensive handling: validate and sanitize profile_visibility
    let profileVisibility = user.profile_visibility || 'public';
    if (profileVisibility !== 'public' && profileVisibility !== 'private') {
      logger.warn('[API /privacy] Invalid profile_visibility value', { 
        value: profileVisibility, 
        userId 
      });
      profileVisibility = 'public';
    }

    // Return privacy settings with defaults if NULL
    const privacySettings = {
      profile_visibility: profileVisibility,
      show_stats_publicly: user.show_stats_publicly !== null ? user.show_stats_publicly : true,
      show_on_leaderboard: user.show_on_leaderboard !== null ? user.show_on_leaderboard : true
    };

    logger.api('/privacy', 'Settings retrieved successfully', { userId });
    return NextResponse.json(privacySettings);
  } catch (error) {
    logger.apiError('/privacy', error, { route: '/privacy', method: 'GET' });
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

export async function PATCH(request: Request) {
  logger.api('/privacy', 'PATCH request received');

  try {
    const { userId } = await auth();

    if (!userId) {
      logger.api('/privacy', 'Unauthorized - no userId');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { profile_visibility, show_stats_publicly, show_on_leaderboard } = body;

    // Validate profile_visibility if provided
    if (profile_visibility !== undefined &&
        profile_visibility !== 'public' &&
        profile_visibility !== 'private') {
      return NextResponse.json(
        { error: 'Invalid profile_visibility. Must be "public" or "private"' },
        { status: 400 }
      );
    }

    // Validate boolean fields if provided
    if (show_stats_publicly !== undefined && typeof show_stats_publicly !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid show_stats_publicly. Must be a boolean' },
        { status: 400 }
      );
    }

    if (show_on_leaderboard !== undefined && typeof show_on_leaderboard !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid show_on_leaderboard. Must be a boolean' },
        { status: 400 }
      );
    }

    const dbPool = pool();

    // Build dynamic update query for only provided fields
    const updates: string[] = [];
    const values: (string | boolean)[] = [];
    let paramIndex = 1;

    if (profile_visibility !== undefined) {
      updates.push(`profile_visibility = $${paramIndex++}`);
      values.push(profile_visibility);
    }

    if (show_stats_publicly !== undefined) {
      updates.push(`show_stats_publicly = $${paramIndex++}`);
      values.push(show_stats_publicly);
    }

    if (show_on_leaderboard !== undefined) {
      updates.push(`show_on_leaderboard = $${paramIndex++}`);
      values.push(show_on_leaderboard);
    }

    // Always update privacy_updated_at when any setting changes
    if (updates.length > 0) {
      updates.push(`privacy_updated_at = NOW()`);
      values.push(userId);

      const query = `
        UPDATE users
        SET ${updates.join(', ')}
        WHERE clerk_id = $${paramIndex}
        RETURNING profile_visibility, show_stats_publicly, show_on_leaderboard
      `;

      const result = await dbPool.query(query, values);

      if (result.rows.length === 0) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      logger.api('/privacy', 'Settings updated successfully', { userId });
      return NextResponse.json(result.rows[0]);
    }

    // If no fields to update, return current settings
    const result = await dbPool.query(
      `SELECT
        profile_visibility,
        show_stats_publicly,
        show_on_leaderboard
      FROM users
      WHERE clerk_id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    logger.apiError('/privacy', error, { route: '/privacy', method: 'PATCH' });
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
