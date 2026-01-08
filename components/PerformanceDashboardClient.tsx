'use client';

import SkillRadarChart from './SkillRadarChart';
import StreakCounter from './StreakCounter';
import AchievementBadges, { calculateAchievements } from './AchievementBadges';
import { motion } from 'framer-motion';

interface PerformanceStats {
  totalCalls: number;
  avgOverallScore: number;
  avgCategoryScores: Record<string, number>;
  bestScore: number;
  worstScore: number;
  improvementPercentage: number;
  currentStreak: number;
  longestStreak: number;
  perfectScores: number;
}

interface PerformanceDashboardClientProps {
  initialStats: PerformanceStats;
}

export default function PerformanceDashboardClient({ initialStats }: PerformanceDashboardClientProps) {
  const achievements = calculateAchievements({
    totalCalls: initialStats.totalCalls,
    avgOverallScore: initialStats.avgOverallScore,
    streak: initialStats.currentStreak,
    bestScore: initialStats.bestScore,
    perfectScores: initialStats.perfectScores
  });

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
    <div className="space-y-8">
      {/* Top Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-[#1e293b]/50 bg-gradient-to-br from-[rgba(15,23,42,0.6)] to-[rgba(5,9,17,0.8)] p-6"
        >
          <p className="text-sm font-semibold text-[#94a3b8]">Total Calls</p>
          <p className="mt-2 text-4xl font-bold text-white tabular-nums">{initialStats.totalCalls}</p>
          <p className="mt-1 text-xs text-[#00d9ff]">Keep practicing! 🎯</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-[#1e293b]/50 bg-gradient-to-br from-[rgba(15,23,42,0.6)] to-[rgba(5,9,17,0.8)] p-6"
        >
          <p className="text-sm font-semibold text-[#94a3b8]">Average Score</p>
          <p className="mt-2 text-4xl font-bold text-white tabular-nums">{initialStats.avgOverallScore.toFixed(1)}%</p>
          {initialStats.improvementPercentage > 0 && (
            <p className="mt-1 text-xs text-green-400 flex items-center gap-1">
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              +{initialStats.improvementPercentage.toFixed(1)}% improvement
            </p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-[#1e293b]/50 bg-gradient-to-br from-[rgba(15,23,42,0.6)] to-[rgba(5,9,17,0.8)] p-6"
        >
          <p className="text-sm font-semibold text-[#94a3b8]">Personal Best</p>
          <p className="mt-2 text-4xl font-bold text-white tabular-nums">{initialStats.bestScore.toFixed(1)}%</p>
          {initialStats.bestScore >= 90 && (
            <p className="mt-1 text-xs text-[#00d9ff]">Excellent work! ⭐</p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl border border-[#1e293b]/50 bg-gradient-to-br from-[rgba(15,23,42,0.6)] to-[rgba(5,9,17,0.8)] p-6"
        >
          <p className="text-sm font-semibold text-[#94a3b8]">Achievements</p>
          <p className="mt-2 text-4xl font-bold text-white tabular-nums">
            {unlockedCount}/{achievements.length}
          </p>
          <p className="mt-1 text-xs text-[#94a3b8]">badges unlocked</p>
        </motion.div>
      </div>

      {/* Streak Counter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <StreakCounter
          currentStreak={initialStats.currentStreak}
          longestStreak={initialStats.longestStreak}
        />
      </motion.div>

      {/* Skill Radar Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="rounded-2xl border border-[#1e293b]/50 bg-gradient-to-br from-[rgba(15,23,42,0.6)] to-[rgba(5,9,17,0.8)] p-8"
      >
        <h2 className="text-2xl font-bold text-white mb-6">Skill Breakdown</h2>
        <SkillRadarChart categoryScores={initialStats.avgCategoryScores} maxScore={10} />

        {/* Recommendations */}
        <div className="mt-8 rounded-xl border border-[#00d9ff]/30 bg-[#00d9ff]/5 p-4">
          <h3 className="text-sm font-bold text-[#00d9ff] mb-2">💡 Focus Areas</h3>
          <ul className="space-y-1 text-sm text-[#94a3b8]">
            {Object.entries(initialStats.avgCategoryScores)
              .sort(([, a], [, b]) => a - b)
              .slice(0, 2)
              .map(([category, score]) => (
                <li key={category}>
                  • Work on <span className="text-white font-semibold">{category}</span> - currently at {score.toFixed(1)}/10
                </li>
              ))}
          </ul>
        </div>
      </motion.div>

      {/* Achievements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="rounded-2xl border border-[#1e293b]/50 bg-gradient-to-br from-[rgba(15,23,42,0.6)] to-[rgba(5,9,17,0.8)] p-8"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Achievements</h2>
          <span className="text-sm text-[#94a3b8]">
            {unlockedCount} of {achievements.length} unlocked
          </span>
        </div>
        <AchievementBadges achievements={achievements} />
      </motion.div>
    </div>
  );
}
