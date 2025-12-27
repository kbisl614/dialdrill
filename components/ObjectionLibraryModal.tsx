'use client';

import { useEffect, useState } from 'react';
import type { ObjectionLibraryResponse, ObjectionProfile } from '@/app/api/objections/library/route';

interface ObjectionLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ObjectionLibraryModal({ isOpen, onClose }: ObjectionLibraryModalProps) {
  const [library, setLibrary] = useState<ObjectionLibraryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedObjection, setExpandedObjection] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && !library) {
      fetchLibrary();
    }
  }, [isOpen, library]);

  async function fetchLibrary() {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/objections/library');

      if (!response.ok) {
        throw new Error('Failed to fetch objection library');
      }

      const data = await response.json();
      setLibrary(data);
    } catch (err) {
      console.error('Error fetching objection library:', err);
      setError('Failed to load objection library. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  const getCategoryBadgeColor = (category: string) => {
    const colors: Record<string, string> = {
      price: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      time: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      authority: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      need: 'bg-green-500/20 text-green-300 border-green-500/30',
      trust: 'bg-red-500/20 text-red-300 border-red-500/30',
      other: 'bg-gray-500/20 text-gray-300 border-gray-500/30'
    };
    return colors[category] || colors.other;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4" onClick={onClose}>
      <div className="w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-2xl border border-white/10 bg-[#030712] shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="border-b border-white/10 bg-gradient-to-r from-[#2dd4e6]/10 to-[#9333ea]/10 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Objection Library</h2>
              <p className="mt-1 text-sm text-[#9ca3af]">
                {library ? `${library.total} objections` : 'Loading...'} across 8 industries
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
        <div
          className="overflow-y-auto p-6"
          style={{
            maxHeight: 'calc(90vh - 180px)',
            scrollbarWidth: 'thin',
            scrollbarColor: '#00d9ff #1e293b',
            overscrollBehavior: 'contain'
          }}
        >
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-white/20 border-t-[#2dd4e6]"></div>
                <p className="text-sm text-[#9ca3af]">Loading objection library...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-center">
              <p className="text-sm text-red-300">{error}</p>
              <button
                onClick={fetchLibrary}
                className="mt-3 rounded-lg bg-red-500/20 px-4 py-2 text-sm font-semibold text-red-300 transition hover:bg-red-500/30"
              >
                Try Again
              </button>
            </div>
          )}

          {library && !loading && !error && (
            <div className="space-y-8">
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                <p className="text-sm text-[#9ca3af]">
                  This library shows all possible objections the AI prospects may raise during calls.
                  <strong className="text-white"> Click any objection to see 1-2 proven ways to handle it.</strong>
                </p>
              </div>

              {Object.entries(library.byIndustry)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([industry, objections]) => (
                  <div key={industry}>
                    <h3 className="mb-4 text-lg font-bold text-white">
                      {industry}
                      <span className="ml-2 text-sm font-normal text-[#9ca3af]">
                        ({objections.length})
                      </span>
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {objections.map((objection: ObjectionProfile) => {
                        const isExpanded = expandedObjection === objection.id;

                        return (
                          <div
                            key={objection.id}
                            className="rounded-xl border border-white/10 bg-white/[0.03] transition hover:bg-white/[0.06]"
                          >
                            <button
                              onClick={() => setExpandedObjection(isExpanded ? null : objection.id)}
                              className="w-full p-4 text-left"
                            >
                              <div className="mb-2 flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <h4 className="text-sm font-semibold text-white leading-tight">
                                    {objection.name}
                                  </h4>
                                  {objection.handlingStrategies.length > 0 && (
                                    <svg
                                      className={`h-4 w-4 shrink-0 text-[#2dd4e6] transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                  )}
                                </div>
                                <span
                                  className={`shrink-0 rounded-full border px-2 py-0.5 text-xs font-semibold ${getCategoryBadgeColor(objection.category)}`}
                                >
                                  {objection.category}
                                </span>
                              </div>
                              <p className="text-xs text-[#9ca3af] leading-relaxed">
                                {objection.description}
                              </p>
                            </button>

                            {isExpanded && objection.handlingStrategies.length > 0 && (
                              <div className="border-t border-white/10 bg-white/[0.02] p-4 space-y-3">
                                <p className="text-xs font-semibold text-[#2dd4e6] uppercase tracking-wide">
                                  How to Handle This
                                </p>
                                {objection.handlingStrategies.map((strategy, idx) => (
                                  <div
                                    key={idx}
                                    className="flex gap-2 text-xs text-white/90 leading-relaxed"
                                  >
                                    <span className="shrink-0 font-bold text-[#2dd4e6]">{idx + 1}.</span>
                                    <p>{strategy}</p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-white/10 bg-white/[0.02] p-4">
          <button
            onClick={onClose}
            className="w-full rounded-xl bg-gradient-to-r from-[#2dd4e6] to-[#1ab5c4] px-6 py-3 text-sm font-semibold text-[#020817] transition hover:opacity-90"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
}
