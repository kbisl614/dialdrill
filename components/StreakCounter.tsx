'use client';

import { motion } from 'framer-motion';

interface StreakCounterProps {
  currentStreak: number;
  longestStreak: number;
}

export default function StreakCounter({ currentStreak, longestStreak }: StreakCounterProps) {
  const getStreakEmoji = (streak: number) => {
    if (streak >= 30) return '🔥🏆';
    if (streak >= 14) return '🔥💎';
    if (streak >= 7) return '🔥⚡';
    if (streak >= 3) return '🔥';
    return '📅';
  };

  const getStreakMessage = (streak: number) => {
    if (streak === 0) return "Start your streak today!";
    if (streak === 1) return "Great start! Come back tomorrow!";
    if (streak < 3) return "Keep it going!";
    if (streak < 7) return "You're on fire!";
    if (streak < 14) return "Incredible dedication!";
    if (streak < 30) return "Unstoppable!";
    return "Legend status! 🎯";
  };

  return (
    <div className="rounded-2xl border border-[var(--color-border-subtle)]/50 bg-gradient-to-br from-[rgba(255,123,0,0.05)] to-[rgba(15,23,42,0.6)] p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/10 to-transparent rounded-full blur-3xl"></div>

      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">Practice Streak</h3>
          <span className="text-3xl">{getStreakEmoji(currentStreak)}</span>
        </div>

        <motion.div
          key={currentStreak}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mb-2"
        >
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-extrabold text-white tabular-nums">
              {currentStreak}
            </span>
            <span className="text-xl text-[var(--color-text-secondary)]">
              {currentStreak === 1 ? 'day' : 'days'}
            </span>
          </div>
        </motion.div>

        <p className="text-sm text-[var(--color-cyan-bright)] font-semibold mb-4">
          {getStreakMessage(currentStreak)}
        </p>

        {longestStreak > 0 && (
          <div className="pt-4 border-t border-white/10">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--color-text-secondary)]">Longest streak:</span>
              <span className="text-white font-bold">
                {longestStreak} {longestStreak === 1 ? 'day' : 'days'}
              </span>
            </div>
            {currentStreak === longestStreak && currentStreak > 0 && (
              <p className="text-xs text-green-400 mt-1">🎉 Personal best!</p>
            )}
          </div>
        )}

        {/* Visual streak indicator */}
        <div className="mt-4 flex gap-1">
          {Array.from({ length: Math.min(currentStreak, 30) }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.02 }}
              className={`h-2 flex-1 rounded-full ${
                i < 7 ? 'bg-gradient-to-r from-orange-500 to-red-500' :
                i < 14 ? 'bg-gradient-to-r from-purple-500 to-pink-500' :
                'bg-gradient-to-r from-[var(--color-cyan-bright)] to-[#00ffea]'
              }`}
            ></motion.div>
          ))}
          {currentStreak > 30 && (
            <div className="text-xs text-[var(--color-cyan-bright)] font-bold">+{currentStreak - 30}</div>
          )}
        </div>
      </div>
    </div>
  );
}
