import { auth } from '@clerk/nextjs/server';
import { pool } from '@/lib/db';
import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

export async function GET() {
  logger.apiInfo('/user/calls', 'Request received');

  try {
    const { userId } = await auth();

    if (!userId) {
      logger.apiInfo('/user/calls', 'Unauthorized - no userId');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await pool().query(
      'SELECT free_calls_remaining FROM users WHERE clerk_id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      logger.apiInfo('/user/calls', 'User not found in database', { userId });
      return NextResponse.json({ error: 'User not found in database' }, { status: 404 });
    }

    const freeCallsRemaining = result.rows[0].free_calls_remaining;
    logger.apiInfo('/user/calls', 'Success', { userId, freeCallsRemaining });

    return NextResponse.json({
      freeCallsRemaining,
    });
  } catch (error) {
    logger.apiError('/user/calls', error, { route: '/user/calls' });

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
