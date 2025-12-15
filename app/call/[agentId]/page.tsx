'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { Conversation } from '@elevenlabs/client';

type CallStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

interface TranscriptItem {
  role: 'user' | 'agent';
  text: string;
  timestamp: Date;
}

export default function CallPage() {
  const params = useParams();
  const router = useRouter();
  const { isLoaded, user } = useUser();
  const agentId = params.agentId as string;

  const [status, setStatus] = useState<CallStatus>('connecting');
  const [transcript, setTranscript] = useState<TranscriptItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const isInitializedRef = useRef(false);

  const endCall = useCallback(() => {
    console.log('[Call] Ending call...');
    if (conversation) {
      try {
        conversation.endSession();
        console.log('[Call] Session ended');
      } catch (e) {
        console.error('[Call] Error ending session:', e);
      }
      setConversation(null);
    }
    setStatus('disconnected');
  }, [conversation]);

  useEffect(() => {
    // Prevent double initialization in React StrictMode
    if (!isLoaded || !user || isInitializedRef.current) return;

    let conv: Conversation | null = null;
    let isCancelled = false;
    let mockTimeouts: NodeJS.Timeout[] = [];

    async function initializeCall() {
      try {
        console.log('[Call] Starting initialization...');
        setStatus('connecting');
        isInitializedRef.current = true;

        // Step 1: Get signed URL from our API
        const response = await fetch('/api/calls/signed-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ agentId }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.details || 'Failed to get signed URL');
        }

        const { signedUrl, mock } = await response.json();
        console.log('[Call] Got signed URL, initializing conversation...');

        if (mock) {
          console.log('[Call] Mock mode enabled');
        }

        if (isCancelled) {
          console.log('[Call] Cancelled before starting session');
          return;
        }

        // Check if mock mode
        const isMockMode = mock || signedUrl.startsWith('mock://');

        if (isMockMode) {
          // Mock mode - simulate conversation
          console.log('[Call] Running in mock mode - simulating connection');

          // Simulate connection after 300ms
          const connectTimeout = setTimeout(() => {
            if (!isCancelled) {
              console.log('[Call] Mock: Connected');
              setStatus('connected');

              // Add mock transcript lines over time
              const transcriptLines = [
                { role: 'agent' as const, text: "Hello, this is a mock sales prospect. I'm quite busy right now.", delay: 1000 },
                { role: 'user' as const, text: "Hi! I wanted to talk to you about our new product.", delay: 3000 },
                { role: 'agent' as const, text: "We're already happy with our current vendor. What makes yours different?", delay: 5000 },
                { role: 'user' as const, text: "Great question! Our solution offers 40% better ROI through automation.", delay: 7500 },
                { role: 'agent' as const, text: "That sounds interesting. Can you send me some information?", delay: 9500 },
              ];

              transcriptLines.forEach(({ role, text, delay }) => {
                const timeout = setTimeout(() => {
                  if (!isCancelled) {
                    setTranscript(prev => [...prev, {
                      role,
                      text,
                      timestamp: new Date(),
                    }]);
                  }
                }, delay);
                mockTimeouts.push(timeout);
              });
            }
          }, 300);
          mockTimeouts.push(connectTimeout);

        } else {
          // Real mode - Initialize ElevenLabs conversation
          console.log('[Call] About to call Conversation.startSession...');
          console.log('[Call] Signed URL:', signedUrl);

          try {
            conv = await Conversation.startSession({
              signedUrl: signedUrl,
              onConnect: () => {
                console.log('[Call] ✅ WebSocket Connected!');
                setStatus('connected');
              },
              onDisconnect: () => {
                console.log('[Call] WebSocket Disconnected');
                setStatus('disconnected');
              },
              onError: (error) => {
                console.error('[Call] ❌ WebSocket Error:', error);
                setError(typeof error === 'string' ? error : 'Connection error');
                setStatus('error');
              },
              onMessage: (message) => {
                console.log('[Call] Message received:', message);

                // Handle transcript messages
                const msg = message as any;
                if (msg.type === 'user_transcript' || msg.type === 'agent_transcript') {
                  const role = msg.type === 'user_transcript' ? 'user' : 'agent';
                  const text = msg.text || msg.message || '';

                  if (text) {
                    console.log(`[Call] Transcript [${role}]:`, text);
                    setTranscript(prev => [...prev, {
                      role,
                      text,
                      timestamp: new Date(),
                    }]);
                  }
                }
              },
            });

            console.log('[Call] ✅ Conversation object created:', conv);
          } catch (sessionError) {
            console.error('[Call] ❌ Error calling startSession:', sessionError);
            throw sessionError;
          }

          if (!isCancelled) {
            setConversation(conv);
            console.log('[Call] Conversation set');
          } else {
            console.log('[Call] Cancelled after starting session, ending immediately');
            conv.endSession();
          }
        }

      } catch (err) {
        console.error('[Call] Initialization error:', err);
        setStatus('error');
        setError(err instanceof Error ? err.message : 'Failed to start call');
      }
    }

    initializeCall();

    return () => {
      console.log('[Call] Cleanup running...');
      isCancelled = true;

      // Clear mock timeouts
      mockTimeouts.forEach(timeout => clearTimeout(timeout));

      if (conv) {
        console.log('[Call] Cleaning up conversation');
        try {
          conv.endSession();
        } catch (e) {
          console.error('[Call] Error during cleanup:', e);
        }
      }
    };
  }, [isLoaded, user, agentId]);

  function handleEndCall() {
    endCall();
    router.push('/dashboard');
  }

  function toggleMute() {
    if (!conversation) return;

    if (isMuted) {
      conversation.setVolume({ volume: 1.0 });
    } else {
      conversation.setVolume({ volume: 0.0 });
    }
    setIsMuted(!isMuted);
  }

  if (!isLoaded || !user) {
    return (
      <div className="min-h-screen bg-[#020817] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020817] flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-800 p-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Sales Call Practice</h1>
            <p className="text-sm text-gray-400 mt-1">
              Status: <span className={
                status === 'connected' ? 'text-green-400' :
                status === 'connecting' ? 'text-yellow-400' :
                status === 'error' ? 'text-red-400' :
                'text-gray-400'
              }>{status}</span>
            </p>
          </div>
          <button
            onClick={handleEndCall}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
          >
            End Call
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 max-w-4xl mx-auto w-full p-6">
        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500 rounded-lg text-red-400">
            {error}
          </div>
        )}

        {/* Call Status */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-4 bg-gray-900 rounded-full">
            <div className={`w-3 h-3 rounded-full ${
              status === 'connected' ? 'bg-green-400 animate-pulse' :
              status === 'connecting' ? 'bg-yellow-400 animate-pulse' :
              'bg-gray-400'
            }`} />
            <span className="text-white font-semibold">
              {status === 'connecting' && 'Connecting to prospect...'}
              {status === 'connected' && 'Call in progress'}
              {status === 'disconnected' && 'Call ended'}
              {status === 'error' && 'Connection error'}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="mb-8 flex justify-center gap-4">
          <button
            onClick={toggleMute}
            disabled={status !== 'connected'}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              isMuted
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-gray-700 hover:bg-gray-600 text-white'
            }`}
          >
            {isMuted ? 'Unmute' : 'Mute'}
          </button>
        </div>

        {/* Transcript */}
        <div className="bg-gray-900 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Transcript</h2>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {transcript.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                {status === 'connected'
                  ? 'Start speaking - transcript will appear here...'
                  : 'Waiting for connection...'}
              </p>
            ) : (
              transcript.map((item, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg ${
                    item.role === 'user'
                      ? 'bg-blue-900/20 border border-blue-500/30'
                      : 'bg-gray-800'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-gray-400">
                      {item.role === 'user' ? 'You' : 'Prospect'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {item.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-white">{item.text}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
