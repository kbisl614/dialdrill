/**
 * POST /api/calls/abandon
 * 
 * Marks a call as abandoned (user closed tab, navigated away, etc.)
 * Only allows abandoning active/pending calls.
 * Credits are NOT refunded (user already consumed the credit).
 */

import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { logger } from '@/lib/logger';
import { rateLimit, RATE_LIMITS, rateLimitHeaders } from '@/lib/rate-limit';
import { validateBody, z } from '@/lib/validation';

const abandonCallSchema = z.object({
  callLogId: z.string().uuid(),
});

export async function POST(request: Request) {
  const requestId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  logger.apiInfo('/calls/abandon', 'Request received', { requestId });

  try {
    // Handle sendBeacon requests (no auth headers, but body contains callLogId)
    let body: { callLogId?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { callLogId: rawCallLogId } = body;
    if (!rawCallLogId || typeof rawCallLogId !== 'string') {
      return NextResponse.json({ error: 'callLogId is required' }, { status: 400 });
    }
    const callLogId: string = rawCallLogId;

    // Try to get userId from auth (may not be available for sendBeacon)
    let userId: string | null = null;
    try {
      const authResult = await auth();
      userId = authResult.userId || null;
    } catch {
      // Auth may fail for sendBeacon - we'll validate via callLogId ownership
    }

    // Rate limit by callLogId if no userId (sendBeacon case)
    const rateLimitKey = userId ? `calls/abandon:${userId}` : `calls/abandon:${callLogId}`;
    const rateLimitResult = rateLimit(rateLimitKey, RATE_LIMITS.standard);
    if (!rateLimitResult.success) {
      logger.apiInfo('/calls/abandon', 'Rate limited', { userId: userId || undefined, callLogId, requestId });
      return NextResponse.json(
        { error: 'Too many requests. Please wait before abandoning another call.' },
        { status: 429, headers: rateLimitHeaders(rateLimitResult) }
      );
    }

    // Verify call exists and get ownership
    let callCheck;
    if (userId) {
      // Standard auth flow - verify ownership
      callCheck = await pool().query(
        `SELECT cl.id, cl.status, cl.transcript_saved, u.clerk_id
         FROM call_logs cl
         INNER JOIN users u ON cl.user_id = u.id
         WHERE cl.id = $1 AND u.clerk_id = $2`,
        [callLogId, userId]
      );
    } else {
      // sendBeacon flow - validate call exists and is recent (< 1 hour)
      // This is safe because callLogId is UUID and not guessable
      callCheck = await pool().query(
        `SELECT cl.id, cl.status, cl.transcript_saved, cl.created_at
         FROM call_logs cl
         WHERE cl.id = $1 
           AND cl.created_at > NOW() - INTERVAL '1 hour'
           AND cl.status IN ('pending', 'active')`,
        [callLogId]
      );
    }

    if (callCheck.rows.length === 0) {
      logger.apiInfo('/calls/abandon', 'Call not found or unauthorized', { callLogId, userId: userId || undefined, requestId });
      return NextResponse.json({ error: 'Call not found' }, { status: 404 });
    }

    const call = callCheck.rows[0];

    // Only allow abandoning active/pending calls (not completed or already abandoned)
    if (call.status === 'completed') {
      logger.apiInfo('/calls/abandon', 'Cannot abandon completed call', { callLogId, status: call.status, requestId });
      return NextResponse.json({
        error: 'Cannot abandon a completed call',
        status: call.status,
      }, { status: 409 });
    }

    if (call.status === 'abandoned') {
      // Already abandoned (idempotent)
      logger.apiInfo('/calls/abandon', 'Call already abandoned', { callLogId, requestId });
      return NextResponse.json({ success: true, alreadyAbandoned: true });
    }

    // Mark as abandoned
    await pool().query(
      `UPDATE call_logs
       SET status = 'abandoned',
           session_ended_at = NOW()
       WHERE id = $1 AND status IN ('pending', 'active')`,
      [callLogId]
    );

    logger.apiInfo('/calls/abandon', 'Call abandoned successfully', { callLogId, userId: userId || undefined, requestId });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.apiError('/calls/abandon', error, { route: '/calls/abandon', requestId });
    
    if (error && typeof error === 'object' && 'name' in error && error.name === 'ValidationError') {
      return NextResponse.json(
        { error: 'Invalid request', details: (error as { errors?: unknown }).errors },
        { status: 400 }
      );
    }
    
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

