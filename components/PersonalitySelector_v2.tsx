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
  Zenia: '🌸',
  Marcus: '🏋️',
  'The Wolf': '🐺',
  'The Shark': '🦈',
  'The Titan': '🏛️',
  Matrix: '🔴',
  Neo: '⚡',
  'Sales Prospect - Objection Handler': '💼',
};

// VERSION 2: Side-by-Side Cards
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Random Mode Card */}
      <button
        onClick={() => onModeChange('random')}
        className={`group relative overflow-hidden rounded-2xl border p-6 text-left transition-all duration-300 ${
          selectionMode === 'random'
            ? 'border-[var(--color-cyan-bright)]/50 bg-gradient-to-br from-[var(--color-cyan-bright)]/10 to-[#00ffea]/5 shadow-[0_0_30px_rgba(0,217,255,0.3)]'
            : 'border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]'
        }`}
      >
        <div className="absolute top-4 right-4">
          {selectionMode === 'random' && (
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-cyan-bright)] shadow-[0_0_15px_rgba(0,217,255,0.6)]">
              <svg className="w-3.5 h-3.5 text-[var(--color-dark-bg)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
        </div>
        <div className="flex items-center gap-4 mb-4">
          <div className={`flex h-14 w-14 items-center justify-center rounded-2xl text-3xl transition-transform ${
            selectionMode === 'random'
              ? 'bg-[var(--color-cyan-bright)]/20 scale-110'
              : 'bg-white/10 group-hover:scale-105'
          }`}>
            🎲
          </div>
          <div>
            <h3 className="text-xl font-bold text-white mb-1">Surprise Me</h3>
            <p className="text-xs font-semibold text-[var(--color-cyan-bright)]">Recommended</p>
          </div>
        </div>
        <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
          Random selection from {unlockedPersonalities.length} personalities. Best for realistic training.
        </p>
      </button>

      {/* Select Mode Card */}
      <button
        onClick={() => onModeChange('select')}
        className={`group relative overflow-hidden rounded-2xl border p-6 text-left transition-all duration-300 ${
          selectionMode === 'select'
            ? 'border-[var(--color-cyan-bright)]/50 bg-gradient-to-br from-[var(--color-cyan-bright)]/10 to-[#00ffea]/5 shadow-[0_0_30px_rgba(0,217,255,0.3)]'
            : 'border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]'
        }`}
      >
        <div className="absolute top-4 right-4">
          {selectionMode === 'select' && (
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-cyan-bright)] shadow-[0_0_15px_rgba(0,217,255,0.6)]">
              <svg className="w-3.5 h-3.5 text-[var(--color-dark-bg)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
        </div>
        <div className="flex items-center gap-4 mb-4">
          <div className={`flex h-14 w-14 items-center justify-center rounded-2xl transition-transform ${
            selectionMode === 'select'
              ? 'bg-[var(--color-cyan-bright)]/20 scale-110'
              : 'bg-white/10 group-hover:scale-105'
          }`}>
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-white mb-1">Pick Specific</h3>
            <p className="text-xs font-semibold text-[var(--color-text-secondary)]">Target practice</p>
          </div>
        </div>
        <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
          Choose exactly who you want to practice with. Great for focused training.
        </p>
      </button>

      {/* Personality Grid - Only show when select mode is active */}
      {selectionMode === 'select' && (
        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 animate-fadeIn">
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
                    ? 'border-white/10 bg-white/[0.03] hover:border-[var(--color-cyan-bright)]/50 hover:bg-white/[0.06] hover:scale-105'
                    : 'border-white/5 bg-black/20 opacity-50 hover:opacity-70'
                } ${isSelected ? 'ring-2 ring-[var(--color-cyan-bright)] shadow-[0_0_20px_rgba(0,217,255,0.4)] scale-105' : ''}`}
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
                <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">
                  {icon}
                </div>
                <h4 className="text-sm font-bold text-white leading-tight">{personality.name}</h4>
                {personality.isBoss && (
                  <span className="mt-2 inline-block rounded-full bg-[var(--color-purple)]/20 px-2 py-0.5 text-[9px] font-bold text-[#d8b4fe]">
                    BOSS
                  </span>
                )}
                {isSelected && (
                  <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-cyan-bright)] shadow-[0_0_15px_rgba(0,217,255,0.6)] z-20">
                    <svg className="w-3 h-3 text-[var(--color-dark-bg)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
