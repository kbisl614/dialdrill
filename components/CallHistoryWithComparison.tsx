'use client';

import { useState } from 'react';
import CallComparison from './CallComparison';
import { GitCompare } from 'lucide-react';
import Link from 'next/link';

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

interface Props {
  calls: CallHistoryItem[];
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

export default function CallHistoryWithComparison({ calls }: Props) {
  const [selectedCallIds, setSelectedCallIds] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);

  const handleSelectCall = (callId: string) => {
    setSelectedCallIds(prev => {
      if (prev.includes(callId)) {
        return prev.filter(id => id !== callId);
      } else if (prev.length < 2) {
        return [...prev, callId];
      } else {
        // Replace the oldest selection
        return [prev[1], callId];
      }
    });
  };

  const handleCompare = () => {
    if (selectedCallIds.length === 2) {
      setShowComparison(true);
    }
  };

  const selectedCalls = calls.filter(call => selectedCallIds.includes(call.id));

  if (calls.length === 0) {
    return (
      <div className="rounded-3xl border border-[var(--color-border-subtle)]/50 bg-white/[0.02] p-12 text-center text-[var(--color-text-secondary)]">
        <p className="text-xl font-semibold text-white mb-2">No calls yet</p>
        <p>Once you complete a call, the transcript and summary will appear here.</p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[var(--color-cyan-bright)] to-[#00ffea] px-8 py-3 text-sm font-semibold text-[var(--color-dark-bg)] transition hover:scale-105 shadow-[0_0_40px_rgba(0,217,255,0.6)] hover:shadow-[0_0_60px_rgba(0,255,234,0.8)]"
        >
          Start Practicing
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Comparison Toolbar */}
      {calls.length >= 2 && (
        <div className="mb-6 rounded-2xl border border-[var(--color-border-subtle)]/50 bg-gradient-to-br from-card-bg to-[rgba(5,9,17,0.8)] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.7)]">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <GitCompare className="w-5 h-5 text-[var(--color-cyan-bright)]" />
              <div>
                <p className="text-sm font-semibold text-white">Compare Calls</p>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  Select 2 calls to compare side-by-side ({selectedCallIds.length}/2 selected)
                </p>
              </div>
            </div>
            <button
              onClick={handleCompare}
              disabled={selectedCallIds.length !== 2}
              className="rounded-full bg-gradient-to-r from-[var(--color-cyan-bright)] to-[#00ffea] px-6 py-2 text-sm font-semibold text-[var(--color-dark-bg)] transition hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-[0_0_20px_rgba(0,217,255,0.4)]"
            >
              Compare Selected
            </button>
          </div>
        </div>
      )}

      {/* Call List */}
      <div className="space-y-8">
        {calls.map((call) => {
          const isSelected = selectedCallIds.includes(call.id);
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
              className={`rounded-3xl border ${
                isSelected
                  ? 'border-[var(--color-cyan-bright)]/50 bg-gradient-to-br from-[rgba(0,217,255,0.1)] to-[rgba(5,9,17,0.8)]'
                  : 'border-[var(--color-border-subtle)]/50 bg-gradient-to-br from-card-bg to-[rgba(5,9,17,0.8)]'
              } p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.7),0_0_40px_rgba(6,217,215,0.08)] backdrop-blur-xl transition-all duration-300 hover:shadow-[0_20px_80px_rgba(0,0,0,0.8),0_0_60px_rgba(6,217,215,0.12)] hover:border-[var(--color-border-medium)]`}
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-[var(--color-text-secondary)]">{formatTimestamp(call.createdAt)}</p>
                    {/* Selection Checkbox */}
                    {calls.length >= 2 && (
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectCall(call.id)}
                          className="w-5 h-5 rounded border-2 border-[var(--color-cyan-bright)] bg-transparent checked:bg-[var(--color-cyan-bright)] checked:border-[var(--color-cyan-bright)] focus:ring-2 focus:ring-[var(--color-cyan-bright)] focus:ring-offset-0 cursor-pointer transition-all"
                          disabled={!isSelected && selectedCallIds.length >= 2}
                        />
                        <span className="text-sm font-semibold text-[var(--color-cyan-bright)]">Compare</span>
                      </label>
                    )}
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white">
                    {call.personalityName || 'Unknown personality'}
                    {call.personalityIsBoss && (
                      <span className="ml-2 sm:ml-3 rounded-full border border-[var(--color-purple)]/30 bg-[var(--color-purple)]/10 px-2 sm:px-3 py-1 text-xs font-semibold text-[#d8b4fe]">
                        Boss
                      </span>
                    )}
                  </h2>
                  {call.personalityDescription && (
                    <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{call.personalityDescription}</p>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <span className="rounded-full border border-[var(--color-border-subtle)]/50 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-white/80">
                    Duration: {formatDuration(call.durationSeconds)}
                  </span>
                  <span className="rounded-full border border-[var(--color-border-subtle)]/50 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-white/80">
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
                      <span className="text-lg text-[var(--color-text-secondary)]">/10</span>
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
                              <p className="text-xs text-[var(--color-text-secondary)] mb-2">
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
                          <div className="space-y-2 mt-3 pt-3 border-t border-[var(--color-border-subtle)]/50">
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

              <div className="mt-6 rounded-2xl border border-[var(--color-border-subtle)]/50 bg-black/30 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Transcript</h3>
                {call.transcript.length === 0 ? (
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    No transcript was captured for this call. Stay connected until the session ends to save future transcripts automatically.
                  </p>
                ) : (
                  <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                    {call.transcript.map((entry, index) => (
                      <div
                        key={`${call.id}-${index}`}
                        className={`rounded-xl p-4 text-sm ${
                          entry.role === 'user'
                            ? 'bg-[#0f172a] border border-[var(--color-cyan-bright)]/20'
                            : 'bg-white/[0.03] border border-[var(--color-border-subtle)]/50'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs text-[var(--color-text-secondary)] mb-2">
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

      {/* Comparison Modal */}
      {showComparison && selectedCalls.length === 2 && (
        <CallComparison
          call1={selectedCalls[0]}
          call2={selectedCalls[1]}
          onClose={() => setShowComparison(false)}
        />
      )}
    </>
  );
}
