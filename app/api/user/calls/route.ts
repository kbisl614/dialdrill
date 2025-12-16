import { auth } from '@clerk/nextjs/server';
import { pool } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  console.log('[API /user/calls] Request received');

  try {
    // Step 1: Get authenticated user
    console.log('[API /user/calls] Calling auth()...');
    const { userId } = await auth();
    console.log('[API /user/calls] Auth result - userId:', userId);

    if (!userId) {
      console.log('[API /user/calls] No userId found - returning 401');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Step 2: Query database
    console.log('[API /user/calls] Querying database for clerk_id:', userId);
    const result = await pool().query(
      'SELECT free_calls_remaining FROM users WHERE clerk_id = $1',
      [userId]
    );
    console.log('[API /user/calls] Query result rows:', result.rows.length);
    console.log('[API /user/calls] Query result data:', result.rows);

    // Step 3: Check if user exists
    if (result.rows.length === 0) {
      console.log('[API /user/calls] User not found in database - returning 404');
      return NextResponse.json({ error: 'User not found in database' }, { status: 404 });
    }

    // Step 4: Return success
    const freeCallsRemaining = result.rows[0].free_calls_remaining;
    console.log('[API /user/calls] Success - free_calls_remaining:', freeCallsRemaining);

    return NextResponse.json({
      freeCallsRemaining,
    });
  } catch (error) {
    console.error('[API /user/calls] ERROR:', error);
    console.error('[API /user/calls] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('[API /user/calls] Error message:', error instanceof Error ? error.message : String(error));

    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
