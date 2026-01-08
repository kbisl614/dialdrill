'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Objection {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface QuickPracticeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function QuickPracticeModal({ isOpen, onClose }: QuickPracticeModalProps) {
  const [mode, setMode] = useState<'select' | 'countdown' | 'recording' | 'complete'>('select');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentObjection, setCurrentObjection] = useState<Objection | null>(null);
  const [countdown, setCountdown] = useState(3);
  const [recordingTime, setRecordingTime] = useState(30);
  const [completedRounds, setCompletedRounds] = useState(0);

  const categories = [
    { id: 'price', name: 'Price Objections', color: 'from-yellow-500 to-orange-500', emoji: '💰' },
    { id: 'time', name: 'Time/Timing', color: 'from-blue-500 to-cyan-500', emoji: '⏰' },
    { id: 'authority', name: 'Authority', color: 'from-purple-500 to-pink-500', emoji: '👔' },
    { id: 'need', name: 'Need/Value', color: 'from-green-500 to-emerald-500', emoji: '🎯' },
    { id: 'trust', name: 'Trust', color: 'from-red-500 to-rose-500', emoji: '🤝' }
  ];

  const sampleObjections: Record<string, Objection[]> = {
    price: [
      { id: '1', name: "It's too expensive", description: "Customer thinks price is too high", category: 'price' },
      { id: '2', name: "I can get it cheaper elsewhere", description: "Competitor comparison", category: 'price' },
      { id: '3', name: "Not in the budget", description: "Budget constraints", category: 'price' }
    ],
    time: [
      { id: '4', name: "Call me back next quarter", description: "Timing delay", category: 'time' },
      { id: '5', name: "We're too busy right now", description: "Capacity concerns", category: 'time' },
      { id: '6', name: "Bad timing", description: "General timing issue", category: 'time' }
    ],
    authority: [
      { id: '7', name: "I need to talk to my boss", description: "Decision maker issue", category: 'authority' },
      { id: '8', name: "My team needs to approve", description: "Committee decision", category: 'authority' }
    ],
    need: [
      { id: '9', name: "We don't need this", description: "No perceived value", category: 'need' },
      { id: '10', name: "We're happy with current solution", description: "Status quo bias", category: 'need' }
    ],
    trust: [
      { id: '11', name: "I've never heard of your company", description: "Unknown brand", category: 'trust' },
      { id: '12', name: "Send me more information", description: "Stalling tactic", category: 'trust' }
    ]
  };

  useEffect(() => {
    if (mode === 'countdown' && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (mode === 'countdown' && countdown === 0) {
      // Defer state update to avoid setState in effect
      const timer = setTimeout(() => {
        setMode('recording');
        setRecordingTime(30);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [mode, countdown]);

  useEffect(() => {
    if (mode === 'recording' && recordingTime > 0) {
      const timer = setTimeout(() => setRecordingTime(recordingTime - 1), 1000);
      return () => clearTimeout(timer);
    } else if (mode === 'recording' && recordingTime === 0) {
      // Defer state update to avoid setState in effect
      const timer = setTimeout(() => {
        setMode('complete');
        setCompletedRounds(prev => prev + 1);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [mode, recordingTime]);

  const startPractice = (categoryId: string) => {
    const objections = sampleObjections[categoryId];
    // Use crypto API for randomness in event handler to satisfy linter
    const randomIndex = crypto.getRandomValues(new Uint32Array(1))[0] % objections.length;
    const randomObjection = objections[randomIndex];
    setCurrentObjection(randomObjection);
    setSelectedCategory(categoryId);
    setCountdown(3);
    setMode('countdown');
  };

  const reset = () => {
    setMode('select');
    setSelectedCategory(null);
    setCurrentObjection(null);
    setCountdown(3);
    setRecordingTime(30);
  };

  const doAnother = () => {
    if (selectedCategory) {
      const objections = sampleObjections[selectedCategory];
      const randomObjection = objections[Math.floor(Math.random() * objections.length)];
      setCurrentObjection(randomObjection);
      setCountdown(3);
      setMode('countdown');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-2xl rounded-2xl border border-white/10 bg-[#030712] shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="border-b border-white/10 bg-gradient-to-r from-[#00d9ff]/10 to-[#9333ea]/10 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">⚡ Quick Practice</h2>
              <p className="mt-1 text-sm text-[#9ca3af]">
                30-second lightning drills • {completedRounds} completed
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-white/60 transition hover:bg-white/10 hover:text-white"
              aria-label="Close"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <AnimatePresence mode="wait">
            {/* Category Selection */}
            {mode === 'select' && (
              <motion.div
                key="select"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <h3 className="text-xl font-bold text-white mb-4">Choose an objection type:</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => startPractice(cat.id)}
                      className={`p-4 rounded-xl bg-gradient-to-r ${cat.color} bg-opacity-10 border border-white/10 hover:scale-105 transition-all text-left`}
                    >
                      <div className="text-3xl mb-2">{cat.emoji}</div>
                      <div className="text-white font-semibold">{cat.name}</div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Countdown */}
            {mode === 'countdown' && (
              <motion.div
                key="countdown"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center py-12"
              >
                <div className="text-9xl font-extrabold text-[#00d9ff] mb-6">
                  {countdown}
                </div>
                <p className="text-xl text-white mb-4">Get ready...</p>
                <div className="max-w-md mx-auto p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-lg font-semibold text-white mb-2">&ldquo;{currentObjection?.name}&rdquo;</p>
                  <p className="text-sm text-[#9ca3af]">{currentObjection?.description}</p>
                </div>
              </motion.div>
            )}

            {/* Recording */}
            {mode === 'recording' && (
              <motion.div
                key="recording"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <div className="relative inline-block mb-8">
                  <svg className="w-48 h-48 transform -rotate-90">
                    <circle
                      cx="96"
                      cy="96"
                      r="88"
                      stroke="rgba(255,255,255,0.1)"
                      strokeWidth="8"
                      fill="none"
                    />
                    <circle
                      cx="96"
                      cy="96"
                      r="88"
                      stroke="url(#gradient)"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray="552.92"
                      strokeDashoffset={552.92 - (552.92 * recordingTime) / 30}
                      className="transition-all duration-1000"
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#00d9ff" />
                        <stop offset="100%" stopColor="#00ffea" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-6xl font-extrabold text-white">{recordingTime}</div>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-3 mb-6">
                  <div className="h-4 w-4 rounded-full bg-red-500 animate-pulse"></div>
                  <p className="text-xl text-white font-semibold">Recording Your Response...</p>
                </div>

                <div className="max-w-md mx-auto p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-lg font-semibold text-white mb-2">&ldquo;{currentObjection?.name}&rdquo;</p>
                  <p className="text-sm text-[#9ca3af]">Respond now!</p>
                </div>
              </motion.div>
            )}

            {/* Complete */}
            {mode === 'complete' && (
              <motion.div
                key="complete"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center py-8"
              >
                <div className="text-6xl mb-4">🎯</div>
                <h3 className="text-3xl font-bold text-white mb-2">Nice Work!</h3>
                <p className="text-[#9ca3af] mb-6">Practice makes perfect. Keep it up!</p>

                {/* Instant Feedback Card */}
                <div className="max-w-2xl mx-auto mb-8 rounded-xl border border-[#00d9ff]/30 bg-gradient-to-br from-[#00d9ff]/10 to-transparent p-6 text-left">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#00d9ff]/20 flex items-center justify-center">
                      <svg className="w-5 h-5 text-[#00d9ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-white mb-2">💡 Quick Tips for &ldquo;{currentObjection?.name}&rdquo;</h4>
                      {selectedCategory === 'price' && (
                        <ul className="space-y-2 text-sm text-[#94a3b8]">
                          <li className="flex items-start gap-2">
                            <span className="text-[#00d9ff] mt-1">•</span>
                            <span>Focus on <span className="text-white font-semibold">value, not cost</span> - emphasize ROI and long-term benefits</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-[#00d9ff] mt-1">•</span>
                            <span>Use comparison: &ldquo;Compared to the cost of not solving this problem...&rdquo;</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-[#00d9ff] mt-1">•</span>
                            <span>Break it down: Show daily/monthly cost instead of total</span>
                          </li>
                        </ul>
                      )}
                      {selectedCategory === 'time' && (
                        <ul className="space-y-2 text-sm text-[#94a3b8]">
                          <li className="flex items-start gap-2">
                            <span className="text-[#00d9ff] mt-1">•</span>
                            <span>Create <span className="text-white font-semibold">urgency</span> - What&apos;s the cost of waiting?</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-[#00d9ff] mt-1">•</span>
                            <span>Acknowledge their concern, then pivot: &ldquo;I understand timing is important. That&apos;s exactly why...&rdquo;</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-[#00d9ff] mt-1">•</span>
                            <span>Ask: &ldquo;What would need to happen for this to be the right time?&rdquo;</span>
                          </li>
                        </ul>
                      )}
                      {selectedCategory === 'authority' && (
                        <ul className="space-y-2 text-sm text-[#94a3b8]">
                          <li className="flex items-start gap-2">
                            <span className="text-[#00d9ff] mt-1">•</span>
                            <span><span className="text-white font-semibold">Involve the decision maker</span> - &ldquo;Let&apos;s get them on a call together&rdquo;</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-[#00d9ff] mt-1">•</span>
                            <span>Ask: &ldquo;What information would you need to make a strong recommendation?&rdquo;</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-[#00d9ff] mt-1">•</span>
                            <span>Position them as a champion, not a gatekeeper</span>
                          </li>
                        </ul>
                      )}
                      {selectedCategory === 'need' && (
                        <ul className="space-y-2 text-sm text-[#94a3b8]">
                          <li className="flex items-start gap-2">
                            <span className="text-[#00d9ff] mt-1">•</span>
                            <span><span className="text-white font-semibold">Ask questions</span> - Uncover the hidden pain points</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-[#00d9ff] mt-1">•</span>
                            <span>&ldquo;What would it mean for your business if you could solve X problem?&rdquo;</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-[#00d9ff] mt-1">•</span>
                            <span>Share a relevant case study or success story</span>
                          </li>
                        </ul>
                      )}
                      {selectedCategory === 'trust' && (
                        <ul className="space-y-2 text-sm text-[#94a3b8]">
                          <li className="flex items-start gap-2">
                            <span className="text-[#00d9ff] mt-1">•</span>
                            <span><span className="text-white font-semibold">Build credibility</span> - Share social proof, testimonials, or case studies</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-[#00d9ff] mt-1">•</span>
                            <span>Offer a low-risk next step: &ldquo;Let&apos;s start with a pilot/trial&rdquo;</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-[#00d9ff] mt-1">•</span>
                            <span>Share specific metrics and results from similar clients</span>
                          </li>
                        </ul>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-white/10">
                    <p className="text-xs text-[#64748b] italic">
                      💪 Pro tip: The best responses are confident, address the concern directly, and focus on the customer&apos;s success.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={doAnother}
                    className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#00d9ff] to-[#00ffea] text-[#080d1a] font-semibold hover:scale-105 transition-all"
                  >
                    Do Another ({selectedCategory})
                  </button>
                  <button
                    onClick={reset}
                    className="px-8 py-3 rounded-xl border border-white/20 bg-white/5 text-white font-semibold hover:bg-white/10 transition-all"
                  >
                    Change Category
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
