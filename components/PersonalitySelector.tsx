'use client';

import { useMemo, useState } from 'react';
import { TiltCard, LetterGlitch } from '@/components/ui/react-bits';

export type Personality = {
  id: string;
  name: string;
  description: string;
  isBoss: boolean;
  tierRequired?: 'trial' | 'paid';
};

type SelectionMode = 'select' | 'random';

interface PersonalitySelectorProps {
  unlockedPersonalities: Personality[];
  lockedPersonalities: Personality[];
  selectionMode: SelectionMode;
  selectedPersonalityId: string | null;
  onModeChange: (mode: SelectionMode) => void;
  onSelectPersonality: (id: string) => void;
  onRequestUpgrade: () => void;
}

const personalityIcons: Record<string, string> = {
  Josh: '🛠️',
  zenia: '🌸',
  Marcus: '🏋️',
  'The wolf': '🐺',
  'The Shark': '🦈',
  'The Titan': '🏛️',
  Matrix: '🔴',
  Neo: '⚡',
  'Sales Prospect - Objection Handler': '💼',
};

export default function PersonalitySelector({
  unlockedPersonalities,
  lockedPersonalities,
  selectionMode,
  selectedPersonalityId,
  onModeChange,
  onSelectPersonality,
  onRequestUpgrade,
}: PersonalitySelectorProps) {
  const [hoveredPersonality, setHoveredPersonality] = useState<string | null>(null);

  const allPersonalities = useMemo(
    () => [...unlockedPersonalities, ...lockedPersonalities],
    [lockedPersonalities, unlockedPersonalities]
  );

  const unlockedIds = useMemo(
    () => new Set(unlockedPersonalities.map((p) => p.id)),
    [unlockedPersonalities]
  );

  return (
    <section>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-white mb-1">Training Mode</h3>
          <p className="text-xs text-[#64748b]">Pick specific or randomize</p>
        </div>
        <div className="flex rounded-xl border border-white/10 bg-white/5 p-1 gap-1">
          <button
            className={`group relative rounded-lg px-4 py-2.5 text-xs font-bold transition-all ${
              selectionMode === 'select'
                ? 'bg-gradient-to-r from-[#00d9ff] to-[#00ffea] text-[#080d1a] shadow-[0_0_20px_rgba(0,217,255,0.4)]'
                : 'text-white/60 hover:text-white/90'
            }`}
            onClick={() => onModeChange('select')}
          >
            <span className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Pick One
            </span>
          </button>
          <button
            className={`group relative rounded-lg px-4 py-2.5 text-xs font-bold transition-all ${
              selectionMode === 'random'
                ? 'bg-gradient-to-r from-[#00d9ff] to-[#00ffea] text-[#080d1a] shadow-[0_0_20px_rgba(0,217,255,0.4)]'
                : 'text-white/60 hover:text-white/90'
            }`}
            onClick={() => onModeChange('random')}
          >
            <span className="flex items-center gap-1.5">
              🎲
              Surprise Me
            </span>
          </button>
        </div>
      </div>

      {selectionMode === 'random' ? (
        <div className="rounded-xl border border-[#00d9ff]/20 bg-gradient-to-br from-[#00d9ff]/5 to-transparent p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00d9ff]/20 text-xl flex-shrink-0">
              🎲
            </div>
            <div>
              <p className="text-sm font-bold text-white mb-1">Random Mode Active</p>
              <p className="text-xs text-[#94a3b8] leading-relaxed">
                Each call picks from your {unlockedPersonalities.length} unlocked personalities. Keeps you sharp.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {allPersonalities.map((personality) => {
              const isUnlocked = unlockedIds.has(personality.id);
              const isSelected = selectedPersonalityId === personality.id;
              const icon = personalityIcons[personality.name] || '🗣️';
              const isHovered = hoveredPersonality === personality.id;
              return (
                <div key={personality.id} className="relative">
                  <TiltCard
                    tiltAmount={isUnlocked ? 18 : 5}
                    glowColor={isSelected ? 'rgba(0, 217, 255, 0.5)' : personality.isBoss ? 'rgba(168, 85, 247, 0.4)' : 'rgba(0, 217, 255, 0.3)'}
                    spotlightSize={300}
                    borderColor={isSelected ? '#00d9ff' : isUnlocked ? '#00d9ff' : '#1e293b'}
                    backgroundColor={isUnlocked ? 'rgba(15, 23, 42, 0.6)' : 'rgba(0, 0, 0, 0.4)'}
                    disabled={!isUnlocked}
                    onClick={() => (isUnlocked ? onSelectPersonality(personality.id) : onRequestUpgrade())}
                    className={`w-full cursor-pointer ${isSelected ? 'ring-2 ring-[#00d9ff]' : ''}`}
                  >
                    <div
                      className="relative flex flex-col items-center p-4 text-center"
                      onMouseEnter={() => setHoveredPersonality(personality.id)}
                      onMouseLeave={() => setHoveredPersonality(null)}
                    >
                      {!isUnlocked && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-xl backdrop-blur-sm z-10">
                          <div className="flex flex-col items-center gap-1">
                            <svg className="w-5 h-5 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            <span className="text-[10px] font-semibold text-white/80">Pro</span>
                          </div>
                        </div>
                      )}
                      <div className="text-3xl mb-2 transition-transform duration-200">
                        {icon}
                      </div>
                      <h3 className="text-sm font-bold text-white leading-tight mb-1">
                        {isHovered && isUnlocked ? (
                          <LetterGlitch
                            text={personality.name}
                            glitchColors={personality.isBoss ? ['#a855f7', '#d946ef', '#9333ea'] : ['#00d9ff', '#00ffea', '#a855f7']}
                            speed={40}
                            trigger="always"
                            intensity="high"
                          />
                        ) : (
                          personality.name
                        )}
                      </h3>
                      {personality.isBoss && (
                        <span className="inline-block rounded-full bg-[#a855f7]/20 px-2 py-0.5 text-[9px] font-bold text-[#d8b4fe] shadow-[0_0_10px_rgba(168,85,247,0.4)]">
                          BOSS
                        </span>
                      )}
                      {isSelected && (
                        <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#00d9ff] shadow-[0_0_20px_rgba(0,217,255,0.8)] z-20">
                          <svg className="w-3 h-3 text-[#080d1a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                      {/* Info Icon */}
                      <div className="absolute bottom-2 right-2 flex items-center justify-center w-5 h-5 rounded-full bg-[#00d9ff]/20 transition-colors">
                        <svg className="w-3 h-3 text-[#00d9ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                  </TiltCard>

                  {/* Enhanced Info Card on Hover */}
                  {isHovered && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 z-30 pointer-events-none">
                      <div className="rounded-2xl border-2 border-[#00d9ff]/40 bg-gradient-to-br from-[#0a0f1a] to-[#1a1f2e] p-5 shadow-[0_0_40px_rgba(0,217,255,0.4)] backdrop-blur-xl max-w-[280px] min-w-[260px] animate-fadeIn">
                        {/* Header with Icon and Name */}
                        <div className="flex items-start gap-3 mb-3 pb-3 border-b border-[#00d9ff]/20">
                          <div className="text-3xl flex-shrink-0">{icon}</div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-base font-bold text-white leading-tight mb-1.5">{personality.name}</h4>
                            {personality.isBoss && (
                              <span className="inline-block rounded-full bg-[#a855f7]/30 px-2 py-0.5 text-[10px] font-bold text-[#d8b4fe] border border-[#a855f7]/50">
                                BOSS MODE
                              </span>
                            )}
                          </div>
                        </div>
                        {/* Description */}
                        <p className="text-sm text-[#cbd5e1] leading-relaxed whitespace-normal">
                          {personality.description}
                        </p>
                        {/* Arrow */}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[2px]">
                          <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-[#0a0f1a]"></div>
                          <div className="absolute top-[-1px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-[#00d9ff]/40"></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}

