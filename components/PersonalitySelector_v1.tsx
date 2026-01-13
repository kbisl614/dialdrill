'use client';

import { useMemo } from 'react';

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

// VERSION 1: Compact Toggle with Icon Grid
export default function PersonalitySelector({
  unlockedPersonalities,
  lockedPersonalities,
  selectionMode,
  selectedPersonalityId,
  onModeChange,
  onSelectPersonality,
  onRequestUpgrade,
}: PersonalitySelectorProps) {
  const allPersonalities = useMemo(
    () => [...unlockedPersonalities, ...lockedPersonalities],
    [lockedPersonalities, unlockedPersonalities]
  );

  const unlockedIds = useMemo(
    () => new Set(unlockedPersonalities.map((p) => p.id)),
    [unlockedPersonalities]
  );

  return (
    <div className="space-y-6">
      {/* Compact Mode Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white">Training Mode</h3>
          <p className="text-xs text-[#64748b] mt-0.5">Pick specific or randomize</p>
        </div>
        <div className="flex rounded-xl border border-white/10 bg-white/5 p-1 gap-1">
          <button
            className={`group relative rounded-lg px-4 py-2 text-xs font-bold transition-all ${
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
            className={`group relative rounded-lg px-4 py-2 text-xs font-bold transition-all ${
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

      {/* Content */}
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
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {allPersonalities.map((personality) => {
            const isUnlocked = unlockedIds.has(personality.id);
            const isSelected = selectedPersonalityId === personality.id;
            const icon = personalityIcons[personality.name] || '🗣️';
            return (
              <button
                type="button"
                key={personality.id}
                onClick={() => (isUnlocked ? onSelectPersonality(personality.id) : onRequestUpgrade())}
                className={`group relative flex flex-col items-center rounded-xl border p-4 text-center transition-all ${
                  isUnlocked
                    ? 'border-white/10 bg-white/[0.03] hover:border-[#00d9ff]/50 hover:bg-white/[0.06] hover:scale-105'
                    : 'border-white/5 bg-black/20 opacity-50 hover:opacity-70'
                } ${isSelected ? 'ring-2 ring-[#00d9ff] shadow-[0_0_20px_rgba(0,217,255,0.4)] scale-105' : ''}`}
              >
                {!isUnlocked && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-xl backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-1">
                      <svg className="w-5 h-5 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      <span className="text-[10px] font-semibold text-white/80">Upgrade</span>
                    </div>
                  </div>
                )}
                <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">
                  {icon}
                </div>
                <h4 className="text-sm font-bold text-white leading-tight mb-1">{personality.name}</h4>
                <p className="text-[10px] text-[#64748b] line-clamp-2 leading-relaxed">{personality.description}</p>
                {personality.isBoss && (
                  <span className="mt-2 inline-block rounded-full bg-[#a855f7]/20 px-2 py-0.5 text-[9px] font-bold text-[#d8b4fe]">
                    BOSS
                  </span>
                )}
                {isSelected && (
                  <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#00d9ff] shadow-[0_0_15px_rgba(0,217,255,0.6)]">
                    <svg className="w-3 h-3 text-[#080d1a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
