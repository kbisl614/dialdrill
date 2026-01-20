import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { logger } from '@/lib/logger';

// GET /api/notifications - Get user's notifications
export async function GET(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      logger.api('/notifications', 'Unauthorized - no userId', { method: 'GET' });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50');

    const dbPool = pool();

    // Get user's internal ID
    const userResult = await dbPool.query(
      `SELECT id FROM users WHERE clerk_id = $1`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const internalUserId = userResult.rows[0].id;

    // Get notifications
    const query = unreadOnly
      ? `SELECT * FROM user_notifications
         WHERE user_id = $1 AND read = FALSE
         ORDER BY created_at DESC
         LIMIT $2`
      : `SELECT * FROM user_notifications
         WHERE user_id = $1
         ORDER BY created_at DESC
         LIMIT $2`;

    const notifications = await dbPool.query(query, [internalUserId, limit]);

    // Get unread count
    const unreadCountResult = await dbPool.query(
      `SELECT COUNT(*) as count FROM user_notifications
       WHERE user_id = $1 AND read = FALSE`,
      [internalUserId]
    );

    return NextResponse.json({
      notifications: notifications.rows,
      unreadCount: parseInt(unreadCountResult.rows[0].count),
    });
  } catch (error) {
    logger.apiError('/notifications', error, { route: '/notifications', method: 'GET' });
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

// POST /api/notifications/mark-read - Mark notification(s) as read
export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      logger.api('/notifications', 'Unauthorized - no userId', { method: 'POST' });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { notificationId, markAllRead } = body;

    const dbPool = pool();

    // Get user's internal ID
    const userResult = await dbPool.query(
      `SELECT id FROM users WHERE clerk_id = $1`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const internalUserId = userResult.rows[0].id;

    if (markAllRead) {
      // Mark all notifications as read
      await dbPool.query(
        `UPDATE user_notifications
         SET read = TRUE, read_at = NOW()
         WHERE user_id = $1 AND read = FALSE`,
        [internalUserId]
      );

      return NextResponse.json({ success: true, markedAll: true });
    } else if (notificationId) {
      // Mark single notification as read
      await dbPool.query(
        `UPDATE user_notifications
         SET read = TRUE, read_at = NOW()
         WHERE id = $1 AND user_id = $2`,
        [notificationId, internalUserId]
      );

      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: 'Either notificationId or markAllRead is required' },
        { status: 400 }
      );
    }
  } catch (error) {
    logger.apiError('/notifications', error, { route: '/notifications', method: 'POST' });
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
