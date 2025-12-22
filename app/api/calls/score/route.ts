import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { scoreCall, isCallTooShort, generateShortCallScore } from '@/lib/scoring-engine';
import type { TranscriptEntry } from '@/lib/transcript-parser';

/**
 * POST /api/calls/score
 *
 * Score a completed call and save to database.
 *
 * Body: { callLogId: string }
 *
 * Automatically called after save-transcript, or can be called manually to re-score.
 */
export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { callLogId } = body ?? {};

    if (!callLogId || typeof callLogId !== 'string') {
      return NextResponse.json({ error: 'callLogId is required' }, { status: 400 });
    }

    // Fetch call log with transcript
    const callResult = await pool().query(
      `SELECT
        cl.id,
        cl.transcript,
        cl.duration_seconds
       FROM call_logs cl
       INNER JOIN users u ON cl.user_id = u.id
       WHERE cl.id = $1 AND u.clerk_id = $2`,
      [callLogId, userId]
    );

    if (callResult.rows.length === 0) {
      return NextResponse.json({ error: 'Call log not found' }, { status: 404 });
    }

    const call = callResult.rows[0];

    // Parse transcript
    let transcript: TranscriptEntry[] = [];
    if (Array.isArray(call.transcript)) {
      transcript = call.transcript as TranscriptEntry[];
    } else if (call.transcript) {
      try {
        transcript = JSON.parse(call.transcript);
      } catch {
        return NextResponse.json(
          { error: 'Invalid transcript format' },
          { status: 400 }
        );
      }
    }

    if (transcript.length === 0) {
      return NextResponse.json(
        { error: 'Cannot score call with empty transcript' },
        { status: 400 }
      );
    }

    const durationSeconds = call.duration_seconds || 0;

    // Score the call
    const score = isCallTooShort(durationSeconds, transcript)
      ? generateShortCallScore(callLogId, transcript, durationSeconds)
      : scoreCall(callLogId, transcript, durationSeconds);

    // Save to database (upsert)
    await pool().query(
      `INSERT INTO call_scores (call_log_id, overall_score, category_scores, metadata)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (call_log_id)
       DO UPDATE SET
         overall_score = EXCLUDED.overall_score,
         category_scores = EXCLUDED.category_scores,
         metadata = EXCLUDED.metadata,
         created_at = NOW()
       RETURNING id`,
      [
        score.callLogId,
        score.overallScore,
        JSON.stringify(score.categoryScores),
        JSON.stringify(score.metadata)
      ]
    );

    return NextResponse.json({
      success: true,
      score: {
        overall: score.overallScore,
        categories: score.categoryScores.map(c => ({
          category: c.category,
          score: c.score,
          maxScore: c.maxScore,
          feedback: c.feedback
        }))
      }
    });
  } catch (error) {
    console.error('[API /calls/score] ERROR:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/calls/score?callLogId=xxx
 *
 * Retrieve existing score for a call.
 */
export async function GET(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const callLogId = searchParams.get('callLogId');

    if (!callLogId) {
      return NextResponse.json({ error: 'callLogId is required' }, { status: 400 });
    }

    // Fetch score
    const result = await pool().query(
      `SELECT
        cs.overall_score,
        cs.category_scores,
        cs.metadata,
        cs.created_at
       FROM call_scores cs
       INNER JOIN call_logs cl ON cs.call_log_id = cl.id
       INNER JOIN users u ON cl.user_id = u.id
       WHERE cs.call_log_id = $1 AND u.clerk_id = $2`,
      [callLogId, userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Score not found' }, { status: 404 });
    }

    const row = result.rows[0];

    return NextResponse.json({
      overall: row.overall_score,
      categories: row.category_scores,
      metadata: row.metadata,
      createdAt: row.created_at
    });
  } catch (error) {
    console.error('[API /calls/score] GET ERROR:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
