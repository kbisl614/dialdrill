/**
 * API Route: Get voice analytics for a specific call
 * GET /api/analytics/voice/[callLogId]
 */

import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { getVoiceAnalytics } from '@/lib/voice-analytics';
import { logger } from '@/lib/logger';

export async function GET(request: Request, { params }: { params: Promise<{ callLogId: string }> }) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { callLogId } = await params;

    if (!callLogId) {
      return NextResponse.json({ error: 'callLogId is required' }, { status: 400 });
    }

    // Verify the call belongs to the user
    const callResult = await pool().query(
      `SELECT cl.id
       FROM call_logs cl
       JOIN users u ON cl.user_id = u.id
       WHERE cl.id = $1 AND u.clerk_id = $2`,
      [callLogId, userId]
    );

    if (callResult.rows.length === 0) {
      return NextResponse.json({ error: 'Call not found' }, { status: 404 });
    }

    // Get voice analytics
    const analytics = await getVoiceAnalytics(pool(), callLogId);

    if (!analytics) {
      return NextResponse.json(
        {
          error: 'Voice analytics not available',
          message: 'Voice analytics have not been generated for this call yet.',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      analytics,
    });
  } catch (error) {
    logger.apiError('/analytics/voice/[callLogId]', error, { route: '/analytics/voice/[callLogId]' });
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
