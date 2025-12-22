import { auth } from '@clerk/nextjs/server';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { pool } from '@/lib/db';

interface TranscriptEntry {
  role: 'user' | 'agent';
  text: string;
  timestamp?: string | null;
}

interface CategoryScore {
  category: string;
  score: number;
  maxScore: number;
  signals: string[];
  feedback: {
    strengths: string[];
    improvements: string[];
  };
}

interface CallScore {
  overallScore: number;
  categoryScores: CategoryScore[];
}

interface TriggeredObjection {
  id: string;
  name: string;
  industry: string;
  category: string;
  description: string;
  triggeredAt: string;
  responseSnippet: string;
}

interface CallHistoryItem {
  id: string;
  createdAt: string;
  durationSeconds: number | null;
  tokensUsed: number | null;
  overageCharge: string | null;
  personalityName: string | null;
  personalityDescription: string | null;
  personalityIsBoss: boolean | null;
  transcript: TranscriptEntry[];
  score: CallScore | null;
  objections: TriggeredObjection[];
}

async function getCallHistory(userId: string): Promise<CallHistoryItem[]> {
  const result = await pool().query(
    `SELECT
        cl.id,
        cl.created_at,
        cl.duration_seconds,
        cl.tokens_used,
        cl.overage_charge,
        cl.transcript,
        p.name AS personality_name,
        p.description AS personality_description,
        p.is_boss AS personality_is_boss,
        cs.overall_score,
        cs.category_scores
     FROM call_logs cl
     INNER JOIN users u ON cl.user_id = u.id
     LEFT JOIN personalities p ON cl.personality_id = p.id
     LEFT JOIN call_scores cs ON cl.id = cs.call_log_id
     WHERE u.clerk_id = $1
     ORDER BY cl.created_at DESC
     LIMIT 50`,
    [userId]
  );

  // For each call, fetch triggered objections
  const callsWithObjections = await Promise.all(
    result.rows.map(async (row) => {
      const objectionsResult = await pool().query(
        `SELECT
          ol.id,
          ol.name,
          ol.industry,
          ol.category,
          ol.description,
          co.triggered_at,
          co.response_snippet
         FROM call_objections co
         INNER JOIN objection_library ol ON co.objection_id = ol.id
         WHERE co.call_log_id = $1
         ORDER BY co.created_at`,
        [row.id]
      );

      const objections: TriggeredObjection[] = objectionsResult.rows.map(obj => ({
        id: obj.id,
        name: obj.name,
        industry: obj.industry,
        category: obj.category,
        description: obj.description,
        triggeredAt: obj.triggered_at,
        responseSnippet: obj.response_snippet
      }));

      return { ...row, objections };
    })
  );

  return callsWithObjections.map((row) => {
    let transcript: TranscriptEntry[] = [];
    if (Array.isArray(row.transcript)) {
      transcript = row.transcript as TranscriptEntry[];
    } else if (row.transcript) {
      try {
        transcript = JSON.parse(row.transcript);
      } catch {
        transcript = [];
      }
    }

    let score: CallScore | null = null;
    if (row.overall_score !== null && row.category_scores) {
      score = {
        overallScore: parseFloat(row.overall_score),
        categoryScores: row.category_scores
      };
    }

    return {
      id: row.id,
      createdAt: row.created_at,
      durationSeconds: row.duration_seconds,
      tokensUsed: row.tokens_used,
      overageCharge: row.overage_charge,
      personalityName: row.personality_name,
      personalityDescription: row.personality_description,
      personalityIsBoss: row.personality_is_boss,
      transcript,
      score,
      objections: row.objections
    };
  });
}

