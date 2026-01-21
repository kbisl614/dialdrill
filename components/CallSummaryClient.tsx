'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import Link from 'next/link';
import CoachingInsightsPanel from './CoachingInsightsPanel';
import VoiceAnalyticsPanel from './VoiceAnalyticsPanel';

interface CallSummaryClientProps {
  summary: {
    callLog: {
      id: string;
      created_at: string;
      duration_seconds: number;
      personality_name: string;
      personality_description: string;
      transcript: Array<{ role: string; text: string; timestamp?: string }>;
    };
    score: {
      overall_score: number;
      category_scores: Array<{
        category: string;
        score: number;
        maxScore: number;
        signals: string[];
        feedback: {
          strengths: string[];
          improvements: string[];
        };
      }>;
    };
    gamification: {
      powerGained: number;
      badgesUnlocked: Array<{
        id: string;
        name: string;
        description: string;
        rarity: string;
      }>;
      beltUpgrade: {
        upgraded: boolean;
        previousBelt?: { tier: string; belt: string; color: string };
        newBelt?: { tier: string; belt: string; color: string };
      };
    };
  };
}

export default function CallSummaryClient({ summary }: CallSummaryClientProps) {
  const router = useRouter();
  const [showConfetti, setShowConfetti] = useState(false);
  const [animatedScore, setAnimatedScore] = useState(0);
  const [showBeltUpgrade, setShowBeltUpgrade] = useState(false);
  const [showPowerGained, setShowPowerGained] = useState(false);

  const { callLog, score, gamification } = summary;
  const hasBadges = gamification.badgesUnlocked.length > 0;
  const hasBeltUpgrade = gamification.beltUpgrade.upgraded;

  // Animate score counter
  useEffect(() => {
    const duration = 2000; // 2 seconds
    const steps = 60;
    const increment = score.overall_score / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= score.overall_score) {
        setAnimatedScore(score.overall_score);
        clearInterval(timer);
      } else {
        setAnimatedScore(current);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [score.overall_score]);

  // Show confetti for badges
  useEffect(() => {
    if (hasBadges) {
      setTimeout(() => setShowConfetti(true), 1500);
      setTimeout(() => setShowConfetti(false), 6000);
    }
  }, [hasBadges]);

  // Show belt upgrade animation
  useEffect(() => {
    if (hasBeltUpgrade) {
      setTimeout(() => setShowBeltUpgrade(true), 3000);
    }
  }, [hasBeltUpgrade]);

  // Show power gained animation
  useEffect(() => {
    setTimeout(() => setShowPowerGained(true), 500);
  }, []);

  const getScoreColor = (scoreValue: number) => {
    if (scoreValue >= 8) return 'from-green-500 to-emerald-600';
    if (scoreValue >= 6) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-rose-600';
  };

  const getCategoryColor = (percentage: number) => {
    if (percentage >= 80) return { bg: 'from-green-500/20 to-green-600/10', border: 'border-green-500/30', text: 'text-green-400' };
    if (percentage >= 60) return { bg: 'from-yellow-500/20 to-yellow-600/10', border: 'border-yellow-500/30', text: 'text-yellow-400' };
    return { bg: 'from-red-500/20 to-red-600/10', border: 'border-red-500/30', text: 'text-red-400' };
  };

  return (
    <div className="min-h-screen bg-[#080d1a] grid-background">
      {/* Confetti */}
      {showConfetti && (
        <Confetti
          width={typeof window !== 'undefined' ? window.innerWidth : 1000}
          height={typeof window !== 'undefined' ? window.innerHeight : 1000}
          recycle={false}
          numberOfPieces={500}
        />
      )}

      {/* Belt Upgrade Modal */}
      <AnimatePresence>
        {showBeltUpgrade && hasBeltUpgrade && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
            onClick={() => setShowBeltUpgrade(false)}
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ type: 'spring', duration: 0.8 }}
              className="rounded-3xl border-4 border-[#00d9ff] bg-gradient-to-br from-[#1A1F2E] to-[#0f1419] p-12 text-center shadow-2xl"
            >
              <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <h2 className="text-5xl font-extrabold text-white mb-6">🎉 Belt Upgraded! 🎉</h2>
                <div className="flex items-center justify-center gap-8 mb-6">
                  <div className="text-center">
                    <div className="text-sm text-[#9ca3af] mb-2">Previous</div>
                    <div className="text-2xl font-bold" style={{ color: gamification.beltUpgrade.previousBelt?.color }}>
                      {gamification.beltUpgrade.previousBelt?.tier} {gamification.beltUpgrade.previousBelt?.belt}
                    </div>
                  </div>
                  <div className="text-4xl">→</div>
                  <div className="text-center">
                    <div className="text-sm text-[#9ca3af] mb-2">New Belt</div>
                    <div className="text-3xl font-extrabold" style={{ color: gamification.beltUpgrade.newBelt?.color }}>
                      {gamification.beltUpgrade.newBelt?.tier} {gamification.beltUpgrade.newBelt?.belt}
                    </div>
                  </div>
                </div>
                <p className="text-[#9ca3af] text-sm">Click anywhere to continue</p>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-12 py-12">
        {/* Header */}
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-12 text-center"
        >
          <h1 className="text-5xl font-extrabold text-white mb-4">Call Complete!</h1>
          <p className="text-lg text-[#9ca3af]">
            {callLog.personality_name} • {Math.floor(callLog.duration_seconds / 60)}:{(callLog.duration_seconds % 60).toString().padStart(2, '0')}
          </p>
        </motion.div>

        {/* Score Card */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-12 rounded-3xl border border-white/10 bg-gradient-to-br from-[rgba(15,23,42,0.6)] to-[rgba(5,9,17,0.8)] p-12 text-center shadow-2xl backdrop-blur-xl"
        >
          <h2 className="text-2xl font-bold text-white mb-6">Overall Score</h2>
          <div className={`text-8xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r ${getScoreColor(score.overall_score)} mb-4`}>
            {animatedScore.toFixed(1)}
            <span className="text-4xl text-[#9ca3af]">/10</span>
          </div>

          {/* Power Gained */}
          <AnimatePresence>
            {showPowerGained && (
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -50, opacity: 0 }}
                className="inline-block"
              >
                <div className="rounded-full bg-gradient-to-r from-[#00d9ff] to-[#9d4edd] px-6 py-3 text-xl font-bold text-white shadow-lg">
                  +{gamification.powerGained} Power
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Badges Unlocked */}
        {hasBadges && (
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mb-12 rounded-3xl border border-[#00d9ff]/30 bg-gradient-to-r from-[#00d9ff]/10 to-[#9d4edd]/10 p-8"
          >
            <h3 className="text-2xl font-bold text-white mb-6 text-center">🏆 Badges Unlocked!</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {gamification.badgesUnlocked.map((badge, index) => (
                <motion.div
                  key={badge.id}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.6 + index * 0.2, type: 'spring' }}
                  className="rounded-xl border border-white/20 bg-white/[0.05] p-6 text-center"
                >
                  <div className="text-4xl mb-3">🏅</div>
                  <h4 className="text-lg font-bold text-white mb-2">{badge.name}</h4>
                  <p className="text-sm text-[#9ca3af]">{badge.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Category Breakdown */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mb-12"
        >
          <h3 className="text-2xl font-bold text-white mb-6">Category Breakdown</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {score.category_scores.map((category, index) => {
              const percentage = (category.score / category.maxScore) * 100;
              const colors = getCategoryColor(percentage);

              return (
                <motion.div
                  key={category.category}
                  initial={{ x: -30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  className={`rounded-xl border bg-gradient-to-br p-6 ${colors.border} ${colors.bg}`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-bold text-white capitalize">
                      {category.category.replace(/([A-Z])/g, ' $1').trim()}
                    </h4>
                    <span className={`text-2xl font-bold ${colors.text}`}>
                      {category.score}/{category.maxScore}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4 h-3 w-full rounded-full bg-white/10 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ delay: 1 + index * 0.1, duration: 1 }}
                      className="h-full rounded-full bg-gradient-to-r from-[#00d9ff] to-[#9d4edd]"
                    />
                  </div>

                  {/* Feedback */}
                  <div className="space-y-2">
                    {category.feedback.strengths.map((strength, i) => (
                      <p key={`strength-${i}`} className="text-xs text-green-300">
                        ✓ {strength}
                      </p>
                    ))}
                    {category.feedback.improvements.map((improvement, i) => (
                      <p key={`improvement-${i}`} className="text-xs text-yellow-300">
                        → {improvement}
                      </p>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* AI Coaching Insights - Phase 3 */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.0 }}
          className="mb-12"
        >
          <CoachingInsightsPanel callLogId={callLog.id} />
        </motion.div>

        {/* Voice Analytics - Phase 3 */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.1 }}
          className="mb-12"
        >
          <VoiceAnalyticsPanel callLogId={callLog.id} />
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#00d9ff] to-[#00ffea] px-8 py-4 text-lg font-semibold text-[#080d1a] transition hover:scale-105 hover:shadow-[0_0_30px_rgba(0,217,255,0.5)] shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </Link>
          <button
            onClick={() => router.push('/dashboard')}
            className="rounded-full bg-white/10 hover:bg-white/20 border border-white/20 px-8 py-4 text-lg font-semibold text-white transition hover:scale-105"
          >
            Practice Again
          </button>
          <Link
            href={`/history#call-${callLog.id}`}
            className="rounded-full border border-white/20 px-8 py-4 text-lg font-semibold text-white transition hover:bg-white/10 text-center"
          >
            View Full Transcript
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
