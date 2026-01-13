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

    // Try to update user record with onboarding data
    try {
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
    } catch (dbError) {
      // Log but don't fail if columns don't exist yet
      console.warn('Could not save onboarding data to database:', dbError);
      console.log('Onboarding data would have been:', { role, experience, mainStruggles, howFound, goals });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in onboarding endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to save onboarding data' },
      { status: 500 }
    );
  }
}
