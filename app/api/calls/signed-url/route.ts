import { NextResponse } from 'next/server';
import { isSimulatedMode } from '@/lib/agent-selector';

export async function POST(request: Request) {
  const perfStart = Date.now();
  console.log('[API /calls/signed-url] Request received');

  try {
    const { agentId } = await request.json();

    if (!agentId) {
      return NextResponse.json({ error: 'Agent ID required' }, { status: 400 });
    }

    console.log('[API /calls/signed-url] Getting signed URL for agent:', agentId);

    // Simulated mode - skip ElevenLabs entirely
    if (isSimulatedMode()) {
      const totalTime = Date.now() - perfStart;
      console.log(`[PERF-API] ${totalTime}ms - ✅ /calls/signed-url SIMULATED MODE (no external API call)`);
      console.log('[API /calls/signed-url] Simulated mode - returning mock URL');
      return NextResponse.json({
        signedUrl: 'simulated://call-session',
        simulated: true,
      });
    }

    // Real mode - Get signed URL from ElevenLabs REST API
    const elevenLabsStart = Date.now();
    console.log(`[PERF-API] ${elevenLabsStart - perfStart}ms - Calling ElevenLabs API`);

    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=${agentId}`,
      {
        headers: {
          'xi-api-key': process.env.ELEVENLABS_API_KEY || '',
        },
      }
    );

    const elevenLabsEnd = Date.now();
    console.log(`[PERF-API] ${elevenLabsEnd - perfStart}ms - ElevenLabs API response (took ${elevenLabsEnd - elevenLabsStart}ms)`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[API /calls/signed-url] ElevenLabs error:', errorText);
      throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const totalTime = Date.now() - perfStart;
    console.log(`[PERF-API] ${totalTime}ms - ✅ /calls/signed-url TOTAL TIME`);
    console.log('[API /calls/signed-url] Got signed URL successfully');

    return NextResponse.json({
      signedUrl: data.signed_url,
      simulated: false,
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
