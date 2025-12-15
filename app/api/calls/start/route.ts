import { auth } from '@clerk/nextjs/server';
import { pool } from '@/lib/db';
import { NextResponse } from 'next/server';
import { getRandomAgentId } from '@/lib/agent-selector';

export async function POST() {
  const perfStart = Date.now();
  console.log('[API /calls/start] Request received');

  try {
    const authStart = Date.now();
    const { userId } = await auth();
    const authEnd = Date.now();
    console.log(`[PERF-API] ${authEnd - perfStart}ms - Clerk auth completed (took ${authEnd - authStart}ms)`);
    console.log('[API /calls/start] Auth result - userId:', userId);

    if (!userId) {
      console.log('[API /calls/start] No userId found - returning 401');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const agentId = getRandomAgentId();
    console.log('[Call] Selected agentId:', agentId);

    const dbQueryStart = Date.now();
    console.log('[API /calls/start] Querying database for clerk_id:', userId);
    const userResult = await pool.query(
      'SELECT id, free_calls_remaining FROM users WHERE clerk_id = $1',
      [userId]
    );
    const dbQueryEnd = Date.now();
    console.log(`[PERF-API] ${dbQueryEnd - perfStart}ms - DB query completed (took ${dbQueryEnd - dbQueryStart}ms)`);

    if (userResult.rows.length === 0) {
      console.log('[API /calls/start] User not found in database');
      return NextResponse.json({ error: 'User not found in database' }, { status: 404 });
    }

    const user = userResult.rows[0];
    console.log('[API /calls/start] User data:', user);

    if (user.free_calls_remaining <= 0) {
      console.log('[API /calls/start] No free calls remaining');
      return NextResponse.json({ error: "You're out of call credits. Please upgrade to continue." }, { status: 403 });
    }

    const dbUpdateStart = Date.now();
    console.log('[API /calls/start] Decrementing free_calls_remaining...');
    await pool.query(
      'UPDATE users SET free_calls_remaining = free_calls_remaining - 1 WHERE id = $1',
      [user.id]
    );
    const dbUpdateEnd = Date.now();
    console.log(`[PERF-API] ${dbUpdateEnd - perfStart}ms - DB update completed (took ${dbUpdateEnd - dbUpdateStart}ms)`);

    const totalTime = Date.now() - perfStart;
    console.log(`[PERF-API] ${totalTime}ms - ✅ /calls/start TOTAL TIME`);
    console.log('[API /calls/start] Success - call decremented');

    return NextResponse.json({
      agentId,
      callsRemaining: user.free_calls_remaining - 1,
    });
  } catch (error) {
    console.error('[API /calls/start] ERROR:', error);
    console.error('[API /calls/start] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('[API /calls/start] Error message:', error instanceof Error ? error.message : String(error));

    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
