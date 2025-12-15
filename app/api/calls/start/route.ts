import { auth } from '@clerk/nextjs/server';
import { pool } from '@/lib/db';
import { NextResponse } from 'next/server';
import { getRandomAgentId } from '@/lib/agent-selector';

export async function POST() {
  console.log('[API /calls/start] Request received');

  try {
    const { userId } = await auth();
    console.log('[API /calls/start] Auth result - userId:', userId);

    if (!userId) {
      console.log('[API /calls/start] No userId found - returning 401');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const agentId = getRandomAgentId();
    console.log('[Call] Selected agentId:', agentId);

    console.log('[API /calls/start] Querying database for clerk_id:', userId);
    const userResult = await pool.query(
      'SELECT id, free_calls_remaining FROM users WHERE clerk_id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      console.log('[API /calls/start] User not found in database');
      return NextResponse.json({ error: 'User not found in database' }, { status: 404 });
    }

    const user = userResult.rows[0];
    console.log('[API /calls/start] User data:', user);

    if (user.free_calls_remaining <= 0) {
      console.log('[API /calls/start] No free calls remaining');
      return NextResponse.json({ error: 'No free calls remaining' }, { status: 403 });
    }

    console.log('[API /calls/start] Decrementing free_calls_remaining...');
    await pool.query(
      'UPDATE users SET free_calls_remaining = free_calls_remaining - 1 WHERE id = $1',
      [user.id]
    );

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
