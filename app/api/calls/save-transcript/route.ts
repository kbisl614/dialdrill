import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { scoreCall, isCallTooShort, generateShortCallScore } from '@/lib/scoring-engine';
import { parseTranscript } from '@/lib/transcript-parser';
import { matchAndSaveObjections } from '@/lib/objection-matcher';

interface TranscriptEntry {
  role: 'user' | 'agent';
  text: string;
  timestamp?: string | null;
}

type RawTranscriptEntry = {
  role?: unknown;
  text?: unknown;
  timestamp?: unknown;
};

function normalizeTranscriptEntry(item: RawTranscriptEntry): TranscriptEntry {
  const role = item.role === 'agent' ? 'agent' : 'user';
  const text = typeof item.text === 'string' ? item.text : '';
  let timestamp: string | null = null;

  if (typeof item.timestamp === 'string') {
    timestamp = item.timestamp;
  } else if (
    item.timestamp &&
    typeof item.timestamp === 'object' &&
    'toISOString' in item.timestamp &&
    typeof (item.timestamp as { toISOString: () => string }).toISOString === 'function'
  ) {
    timestamp = (item.timestamp as { toISOString: () => string }).toISOString();
  }

  return { role, text, timestamp };
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { callLogId, transcript, durationSeconds } = body ?? {};

    if (!callLogId || typeof callLogId !== 'string') {
      return NextResponse.json({ error: 'callLogId is required' }, { status: 400 });
    }

    if (!Array.isArray(transcript)) {
      return NextResponse.json({ error: 'transcript must be an array' }, { status: 400 });
    }

    const normalizedTranscript: TranscriptEntry[] = (transcript as RawTranscriptEntry[]).map((item) =>
      normalizeTranscriptEntry(item)
    );

    const parsedDuration =
      typeof durationSeconds === 'number' && Number.isFinite(durationSeconds)
        ? Math.max(0, Math.round(durationSeconds))
        : null;

    const result = await pool().query(
      `UPDATE call_logs
       SET transcript = $1,
           duration_seconds = $2
       WHERE id = $3
         AND user_id = (SELECT id FROM users WHERE clerk_id = $4)
       RETURNING id`,
      [JSON.stringify(normalizedTranscript), parsedDuration, callLogId, userId]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Call log not found' }, { status: 404 });
    }

    // Automatically score the call after saving transcript
    try {
      const duration = parsedDuration || 0;
      const score = isCallTooShort(duration, normalizedTranscript)
        ? generateShortCallScore(callLogId, normalizedTranscript, duration)
        : scoreCall(callLogId, normalizedTranscript, duration);

      // Save score to database (upsert)
      await pool().query(
        `INSERT INTO call_scores (call_log_id, overall_score, category_scores, metadata)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (call_log_id)
         DO UPDATE SET
           overall_score = EXCLUDED.overall_score,
           category_scores = EXCLUDED.category_scores,
           metadata = EXCLUDED.metadata,
           created_at = NOW()`,
        [
          score.callLogId,
          score.overallScore,
          JSON.stringify(score.categoryScores),
          JSON.stringify(score.metadata)
        ]
      );

      // Match and save triggered objections
      const signals = parseTranscript(normalizedTranscript);
      await matchAndSaveObjections(callLogId, signals);
    } catch (scoreError) {
      // Log but don't fail the request if scoring fails
      console.error('[API /calls/save-transcript] Scoring failed:', scoreError);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API /calls/save-transcript] ERROR:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
