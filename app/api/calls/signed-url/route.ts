import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { isSimulatedMode } from '@/lib/agent-selector';
import { logger } from '@/lib/logger';
import { rateLimit, RATE_LIMITS, rateLimitHeaders } from '@/lib/rate-limit';
import { validateBody, signedUrlSchema } from '@/lib/validation';

export async function POST(request: Request) {
  const requestId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const perfStart = Date.now();
  logger.apiInfo('/calls/signed-url', 'Request received', { requestId });

  try {
    // CRITICAL: Require authentication
    const { userId } = await auth();
    if (!userId) {
      logger.apiInfo('/calls/signed-url', 'Unauthorized - no userId', { requestId });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limit: 10 requests per minute per user (expensive operation)
    const rateLimitResult = rateLimit(`signed-url:${userId}`, RATE_LIMITS.expensive);
    if (!rateLimitResult.success) {
      logger.apiInfo('/calls/signed-url', 'Rate limited', { userId, requestId });
      return NextResponse.json(
        { error: 'Too many requests. Please wait before requesting another signed URL.' },
        { status: 429, headers: rateLimitHeaders(rateLimitResult) }
      );
    }

    // Validate input
    const { agentId, callLogId } = await validateBody(request, signedUrlSchema);

    // Verify call belongs to user and is in pending state
    const callCheck = await pool().query(
      `SELECT cl.id, cl.status, cl.signed_url, cl.signed_url_expires_at
       FROM call_logs cl
       INNER JOIN users u ON cl.user_id = u.id
       WHERE cl.id = $1 AND u.clerk_id = $2`,
      [callLogId, userId]
    );

    if (callCheck.rows.length === 0) {
      logger.apiInfo('/calls/signed-url', 'Call not found or unauthorized', { callLogId, userId, requestId });
      return NextResponse.json({ error: 'Call not found' }, { status: 404 });
    }

    const call = callCheck.rows[0];

    // PROTECTION 3: Prevent reuse of signed URLs (if URL exists and not expired, return existing)
    if (call.signed_url && call.signed_url_expires_at) {
      const expiresAt = new Date(call.signed_url_expires_at);
      if (expiresAt > new Date()) {
        logger.apiInfo('/calls/signed-url', 'Returning existing signed URL', { callLogId, userId, requestId });
        return NextResponse.json({
          signedUrl: call.signed_url,
          simulated: false,
          existing: true,
        });
      }
    }

    // PROTECTION 4: Only allow signed URL for pending calls (prevent restart of completed calls)
    if (call.status !== 'pending') {
      logger.apiInfo('/calls/signed-url', 'Call not in pending state', { callLogId, status: call.status, userId, requestId });
      return NextResponse.json({
        error: `Cannot get signed URL for call in ${call.status} state. Please start a new call.`,
        status: call.status,
      }, { status: 409 });
    }

    // Update call status to active when getting signed URL
    await pool().query(
      `UPDATE call_logs 
       SET status = 'active', session_started_at = NOW()
       WHERE id = $1 AND status = 'pending'`,
      [callLogId]
    );

    logger.apiInfo('/calls/signed-url', 'Getting signed URL', { agentId, callLogId, userId, requestId });

    // Simulated mode - skip ElevenLabs entirely
    if (isSimulatedMode()) {
      const totalTime = Date.now() - perfStart;
      logger.perf('/calls/signed-url SIMULATED MODE', totalTime);
      logger.apiInfo('/calls/signed-url', 'Simulated mode - returning mock URL');
      return NextResponse.json({
        signedUrl: 'simulated://call-session',
        simulated: true,
      });
    }

    // Real mode - Get signed URL from ElevenLabs REST API
    const elevenLabsStart = Date.now();
    logger.perf('Calling ElevenLabs API', elevenLabsStart - perfStart);

    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=${agentId}`,
      {
        headers: {
          'xi-api-key': process.env.ELEVENLABS_API_KEY || '',
        },
      }
    );

    const elevenLabsEnd = Date.now();
    logger.perf('ElevenLabs API response', elevenLabsEnd - elevenLabsStart, { totalTime: elevenLabsEnd - perfStart });

    if (!response.ok) {
      const errorText = await response.text();
      logger.apiError('/calls/signed-url', new Error(`ElevenLabs API error: ${response.status}`), { errorText });
      throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const signedUrl = data.signed_url;
    
    // PROTECTION 5: Store signed URL with expiration (15 minutes) to prevent reuse
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    await pool().query(
      `UPDATE call_logs 
       SET signed_url = $1, signed_url_expires_at = $2
       WHERE id = $3`,
      [signedUrl, expiresAt, callLogId]
    );

    const totalTime = Date.now() - perfStart;
    logger.perf('/calls/signed-url TOTAL TIME', totalTime);
    logger.apiInfo('/calls/signed-url', 'Got signed URL successfully', { callLogId, expiresAt, requestId });

    return NextResponse.json({
      signedUrl,
      simulated: false,
      expiresAt: expiresAt.toISOString(),
    });
  } catch (error) {
    logger.apiError('/calls/signed-url', error, { route: '/calls/signed-url', requestId });
    
    // Handle validation errors
    if (error && typeof error === 'object' && 'name' in error && error.name === 'ValidationError') {
      return NextResponse.json(
        { error: 'Invalid request', details: (error as { errors?: unknown }).errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      {
        error: 'Failed to get signed URL',
        ...(process.env.NODE_ENV !== 'production' && {
          details: error instanceof Error ? error.message : String(error)
        })
      },
      { status: 500 }
    );
  }
}
