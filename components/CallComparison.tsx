'use client';

import { X, ArrowLeft, ArrowRight } from 'lucide-react';

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

interface CallData {
  id: string;
  createdAt: string;
  durationSeconds: number | null;
  personalityName: string | null;
  personalityIsBoss: boolean | null;
  transcript: TranscriptEntry[];
  score: CallScore | null;
}

interface Props {
  call1: CallData;
  call2: CallData;
  onClose: () => void;
}

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatDuration(seconds: number | null): string {
  if (seconds === null) return '—';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
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

export default function CallComparison({ call1, call2, onClose }: Props) {
  const scoreDiff = (call1.score?.overallScore || 0) - (call2.score?.overallScore || 0);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-[1400px] max-h-[90vh] bg-gradient-to-br from-[rgba(15,23,42,0.98)] to-[rgba(5,9,17,0.98)] border border-[#1e293b]/50 rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[#0f172a]/95 backdrop-blur-xl border-b border-[#1e293b]/50 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Call Comparison</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-100px)] p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Call 1 */}
            <div className="space-y-6">
              <div className="rounded-2xl border border-[#1e293b]/50 bg-gradient-to-br from-[rgba(15,23,42,0.6)] to-[rgba(5,9,17,0.8)] p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {call1.personalityName || 'Call 1'}
                      {call1.personalityIsBoss && (
                        <span className="ml-2 text-xs rounded-full border border-[#a855f7]/30 bg-[#a855f7]/10 px-2 py-0.5 text-[#d8b4fe]">
                          Boss
                        </span>
                      )}
                    </h3>
                    <p className="text-sm text-[#94a3b8] mt-1">{formatTimestamp(call1.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-white">
                      {call1.score?.overallScore || '—'}
                      <span className="text-lg text-[#94a3b8]">/10</span>
                    </div>
                    {scoreDiff !== 0 && (
                      <div className={`text-sm font-semibold ${scoreDiff > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {scoreDiff > 0 ? '+' : ''}{scoreDiff.toFixed(1)}
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-sm text-[#94a3b8]">
                  Duration: {formatDuration(call1.durationSeconds)}
                </div>
              </div>

              {/* Category Scores */}
              {call1.score && (
                <div className="rounded-2xl border border-[#1e293b]/50 bg-gradient-to-br from-[rgba(15,23,42,0.6)] to-[rgba(5,9,17,0.8)] p-6">
                  <h4 className="text-lg font-bold text-white mb-4">Category Scores</h4>
                  <div className="space-y-3">
                    {call1.score.categoryScores.map((cat) => {
                      const scorePercent = (cat.score / cat.maxScore) * 100;
                      const call2Cat = call2.score?.categoryScores.find(c => c.category === cat.category);
                      const call2Percent = call2Cat ? (call2Cat.score / call2Cat.maxScore) * 100 : 0;
                      const isBetter = scorePercent > call2Percent;

                      return (
                        <div key={cat.category}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold text-white">
                              {getCategoryDisplayName(cat.category)}
                            </span>
                            <span className={`text-sm font-bold ${isBetter ? 'text-green-400' : 'text-white'}`}>
                              {cat.score}/{cat.maxScore}
                            </span>
                          </div>
                          <div className="h-2 rounded-full bg-white/10">
                            <div
                              className={`h-full rounded-full transition-all ${
                                isBetter ? 'bg-green-500' : 'bg-[#00d9ff]'
                              }`}
                              style={{ width: `${scorePercent}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Transcript */}
              <div className="rounded-2xl border border-[#1e293b]/50 bg-gradient-to-br from-[rgba(15,23,42,0.6)] to-[rgba(5,9,17,0.8)] p-6">
                <h4 className="text-lg font-bold text-white mb-4">Transcript</h4>
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                  {call1.transcript.length === 0 ? (
                    <p className="text-sm text-[#94a3b8]">No transcript available</p>
                  ) : (
                    call1.transcript.map((entry, index) => (
                      <div
                        key={`${call1.id}-${index}`}
                        className={`rounded-xl p-3 text-sm ${
                          entry.role === 'user'
                            ? 'bg-[#0f172a] border border-[#00d9ff]/20'
                            : 'bg-white/[0.03] border border-[#1e293b]/50'
                        }`}
                      >
                        <div className="text-xs font-semibold text-[#94a3b8] mb-1">
                          {entry.role === 'user' ? 'You' : 'Prospect'}
                        </div>
                        <p className="text-white leading-relaxed">{entry.text}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Call 2 */}
            <div className="space-y-6">
              <div className="rounded-2xl border border-[#1e293b]/50 bg-gradient-to-br from-[rgba(15,23,42,0.6)] to-[rgba(5,9,17,0.8)] p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {call2.personalityName || 'Call 2'}
                      {call2.personalityIsBoss && (
                        <span className="ml-2 text-xs rounded-full border border-[#a855f7]/30 bg-[#a855f7]/10 px-2 py-0.5 text-[#d8b4fe]">
                          Boss
                        </span>
                      )}
                    </h3>
                    <p className="text-sm text-[#94a3b8] mt-1">{formatTimestamp(call2.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-white">
                      {call2.score?.overallScore || '—'}
                      <span className="text-lg text-[#94a3b8]">/10</span>
                    </div>
                    {scoreDiff !== 0 && (
                      <div className={`text-sm font-semibold ${scoreDiff < 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {scoreDiff < 0 ? '+' : ''}{Math.abs(scoreDiff).toFixed(1)}
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-sm text-[#94a3b8]">
                  Duration: {formatDuration(call2.durationSeconds)}
                </div>
              </div>

              {/* Category Scores */}
              {call2.score && (
                <div className="rounded-2xl border border-[#1e293b]/50 bg-gradient-to-br from-[rgba(15,23,42,0.6)] to-[rgba(5,9,17,0.8)] p-6">
                  <h4 className="text-lg font-bold text-white mb-4">Category Scores</h4>
                  <div className="space-y-3">
                    {call2.score.categoryScores.map((cat) => {
                      const scorePercent = (cat.score / cat.maxScore) * 100;
                      const call1Cat = call1.score?.categoryScores.find(c => c.category === cat.category);
                      const call1Percent = call1Cat ? (call1Cat.score / call1Cat.maxScore) * 100 : 0;
                      const isBetter = scorePercent > call1Percent;

                      return (
                        <div key={cat.category}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold text-white">
                              {getCategoryDisplayName(cat.category)}
                            </span>
                            <span className={`text-sm font-bold ${isBetter ? 'text-green-400' : 'text-white'}`}>
                              {cat.score}/{cat.maxScore}
                            </span>
                          </div>
                          <div className="h-2 rounded-full bg-white/10">
                            <div
                              className={`h-full rounded-full transition-all ${
                                isBetter ? 'bg-green-500' : 'bg-[#00d9ff]'
                              }`}
                              style={{ width: `${scorePercent}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Transcript */}
              <div className="rounded-2xl border border-[#1e293b]/50 bg-gradient-to-br from-[rgba(15,23,42,0.6)] to-[rgba(5,9,17,0.8)] p-6">
                <h4 className="text-lg font-bold text-white mb-4">Transcript</h4>
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                  {call2.transcript.length === 0 ? (
                    <p className="text-sm text-[#94a3b8]">No transcript available</p>
                  ) : (
                    call2.transcript.map((entry, index) => (
                      <div
                        key={`${call2.id}-${index}`}
                        className={`rounded-xl p-3 text-sm ${
                          entry.role === 'user'
                            ? 'bg-[#0f172a] border border-[#00d9ff]/20'
                            : 'bg-white/[0.03] border border-[#1e293b]/50'
                        }`}
                      >
                        <div className="text-xs font-semibold text-[#94a3b8] mb-1">
                          {entry.role === 'user' ? 'You' : 'Prospect'}
                        </div>
                        <p className="text-white leading-relaxed">{entry.text}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
