'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
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
  const searchParams = useSearchParams();
  const { isLoaded, user } = useUser();
  const agentId = params.agentId as string;
  const callLogId = searchParams.get('callLogId');

  // Get max duration from URL params (90 for trial, 300 for paid)
  const maxDurationParam = searchParams.get('maxDuration');
  const initialMaxDuration = maxDurationParam ? parseInt(maxDurationParam) : 300;

  const [status, setStatus] = useState<CallStatus>('connecting');
  const [transcript, setTranscript] = useState<TranscriptItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [maxDuration] = useState<number>(initialMaxDuration);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [showTimeWarning, setShowTimeWarning] = useState(false);
  const [micPermissionGranted, setMicPermissionGranted] = useState<boolean | null>(null);
  const [connectionQuality, setConnectionQuality] = useState<'excellent' | 'good' | 'poor' | 'unknown'>('unknown');
  const isInitializedRef = useRef(false);
  const callStartTimeRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const transcriptSavedRef = useRef(false);
  const lastMessageTimeRef = useRef<number>(Date.now());
  const timeRemaining = Math.max(maxDuration - elapsedSeconds, 0);

  const endCall = useCallback(() => {
    console.log('[Call] Ending call...');

    // Clear timer
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

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

  // Check microphone permissions first
  useEffect(() => {
    async function checkMicPermission() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Permission granted, clean up the stream
        stream.getTracks().forEach(track => track.stop());
        setMicPermissionGranted(true);
      } catch (err) {
        console.error('[Call] Microphone permission denied:', err);
        setMicPermissionGranted(false);
        setError('Microphone access is required for calls. Please enable it in your browser settings.');
        setStatus('error');
      }
    }

    if (isLoaded && user) {
      checkMicPermission();
    }
  }, [isLoaded, user]);

  useEffect(() => {
    // Prevent double initialization in React StrictMode
    if (!isLoaded || !user || isInitializedRef.current) return;

    // Don't start call if mic permission not granted
    if (micPermissionGranted === false) return;
    if (micPermissionGranted === null) return; // Still checking

    let conv: Conversation | null = null;
    let isCancelled = false;
    const mockTimeouts: NodeJS.Timeout[] = [];

    async function initializeCall() {
      const perfStart = performance.now();
      console.log('[PERF] Call page mounted → Initialize call');

      try {
        console.log('[Call] Starting initialization...');
        setStatus('connecting');
        isInitializedRef.current = true;

        // Step 1: Get signed URL from our API
        const apiCallStart = performance.now();
        console.log(`[PERF] ${(apiCallStart - perfStart).toFixed(0)}ms - Fetching signed URL`);

        const response = await fetch('/api/calls/signed-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ agentId }),
        });

        const apiCallEnd = performance.now();
        console.log(`[PERF] ${(apiCallEnd - perfStart).toFixed(0)}ms - Signed URL received (took ${(apiCallEnd - apiCallStart).toFixed(0)}ms)`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.details || 'Failed to get signed URL');
        }

        const { signedUrl, simulated } = await response.json();
        console.log('[Call] Got signed URL, initializing conversation...');

        if (isCancelled) {
          console.log('[Call] Cancelled before starting session');
          return;
        }

        // Simulated mode - run mock call without ElevenLabs
        if (simulated || signedUrl.startsWith('simulated://')) {
          console.log('[PERF] Simulated mode detected - no WebSocket connection');
          console.log('[Call] Running in simulated mode');

          // Simulate connection after short delay
          const connectTimeout = setTimeout(() => {
            if (!isCancelled) {
              const connectedTime = performance.now();
              console.log(`[PERF] ${(connectedTime - perfStart).toFixed(0)}ms - ✅ SIMULATED CALL CONNECTED`);
              console.log('[Call] Simulated: Connected');
              setStatus('connected');

              // Add simulated transcript entries over time
              const transcriptEntries = [
                { role: 'agent' as const, text: "Hello, this is Sarah from TechCorp. How can I help you today?", delay: 800 },
                { role: 'user' as const, text: "Hi Sarah, I wanted to discuss your enterprise package.", delay: 2500 },
                { role: 'agent' as const, text: "Great! We have several options. What's your current team size?", delay: 4000 },
                { role: 'user' as const, text: "We're about 50 people right now.", delay: 5500 },
                { role: 'agent' as const, text: "Perfect. For that size, I'd recommend our Pro plan. Can I send you details?", delay: 7000 },
              ];

              transcriptEntries.forEach(({ role, text, delay }) => {
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
          }, 500);
          mockTimeouts.push(connectTimeout);
          return;
        }

        // Real mode - Initialize ElevenLabs conversation
        const wsStartTime = performance.now();
        console.log(`[PERF] ${(wsStartTime - perfStart).toFixed(0)}ms - Starting WebSocket connection`);
        console.log('[Call] About to call Conversation.startSession...');
        console.log('[Call] Signed URL:', signedUrl);

        // Set connection timeout
        const connectionTimeout = setTimeout(() => {
          if (!isCancelled) {
            const timeoutTime = performance.now();
            console.error(`[PERF] ${(timeoutTime - perfStart).toFixed(0)}ms - ❌ CONNECTION TIMEOUT (10s limit)`);
            console.error('[Call] Connection timeout after 10s');
            setStatus('error');
            setError('Connection timed out. Please check your internet and try again.');
          }
        }, 10000);
        mockTimeouts.push(connectionTimeout);

        try {
          conv = await Conversation.startSession({
            signedUrl: signedUrl,
            onConnect: () => {
              const connectedTime = performance.now();
              console.log(`[PERF] ${(connectedTime - perfStart).toFixed(0)}ms - ✅ WEBSOCKET CONNECTED (WebSocket handshake took ${(connectedTime - wsStartTime).toFixed(0)}ms)`);
              console.log('[Call] ✅ WebSocket Connected!');
              clearTimeout(connectionTimeout);
              setStatus('connected');
              setConnectionQuality('excellent');

              // Start call timer
              callStartTimeRef.current = Date.now();
              lastMessageTimeRef.current = Date.now();
            },
            onDisconnect: () => {
              console.log('[Call] WebSocket Disconnected');
              setStatus('disconnected');
            },
            onError: (error) => {
              console.error('[Call] ❌ WebSocket Error:', error);
              clearTimeout(connectionTimeout);
              setError(typeof error === 'string' ? error : 'Connection lost. Please check your internet and try again.');
              setStatus('error');
            },
            onMessage: (message: { type?: string; text?: string; message?: string }) => {
              console.log('[Call] Message received:', message);

              // Update connection quality based on message timing
              const now = Date.now();
              const timeSinceLastMessage = now - lastMessageTimeRef.current;
              lastMessageTimeRef.current = now;

              // Determine quality based on latency
              if (timeSinceLastMessage < 2000) {
                setConnectionQuality('excellent');
              } else if (timeSinceLastMessage < 5000) {
                setConnectionQuality('good');
              } else {
                setConnectionQuality('poor');
              }

              if (message.type === 'user_transcript' || message.type === 'agent_transcript') {
                const role = message.type === 'user_transcript' ? 'user' : 'agent';
                const text = message.text || message.message || '';

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

      } catch (err) {
        console.error('[Call] Initialization error:', err);
        setStatus('error');
        setError(err instanceof Error ? err.message : 'Unable to connect. Please try again.');
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
  }, [isLoaded, user, agentId, micPermissionGranted]);

  // Timer effect for call duration enforcement
  useEffect(() => {
    if (status !== 'connected' || !callStartTimeRef.current) {
      return;
    }

    // Update elapsed time every second
    timerIntervalRef.current = setInterval(() => {
      if (!callStartTimeRef.current) return;

      const elapsed = Math.floor((Date.now() - callStartTimeRef.current) / 1000);
      setElapsedSeconds(elapsed);

      const timeRemaining = maxDuration - elapsed;

      // Show warning at 30 seconds remaining
      if (timeRemaining <= 30 && timeRemaining > 0) {
        setShowTimeWarning(true);
      }

      // Auto-disconnect when time limit reached
      if (elapsed >= maxDuration) {
        console.log('[Call] Maximum duration reached, ending call');
        setError(`Call ended: ${maxDuration === 90 ? '1.5 minute' : '5 minute'} time limit reached`);
        endCall();
      }
    }, 1000);

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [status, maxDuration, endCall]);

  const saveTranscriptToServer = useCallback(async (finalDuration: number) => {
    if (!callLogId || transcriptSavedRef.current) {
      return;
    }
    transcriptSavedRef.current = true;

    try {
      const payload = {
        callLogId,
        durationSeconds: finalDuration,
        transcript: transcript.map(item => ({
          role: item.role,
          text: item.text,
          timestamp: item.timestamp instanceof Date ? item.timestamp.toISOString() : item.timestamp,
        })),
      };

      const response = await fetch('/api/calls/save-transcript', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const details = await response.json().catch(() => null);
        console.error('[Call] Failed to save transcript:', details);
      }
    } catch (err) {
      console.error('[Call] Error saving transcript:', err);
    }
  }, [callLogId, transcript]);

  useEffect(() => {
    if (!callLogId) return;
    if (transcriptSavedRef.current) return;
    if (status !== 'disconnected' && status !== 'error') return;
    saveTranscriptToServer(elapsedSeconds);
  }, [status, elapsedSeconds, callLogId, transcript, saveTranscriptToServer]);

  async function handleEndCall() {
    endCall();
    await saveTranscriptToServer(elapsedSeconds);

    // Redirect to call summary page if we have a callLogId
    if (callLogId) {
      router.push(`/call-summary/${callLogId}`);
    } else {
      router.push('/dashboard');
    }
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

  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
              {status === 'connected' && (
                <>
                  <span className="ml-4">
                    Connection:
                    <span className={`ml-2 inline-flex items-center gap-1 ${
                      connectionQuality === 'excellent' ? 'text-green-400' :
                      connectionQuality === 'good' ? 'text-yellow-400' :
                      connectionQuality === 'poor' ? 'text-red-400' :
                      'text-gray-400'
                    }`}>
                      <span className={`w-2 h-2 rounded-full ${
                        connectionQuality === 'excellent' ? 'bg-green-400' :
                        connectionQuality === 'good' ? 'bg-yellow-400' :
                        connectionQuality === 'poor' ? 'bg-red-400' :
                        'bg-gray-400'
                      } animate-pulse`}></span>
                      {connectionQuality}
                    </span>
                  </span>
                  <span className="ml-4">
                    Time: <span className="text-white font-mono">{formatTime(elapsedSeconds)}</span>
                    <span className="text-gray-500"> / {formatTime(maxDuration)}</span>
                    <span className="ml-4 text-gray-400">
                      Time left: <span className="text-white font-mono">{formatTime(timeRemaining)}</span>
                    </span>
                  </span>
                </>
              )}
            </p>
          </div>
          <button
            onClick={handleEndCall}
            aria-label="End call"
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
          >
            End Call
          </button>
        </div>
      </div>

      {/* Floating Time Warning */}
      {showTimeWarning && status === 'connected' && (
        <div className="fixed top-24 right-6 z-50 animate-pulse">
          <div className="bg-yellow-900/90 border-2 border-yellow-500 rounded-lg p-4 shadow-xl">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-yellow-100 font-semibold">Time Running Out!</p>
                <p className="text-yellow-200 text-sm">
                  {formatTime(timeRemaining)} remaining
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

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

          {/* Countdown Timer */}
          {status === 'connected' && (
            <div className="mt-6">
              <div className="relative inline-flex items-center justify-center">
                {/* SVG Circle Timer */}
                <svg className="w-32 h-32 transform -rotate-90">
                  {/* Background circle */}
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="#1f2937"
                    strokeWidth="8"
                    fill="none"
                  />
                  {/* Progress circle */}
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke={timeRemaining <= 30 ? '#ef4444' : '#00d9ff'}
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 56}`}
                    strokeDashoffset={`${2 * Math.PI * 56 * (1 - timeRemaining / maxDuration)}`}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                </svg>
                {/* Timer text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className={`text-3xl font-bold font-mono ${timeRemaining <= 30 ? 'text-red-400' : 'text-white'}`}>
                    {formatTime(timeRemaining)}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">remaining</div>
                </div>
              </div>
            </div>
          )}
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
                      ? 'bg-[#00d9ff]/10 border border-[#00d9ff]/30'
                      : 'bg-[#9d4edd]/10 border border-[#9d4edd]/30'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-semibold ${
                      item.role === 'user' ? 'text-[#00d9ff]' : 'text-[#9d4edd]'
                    }`}>
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
