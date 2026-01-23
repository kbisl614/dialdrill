import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { pool } from '@/lib/db';
import {
  ALLOWED_RING_COLOR_KEYS,
  isValidRingColorKey,
  type RingColorKey,
} from '@/lib/profile-ring';
import { logger } from '@/lib/logger';

export async function PATCH(request: Request) {
  const requestId = request.headers.get('X-Request-Id') || `server-${Date.now()}`;

  // Auth check
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json(
      { error: 'Unauthorized', requestId },
      { status: 401 }
    );
  }

  // Parse body
  let body: { ringColor?: unknown } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body', requestId },
      { status: 400 }
    );
  }

  const { ringColor } = body;

  // Strict validation: must be one of exactly 5 allowed keys
  if (!isValidRingColorKey(ringColor)) {
    return NextResponse.json(
      {
        error: 'Invalid ringColor',
        message: `ringColor must be one of: ${ALLOWED_RING_COLOR_KEYS.join(', ')}`,
        allowed: ALLOWED_RING_COLOR_KEYS,
        received: typeof ringColor === 'string' ? ringColor : typeof ringColor,
        requestId,
      },
      { status: 400 }
    );
  }

  // TypeScript now knows ringColor is RingColorKey
  const validatedRingColor: RingColorKey = ringColor;

  const client = await pool().connect();
  try {
    try {
      await client.query(
        `UPDATE users
         SET profile_ring_color = $1
         WHERE clerk_id = $2`,
        [validatedRingColor, userId]
      );
    } catch (error: unknown) {
      const dbError = error as { code?: string };
      if (dbError?.code === '42703') {
        // Column doesn't exist - migration needed
        logger.apiError('/user/profile-ring', error, {
          route: '/user/profile-ring',
          requestId,
          issue: 'missing_column',
        });
        return NextResponse.json(
          {
            error: 'Profile ring feature not available',
            code: 'MISSING_COLUMN',
            requestId,
          },
          { status: 500 }
        );
      }
      throw error;
    }

    // Success response with confirmed ringColor
    return NextResponse.json({ ringColor: validatedRingColor, requestId });

  } catch (error) {
    logger.apiError('/user/profile-ring', error, {
      route: '/user/profile-ring',
      requestId,
      userId,
      attemptedRingColor: validatedRingColor,
    });
    return NextResponse.json(
      { error: 'Failed to update profile ring', requestId },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
