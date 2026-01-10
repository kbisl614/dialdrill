import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { role, experience, mainStruggles, howFound, goals } = body;

    // Update user record with onboarding data
    await pool().query(
      `UPDATE users
       SET onboarding_data = $1,
           onboarding_completed_at = NOW()
       WHERE clerk_id = $2`,
      [
        JSON.stringify({
          role,
          experience,
          mainStruggles,
          howFound,
          goals,
          completedAt: new Date().toISOString(),
        }),
        userId,
      ]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving onboarding data:', error);
    return NextResponse.json(
      { error: 'Failed to save onboarding data' },
      { status: 500 }
    );
  }
}
