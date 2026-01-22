import { NextResponse } from 'next/server';
import { isSimulatedMode } from '@/lib/agent-selector';
import { logger } from '@/lib/logger';

export async function POST(request: Request) {
  const perfStart = Date.now();
  logger.apiInfo('/calls/signed-url', 'Request received');

  try {
    const { agentId } = await request.json();

    if (!agentId) {
      return NextResponse.json({ error: 'Agent ID required' }, { status: 400 });
    }

    logger.apiInfo('/calls/signed-url', 'Getting signed URL', { agentId });

    // Simulated mode - skip ElevenLabs entirely
    if (isSimulatedMode()) {
      const totalTime = Date.now() - perfStart;
      logger.perf('/calls/signed-url SIMULATED MODE', totalTime);
      logger.apiInfo('/calls/signed-url', 'Simulated mode - returning mock URL');
      return NextResponse.json({
        signedUrl: 'simulated://call-session',
        simulated: true,
      });
    }

    // Real mode - Get signed URL from ElevenLabs REST API
    const elevenLabsStart = Date.now();
    logger.perf('Calling ElevenLabs API', elevenLabsStart - perfStart);

    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=${agentId}`,
      {
        headers: {
          'xi-api-key': process.env.ELEVENLABS_API_KEY || '',
        },
      }
    );

    const elevenLabsEnd = Date.now();
    logger.perf('ElevenLabs API response', elevenLabsEnd - elevenLabsStart, { totalTime: elevenLabsEnd - perfStart });

    if (!response.ok) {
      const errorText = await response.text();
      logger.apiError('/calls/signed-url', new Error(`ElevenLabs API error: ${response.status}`), { errorText });
      throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const totalTime = Date.now() - perfStart;
    logger.perf('/calls/signed-url TOTAL TIME', totalTime);
    logger.apiInfo('/calls/signed-url', 'Got signed URL successfully');

    return NextResponse.json({
      signedUrl: data.signed_url,
      simulated: false,
    });
  } catch (error) {
    logger.apiError('/calls/signed-url', error, { route: '/calls/signed-url' });
    return NextResponse.json(
      {
        error: 'Failed to get signed URL',
        ...(process.env.NODE_ENV !== 'production' && {
          details: error instanceof Error ? error.message : String(error)
        })
      },
      { status: 500 }
    );
  }
}