function formatDuration(seconds: number | null): string {
  if (seconds === null || seconds === undefined) return '—';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs.toString().padStart(2, '0')}s`;
}

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default async function HistoryPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/');
  }

  const calls = await getCallHistory(userId);

  return (
    <main className="min-h-screen bg-[#080d1a] grid-background">
      <header className="border-b border-[#1e293b]/50 bg-[#080d1a]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-12">
          <div className="flex h-20 items-center justify-between">
            <Link href="/dashboard" className="text-2xl font-extrabold text-white hover:opacity-80 transition-opacity">
              Dial<span className="text-[#0f9b99]">Drill</span>
            </Link>
            <Link
              href="/dashboard"
              className="text-sm font-semibold text-[#94a3b8] transition-colors hover:text-white"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-12 py-12 sm:py-16">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-extrabold text-white sm:text-5xl">Call History</h1>
          <p className="mt-4 text-lg text-[#94a3b8]">
            Review transcripts, durations, and minutes used from your recent practice calls.
          </p>
        </div>

        {calls.length === 0 ? (
          <div className="rounded-3xl border border-[#1e293b]/50 bg-white/[0.02] p-12 text-center text-[#94a3b8]">
            <p className="text-xl font-semibold text-white mb-2">No calls yet</p>
            <p>Once you complete a call, the transcript and summary will appear here.</p>
            <Link
              href="/dashboard"
              className="mt-6 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#06d9d7] to-[#05c4c2] px-8 py-3 text-sm font-semibold text-[#080d1a] transition hover:scale-105"
            >
              Start Practicing
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {calls.map((call) => {
              const minutesUsed =
                typeof call.tokensUsed === 'number' && call.tokensUsed > 0
                  ? Math.ceil(call.tokensUsed / 1000)
                  : call.durationSeconds !== null && call.durationSeconds !== undefined
                  ? Math.max(1, Math.ceil(call.durationSeconds / 60))
                  : null;
              const minutesLabel =
                minutesUsed !== null
                  ? `${minutesUsed} ${minutesUsed === 1 ? 'minute' : 'minutes'} used`
                  : 'Minutes not recorded';
              const overageLabel =
                call.overageCharge && Number(call.overageCharge) > 0
                  ? `$${Number(call.overageCharge).toFixed(2)} overage billed`
                  : null;

              return (
                <div
                  key={call.id}
                  className="rounded-3xl border border-[#1e293b]/50 bg-gradient-to-br from-[rgba(15,23,42,0.6)] to-[rgba(5,9,17,0.8)] p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.7),0_0_40px_rgba(6,217,215,0.08)] backdrop-blur-xl transition-all duration-300 hover:shadow-[0_20px_80px_rgba(0,0,0,0.8),0_0_60px_rgba(6,217,215,0.12)] hover:border-[#334155]"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-[#94a3b8]">{formatTimestamp(call.createdAt)}</p>
                      <h2 className="text-xl sm:text-2xl font-bold text-white">
                        {call.personalityName || 'Unknown personality'}
                        {call.personalityIsBoss && (
                          <span className="ml-2 sm:ml-3 rounded-full border border-[#a855f7]/30 bg-[#a855f7]/10 px-2 sm:px-3 py-1 text-xs font-semibold text-[#d8b4fe]">
                            Boss
                          </span>
                        )}
                      </h2>
                      {call.personalityDescription && (
                        <p className="mt-1 text-sm text-[#94a3b8]">{call.personalityDescription}</p>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                      <span className="rounded-full border border-[#1e293b]/50 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-white/80">
                        Duration: {formatDuration(call.durationSeconds)}
                      </span>
                      <span className="rounded-full border border-[#1e293b]/50 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-white/80">
                        {minutesLabel}
                      </span>
                      {overageLabel && (
                        <span className="rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-yellow-300">
                          {overageLabel}
                        </span>
                      )}
                    </div>
                  </div>

                  {call.score && (
                    <div className="mt-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-white">Call Score</h3>
                        <div className="text-3xl font-bold text-white">
                          {call.score.overallScore}
                          <span className="text-lg text-[#94a3b8]">/10</span>
                        </div>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {call.score.categoryScores.map((cat) => {
                          const scorePercent = (cat.score / cat.maxScore) * 100;
                          const colorClass =
                            scorePercent >= 80
                              ? 'from-green-500/20 to-green-600/10 border-green-500/30'
                              : scorePercent >= 60
                              ? 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/30'
                              : 'from-red-500/20 to-red-600/10 border-red-500/30';
                          const textColorClass =
                            scorePercent >= 80
                              ? 'text-green-400'
                              : scorePercent >= 60
                              ? 'text-yellow-400'
                              : 'text-red-400';

                          return (
                            <div
                              key={cat.category}
                              className={`rounded-xl border bg-gradient-to-br p-4 ${colorClass}`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-semibold text-white capitalize">
                                  {cat.category === 'objectionHandling' ? 'Objection Handling' : cat.category}
                                </span>
                                <span className={`text-lg font-bold ${textColorClass}`}>
                                  {cat.score}/{cat.maxScore}
                                </span>
                              </div>
                              <div className="space-y-2">
                                {cat.feedback.strengths.map((strength, i) => (
                                  <p key={`strength-${i}`} className="text-xs text-green-300">
                                    ✓ {strength}
                                  </p>
                                ))}
                                {cat.feedback.improvements.map((improvement, i) => (
                                  <p key={`improvement-${i}`} className="text-xs text-yellow-300">
                                    → {improvement}
                                  </p>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Objections Triggered */}
                  {call.objections.length > 0 && (
                    <div className="mt-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-white">Objections Triggered This Call</h3>
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm font-semibold text-white">
                          {call.objections.length}
                        </span>
                      </div>

                      <div className="space-y-3">
                        {call.objections.map((objection) => {
                          const getCategoryColor = (category: string) => {
                            const colors: Record<string, string> = {
                              price: 'border-yellow-500/30 bg-yellow-500/10',
                              time: 'border-blue-500/30 bg-blue-500/10',
                              authority: 'border-purple-500/30 bg-purple-500/10',
                              need: 'border-green-500/30 bg-green-500/10',
                              trust: 'border-red-500/30 bg-red-500/10',
                              other: 'border-gray-500/30 bg-gray-500/10'
                            };
                            return colors[category] || colors.other;
                          };

                          const getBadgeTextColor = (category: string) => {
                            const colors: Record<string, string> = {
                              price: 'text-yellow-300',
                              time: 'text-blue-300',
                              authority: 'text-purple-300',
                              need: 'text-green-300',
                              trust: 'text-red-300',
                              other: 'text-gray-300'
                            };
                            return colors[category] || colors.other;
                          };

                          return (
                            <div
                              key={objection.id}
                              className={`rounded-xl border p-4 ${getCategoryColor(objection.category)}`}
                            >
                              <div className="flex items-start justify-between gap-3 mb-2">
                                <div className="flex-1">
                                  <h4 className="text-sm font-semibold text-white mb-1">
                                    {objection.name}
                                  </h4>
                                  <p className="text-xs text-[#94a3b8] mb-2">
                                    {objection.description}
                                  </p>
                                </div>
                                <div className="flex shrink-0 gap-2">
                                  <span className={`rounded-full border border-current px-2 py-0.5 text-xs font-semibold ${getBadgeTextColor(objection.category)}`}>
                                    {objection.category}
                                  </span>
                                  <span className="rounded-full border border-white/20 bg-white/5 px-2 py-0.5 text-xs font-semibold text-white/70">
                                    {objection.industry}
                                  </span>
                                </div>
                              </div>
                              <div className="space-y-2 mt-3 pt-3 border-t border-[#1e293b]/50">
                                <div>
                                  <p className="text-xs font-semibold text-white/60 mb-1">Prospect said:</p>
                                  <p className="text-xs text-white/80 italic">
                                    &quot;{objection.triggeredAt.substring(0, 150)}{objection.triggeredAt.length > 150 ? '...' : ''}&quot;
                                  </p>
                                </div>
                                {objection.responseSnippet && objection.responseSnippet.trim().length > 0 && (
                                  <div>
                                    <p className="text-xs font-semibold text-white/60 mb-1">Your response:</p>
                                    <p className="text-xs text-white/80">
                                      &quot;{objection.responseSnippet.substring(0, 150)}{objection.responseSnippet.length > 150 ? '...' : ''}&quot;
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="mt-6 rounded-2xl border border-[#1e293b]/50 bg-black/30 p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Transcript</h3>
                    {call.transcript.length === 0 ? (
                      <p className="text-sm text-[#94a3b8]">
                        No transcript was captured for this call. Stay connected until the session ends to save future transcripts automatically.
                      </p>
                    ) : (
                      <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                        {call.transcript.map((entry, index) => (
                          <div
                            key={`${call.id}-${index}`}
                            className={`rounded-xl p-4 text-sm ${
                              entry.role === 'user'
                                ? 'bg-[#0f172a] border border-[#0f9b99]/20'
                                : 'bg-white/[0.03] border border-[#1e293b]/50'
                            }`}
                          >
                            <div className="flex items-center justify-between text-xs text-[#94a3b8] mb-2">
                              <span className="font-semibold">
                                {entry.role === 'user' ? 'You' : 'Prospect'}
                              </span>
                              {entry.timestamp && (
                                <span>{new Date(entry.timestamp).toLocaleTimeString()}</span>
                              )}
                            </div>
                            <p className="text-white leading-relaxed">{entry.text}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
