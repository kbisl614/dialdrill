'use client';

import { motion } from 'framer-motion';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
}

interface AchievementBadgesProps {
  achievements: Achievement[];
}

export default function AchievementBadges({ achievements }: AchievementBadgesProps) {
  const getIconEmoji = (icon: string) => {
    const icons: Record<string, string> = {
      'first_call': '🎯',
      'ten_calls': '🔥',
      'perfect_score': '⭐',
      'week_warrior': '📅',
      'objection_master': '🛡️',
      'streak_3': '⚡',
      'streak_7': '💎',
      'high_closer': '💰'
    };
    return icons[icon] || '🏆';
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {achievements.map((achievement, index) => (
        <motion.div
          key={achievement.id}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.05 }}
          className={`relative rounded-xl border p-4 transition-all ${
            achievement.unlocked
              ? 'border-[#00d9ff]/50 bg-gradient-to-br from-[#00d9ff]/10 to-transparent shadow-[0_0_20px_rgba(0,217,255,0.3)]'
              : 'border-white/10 bg-white/[0.02] opacity-60'
          }`}
        >
          {achievement.unlocked && (
            <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-gradient-to-r from-[#00d9ff] to-[#00ffea] flex items-center justify-center">
              <svg className="h-4 w-4 text-[#080d1a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}

          <div className="text-center">
            <div className={`text-4xl mb-2 ${achievement.unlocked ? '' : 'grayscale opacity-50'}`}>
              {getIconEmoji(achievement.icon)}
            </div>
            <h4 className={`text-sm font-bold mb-1 ${achievement.unlocked ? 'text-white' : 'text-[#64748b]'}`}>
              {achievement.name}
            </h4>
            <p className="text-xs text-[#94a3b8] leading-relaxed">
              {achievement.description}
            </p>

            {!achievement.unlocked && achievement.progress !== undefined && achievement.maxProgress !== undefined && (
              <div className="mt-2">
                <div className="h-1.5 rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#00d9ff] to-[#00ffea]"
                    style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                  ></div>
                </div>
                <p className="text-xs text-[#64748b] mt-1">
                  {achievement.progress}/{achievement.maxProgress}
                </p>
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export function calculateAchievements(stats: {
  totalCalls: number;
  avgOverallScore: number;
  streak: number;
  bestScore: number;
  perfectScores: number;
}): Achievement[] {
  return [
    {
      id: 'first_call',
      name: 'First Call',
      description: 'Complete your first practice call',
      icon: 'first_call',
      unlocked: stats.totalCalls >= 1,
      progress: Math.min(stats.totalCalls, 1),
      maxProgress: 1
    },
    {
      id: 'ten_calls',
      name: 'Getting Started',
      description: 'Complete 10 practice calls',
      icon: 'ten_calls',
      unlocked: stats.totalCalls >= 10,
      progress: Math.min(stats.totalCalls, 10),
      maxProgress: 10
    },
    {
      id: 'perfect_score',
      name: 'Perfect Performance',
      description: 'Score 100% on any call',
      icon: 'perfect_score',
      unlocked: stats.bestScore >= 100,
      progress: stats.perfectScores,
      maxProgress: 1
    },
    {
      id: 'streak_3',
      name: '3-Day Streak',
      description: 'Practice 3 days in a row',
      icon: 'streak_3',
      unlocked: stats.streak >= 3,
      progress: Math.min(stats.streak, 3),
      maxProgress: 3
    },
    {
      id: 'streak_7',
      name: 'Week Warrior',
      description: 'Practice 7 days in a row',
      icon: 'streak_7',
      unlocked: stats.streak >= 7,
      progress: Math.min(stats.streak, 7),
      maxProgress: 7
    },
    {
      id: 'high_closer',
      name: 'High Closer',
      description: 'Average score above 80%',
      icon: 'high_closer',
      unlocked: stats.avgOverallScore >= 80,
      progress: Math.min(Math.round(stats.avgOverallScore), 80),
      maxProgress: 80
    },
    {
      id: 'objection_master',
      name: 'Objection Master',
      description: 'Handle 50+ objections',
      icon: 'objection_master',
      unlocked: stats.totalCalls >= 25, // Rough estimate: ~2 objections per call
      progress: Math.min(stats.totalCalls * 2, 50),
      maxProgress: 50
    },
    {
      id: 'improvement',
      name: 'Rapid Improvement',
      description: 'Improve 20+ points from first call',
      icon: 'streak_3',
      unlocked: false, // Would need first call vs current comparison
      progress: 0,
      maxProgress: 20
    }
  ];
}
