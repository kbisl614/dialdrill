import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { pool } from '@/lib/db';
import Sidebar from '@/components/Sidebar';
import Link from 'next/link';

interface CategoryScore {
  category: string;
  score: number;
  maxScore: number;
}

interface CallScoreSummary {
  callLogId: string;
  createdAt: string;
  overallScore: number;
  categoryScores: CategoryScore[];
  personalityName: string | null;
  personalityIsBoss: boolean | null;
}

interface PerformanceStats {
  totalCalls: number;
  avgOverallScore: number;
  avgCategoryScores: Record<string, number>;
  recentCalls: CallScoreSummary[];
  improvementTrend: 'up' | 'down' | 'stable';
}

async function getPerformanceStats(userId: string): Promise<PerformanceStats> {
  // Get all scored calls for user
  const result = await pool().query(
    `SELECT
        cs.call_log_id,
        cs.overall_score,
        cs.category_scores,
        cl.created_at,
        p.name AS personality_name,
        p.is_boss AS personality_is_boss
     FROM call_scores cs
     INNER JOIN call_logs cl ON cs.call_log_id = cl.id
     INNER JOIN users u ON cl.user_id = u.id
     LEFT JOIN personalities p ON cl.personality_id = p.id
     WHERE u.clerk_id = $1
     ORDER BY cl.created_at DESC
     LIMIT 50`,
    [userId]
  );

  const calls: CallScoreSummary[] = result.rows.map((row) => ({
    callLogId: row.call_log_id,
    createdAt: row.created_at,
    overallScore: parseFloat(row.overall_score),
    categoryScores: row.category_scores,
    personalityName: row.personality_name,
    personalityIsBoss: row.personality_is_boss
  }));

  if (calls.length === 0) {
    return {
      totalCalls: 0,
      avgOverallScore: 0,
      avgCategoryScores: {},
      recentCalls: [],
      improvementTrend: 'stable'
    };
  }

  // Calculate average overall score
  const avgOverallScore =
    calls.reduce((sum, call) => sum + call.overallScore, 0) / calls.length;

  // Calculate average category scores
  const categoryTotals: Record<string, { sum: number; count: number }> = {};

  for (const call of calls) {
    for (const cat of call.categoryScores) {
      if (!categoryTotals[cat.category]) {
        categoryTotals[cat.category] = { sum: 0, count: 0 };
      }
      categoryTotals[cat.category].sum += cat.score;
      categoryTotals[cat.category].count += 1;
    }
  }

  const avgCategoryScores: Record<string, number> = {};
  for (const [category, data] of Object.entries(categoryTotals)) {
    avgCategoryScores[category] = data.sum / data.count;
  }

  // Determine improvement trend (compare first 5 vs last 5 calls)
  let improvementTrend: 'up' | 'down' | 'stable' = 'stable';
  if (calls.length >= 10) {
    const recent5 = calls.slice(0, 5);
    const older5 = calls.slice(-5);

    const recentAvg =
      recent5.reduce((sum, c) => sum + c.overallScore, 0) / recent5.length;
    const olderAvg =
      older5.reduce((sum, c) => sum + c.overallScore, 0) / older5.length;

    const diff = recentAvg - olderAvg;
    if (diff > 0.5) improvementTrend = 'up';
    else if (diff < -0.5) improvementTrend = 'down';
  }

  return {
    totalCalls: calls.length,
    avgOverallScore: Math.round(avgOverallScore * 10) / 10,
    avgCategoryScores,
    recentCalls: calls.slice(0, 10),
    improvementTrend
  };
}

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
}

function getCategoryDisplayName(category: string): string {
  const map: Record<string, string> = {
    opening: 'Opening',
    discovery: 'Discovery',
    objectionHandling: 'Objection Handling',
    clarity: 'Clarity',
    closing: 'Closing'
  };
  return map[category] || category;
}

