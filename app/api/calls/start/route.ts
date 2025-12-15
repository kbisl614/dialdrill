import { auth } from '@clerk/nextjs/server';
import { pool } from '@/lib/db';
import { NextResponse } from 'next/server';
import { getRandomAgentId, isMockMode } from '@/lib/agent-selector';

export async function POST() {
  console.log('[API /calls/start] Request received');

  try {
    // Step 1: Get authenticated user
    const { userId } = await auth();
    console.log('[API /calls/start] Auth result - userId:', userId);

    if (!userId) {
      console.log('[API /calls/start] No userId found - returning 401');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const mockMode = isMockMode();
    console.log('[Call] Mock mode enabled:', mockMode);

    // Step 2: Select agent randomly
    const agentId = getRandomAgentId();
    console.log('[Call] Selected agentId:', agentId);

    // Step 3: Check user's free calls remaining (skip in mock mode)
    if (!mockMode) {
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

      // Step 4: Check if user has calls remaining
      if (user.free_calls_remaining <= 0) {
        console.log('[API /calls/start] No free calls remaining');
        return NextResponse.json({ error: 'No free calls remaining' }, { status: 403 });
      }

      // Step 5: Decrement free calls remaining
      console.log('[API /calls/start] Decrementing free_calls_remaining...');
      await pool.query(
        'UPDATE users SET free_calls_remaining = free_calls_remaining - 1 WHERE id = $1',
        [user.id]
      );

      console.log('[API /calls/start] Success - call decremented');

      return NextResponse.json({
        agentId,
        callsRemaining: user.free_calls_remaining - 1,
        mock: false,
      });
    } else {
      // Mock mode - skip database operations
      console.log('[API /calls/start] Mock mode - skipping database operations');

      return NextResponse.json({
        agentId,
        callsRemaining: 999,
        mock: true,
      });
    }
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
