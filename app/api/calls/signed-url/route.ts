import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { isMockMode } from '@/lib/agent-selector';

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { agentId } = await request.json();

    if (!agentId) {
      return NextResponse.json({ error: 'Agent ID required' }, { status: 400 });
    }

    const mockMode = isMockMode();
    console.log('[API /calls/signed-url] Getting signed URL for agent:', agentId);
    console.log('[Call] Mock mode enabled:', mockMode);

    if (mockMode) {
      // Mock mode - return fake signed URL
      console.log('[API /calls/signed-url] Mock mode - returning fake signed URL');
      return NextResponse.json({
        signedUrl: 'mock://signed-url',
        mock: true,
      });
    }

    // Get signed URL from ElevenLabs REST API
    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=${agentId}`,
      {
        headers: {
          'xi-api-key': process.env.ELEVENLABS_API_KEY || '',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[API /calls/signed-url] ElevenLabs error:', errorText);
      throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('[API /calls/signed-url] Got signed URL successfully');

    return NextResponse.json({
      signedUrl: data.signed_url,
      mock: false,
    });
  } catch (error) {
    console.error('[API /calls/signed-url] ERROR:', error);
    return NextResponse.json(
      {
        error: 'Failed to get signed URL',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
