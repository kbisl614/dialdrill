/**
 * API Route: Get AI coaching insights for a specific call
 * GET /api/coaching/[callLogId]
 */

import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { getCoachingAnalysis } from '@/lib/ai-coach';
import { logger } from '@/lib/logger';
import { rateLimit, RATE_LIMITS, rateLimitHeaders } from '@/lib/rate-limit';

export async function GET(request: Request, { params }: { params: Promise<{ callLogId: string }> }) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limit: 10 coaching requests per minute per user
    const rateLimitResult = rateLimit(`coaching:${userId}`, RATE_LIMITS.expensive);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait before requesting more coaching insights.' },
        { status: 429, headers: rateLimitHeaders(rateLimitResult) }
      );
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

    // Get coaching analysis
    const coaching = await getCoachingAnalysis(pool(), callLogId);

    if (!coaching) {
      return NextResponse.json(
        {
          error: 'Coaching analysis not available',
          message: 'AI coaching has not been generated for this call yet. This may be because the call was too short or OpenAI API is not configured.',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      coaching,
    });
  } catch (error) {
    logger.apiError('/coaching/[callLogId]', error, { route: '/coaching/[callLogId]' });
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