export default async function PerformancePage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/');
  }

  const stats = await getPerformanceStats(userId);

  return (
    <>
      <Sidebar />
      <main className="min-h-screen bg-[#080d1a] grid-background lg:pl-64">
        <section className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-12 py-12 sm:py-16">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-extrabold text-white sm:text-5xl">Performance Dashboard</h1>
          <p className="mt-4 text-lg text-[#94a3b8]">
            Track your progress and identify areas for improvement.
          </p>
        </div>

        {stats.totalCalls === 0 ? (
          <div className="rounded-3xl border border-[#1e293b]/50 bg-white/[0.02] p-12 text-center text-[#94a3b8]">
            <p className="text-xl font-semibold text-white mb-2">No scored calls yet</p>
            <p>Complete a practice call to see your performance metrics here.</p>
            <Link
              href="/dashboard"
              className="mt-6 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#06d9d7] to-[#05c4c2] px-8 py-3 text-sm font-semibold text-[#080d1a] transition hover:scale-105"
            >
              Start Practicing
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Overall Stats */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-3xl border border-[#1e293b]/50 bg-gradient-to-br from-[rgba(15,23,42,0.6)] to-[rgba(5,9,17,0.8)] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.7),0_0_40px_rgba(6,217,215,0.08)]">
                <p className="text-sm font-semibold text-[#94a3b8]">Total Calls Scored</p>
                <p className="mt-2 text-4xl font-bold text-white">{stats.totalCalls}</p>
              </div>

              <div className="rounded-3xl border border-[#1e293b]/50 bg-gradient-to-br from-[rgba(15,23,42,0.6)] to-[rgba(5,9,17,0.8)] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.7),0_0_40px_rgba(6,217,215,0.08)]">
                <p className="text-sm font-semibold text-[#94a3b8]">Average Score</p>
                <p className="mt-2 text-4xl font-bold text-white">
                  {stats.avgOverallScore}
                  <span className="text-2xl text-[#94a3b8]">/10</span>
                </p>
              </div>

              <div className="rounded-3xl border border-[#1e293b]/50 bg-gradient-to-br from-[rgba(15,23,42,0.6)] to-[rgba(5,9,17,0.8)] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.7),0_0_40px_rgba(6,217,215,0.08)]">
                <p className="text-sm font-semibold text-[#94a3b8]">Trend</p>
                <div className="mt-2 flex items-center gap-2">
                  {stats.improvementTrend === 'up' && (
                    <>
                      <span className="text-4xl">↗</span>
                      <span className="text-2xl font-bold text-green-400">Improving</span>
                    </>
                  )}
                  {stats.improvementTrend === 'down' && (
                    <>
                      <span className="text-4xl">↘</span>
                      <span className="text-2xl font-bold text-red-400">Declining</span>
                    </>
                  )}
                  {stats.improvementTrend === 'stable' && (
                    <>
                      <span className="text-4xl">→</span>
                      <span className="text-2xl font-bold text-yellow-400">Stable</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="rounded-3xl border border-[#1e293b]/50 bg-gradient-to-br from-[rgba(15,23,42,0.6)] to-[rgba(5,9,17,0.8)] p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.7),0_0_40px_rgba(6,217,215,0.08)]">
              <h2 className="text-2xl font-bold text-white mb-6">Average Scores by Category</h2>
              <div className="space-y-4">
                {Object.entries(stats.avgCategoryScores)
                  .sort(([, a], [, b]) => b - a)
                  .map(([category, avgScore]) => {
                    const scorePercent = (avgScore / 10) * 100;
                    const barColor =
                      scorePercent >= 80
                        ? 'bg-green-500'
                        : scorePercent >= 60
                        ? 'bg-yellow-500'
                        : 'bg-red-500';
                    const textColor =
                      scorePercent >= 80
                        ? 'text-green-400'
                        : scorePercent >= 60
                        ? 'text-yellow-400'
                        : 'text-red-400';

                    return (
                      <div key={category}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-white">
                            {getCategoryDisplayName(category)}
                          </span>
                          <span className={`text-lg font-bold ${textColor}`}>
                            {Math.round(avgScore * 10) / 10}/10
                          </span>
                        </div>
                        <div className="h-3 rounded-full bg-white/10">
                          <div
                            className={`h-full rounded-full ${barColor} transition-all duration-500`}
                            style={{ width: `${scorePercent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Recent Calls */}
            <div className="rounded-3xl border border-[#1e293b]/50 bg-gradient-to-br from-[rgba(15,23,42,0.6)] to-[rgba(5,9,17,0.8)] p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.7),0_0_40px_rgba(6,217,215,0.08)]">
              <h2 className="text-2xl font-bold text-white mb-6">Recent Calls</h2>
              <div className="space-y-3">
                {stats.recentCalls.map((call) => {
                  const scoreColor =
                    call.overallScore >= 8
                      ? 'text-green-400'
                      : call.overallScore >= 6
                      ? 'text-yellow-400'
                      : 'text-red-400';

                  return (
                    <Link
                      key={call.callLogId}
                      href="/history"
                      className="block rounded-xl border border-[#1e293b]/50 bg-white/[0.03] p-4 transition hover:bg-white/[0.06] hover:border-[#334155]"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-white">
                            {call.personalityName || 'Unknown'}
                            {call.personalityIsBoss && (
                              <span className="ml-2 rounded-full border border-[#a855f7]/30 bg-[#a855f7]/10 px-2 py-0.5 text-xs text-[#d8b4fe]">
                                Boss
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-[#94a3b8]">{formatTimestamp(call.createdAt)}</p>
                        </div>
                        <div className={`text-2xl font-bold ${scoreColor}`}>
                          {call.overallScore}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        )}
        </section>
      </main>
    </>
  );
}
