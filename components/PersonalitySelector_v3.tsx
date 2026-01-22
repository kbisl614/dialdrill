'use client';

import { useMemo, useState } from 'react';

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

// VERSION 3: Dropdown Style with Expandable Personality Picker
export default function PersonalitySelector({
  unlockedPersonalities,
  lockedPersonalities,
  selectionMode,
  selectedPersonalityId,
  onModeChange,
  onSelectPersonality,
  onRequestUpgrade,
}: PersonalitySelectorProps) {
  const [showPersonalities, setShowPersonalities] = useState(false);

  const allPersonalities = useMemo(
    () => [...unlockedPersonalities, ...lockedPersonalities],
    [lockedPersonalities, unlockedPersonalities]
  );

  const unlockedIds = useMemo(
    () => new Set(unlockedPersonalities.map((p) => p.id)),
    [unlockedPersonalities]
  );

  const selectedPersonality = allPersonalities.find(p => p.id === selectedPersonalityId);
  const selectedIcon = selectedPersonality ? (personalityIcons[selectedPersonality.name] || '🗣️') : null;

  const handleModeChange = (mode: SelectionMode) => {
    onModeChange(mode);
    if (mode === 'select') {
      setShowPersonalities(true);
    } else {
      setShowPersonalities(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Main Selection Area */}
      <div className="rounded-xl border border-white/10 bg-gradient-to-br from-white/[0.03] to-transparent p-1">
        <div className="grid grid-cols-2 gap-1">
          {/* Random Option */}
          <button
            onClick={() => handleModeChange('random')}
            className={`group relative rounded-lg p-4 transition-all duration-300 ${
              selectionMode === 'random'
                ? 'bg-gradient-to-br from-[var(--color-cyan-bright)]/20 to-[#00ffea]/10 shadow-[inset_0_0_20px_rgba(0,217,255,0.1)]'
                : 'hover:bg-white/[0.03]'
            }`}
          >
            <div className="flex flex-col items-center gap-2 text-center">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-2xl transition-all ${
                selectionMode === 'random'
                  ? 'bg-[var(--color-cyan-bright)]/20 scale-110 shadow-[0_0_20px_rgba(0,217,255,0.3)]'
                  : 'bg-white/5 group-hover:scale-105'
              }`}>
                🎲
              </div>
              <div>
                <p className={`text-sm font-bold transition-colors ${
                  selectionMode === 'random' ? 'text-[var(--color-cyan-bright)]' : 'text-white'
                }`}>
                  Surprise Me
                </p>
                <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">Random • Best for training</p>
              </div>
            </div>
            {selectionMode === 'random' && (
              <div className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-cyan-bright)] shadow-[0_0_15px_rgba(0,217,255,0.6)]">
                <svg className="w-3 h-3 text-[var(--color-dark-bg)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </button>

          {/* Pick Specific Option */}
          <button
            onClick={() => handleModeChange('select')}
            className={`group relative rounded-lg p-4 transition-all duration-300 ${
              selectionMode === 'select'
                ? 'bg-gradient-to-br from-[var(--color-cyan-bright)]/20 to-[#00ffea]/10 shadow-[inset_0_0_20px_rgba(0,217,255,0.1)]'
                : 'hover:bg-white/[0.03]'
            }`}
          >
            <div className="flex flex-col items-center gap-2 text-center">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-2xl transition-all ${
                selectionMode === 'select'
                  ? 'bg-[var(--color-cyan-bright)]/20 scale-110 shadow-[0_0_20px_rgba(0,217,255,0.3)]'
                  : 'bg-white/5 group-hover:scale-105'
              }`}>
                {selectedIcon || '🎯'}
              </div>
              <div>
                <p className={`text-sm font-bold transition-colors ${
                  selectionMode === 'select' ? 'text-[var(--color-cyan-bright)]' : 'text-white'
                }`}>
                  {selectedPersonality ? selectedPersonality.name : 'Pick One'}
                </p>
                <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">
                  {selectedPersonality ? 'Selected' : 'Choose specific'}
                </p>
              </div>
            </div>
            {selectionMode === 'select' && (
              <div className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-cyan-bright)] shadow-[0_0_15px_rgba(0,217,255,0.6)]">
                <svg className="w-3 h-3 text-[var(--color-dark-bg)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Expandable Personality Grid */}
      {selectionMode === 'select' && (
        <div className="animate-fadeIn">
          <button
            onClick={() => setShowPersonalities(!showPersonalities)}
            className="group w-full flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 hover:bg-white/[0.05] transition-all"
          >
            <div className="flex items-center gap-2">
              <svg className={`w-4 h-4 text-[var(--color-cyan-bright)] transition-transform ${showPersonalities ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="text-sm font-semibold text-white">
                {showPersonalities ? 'Hide' : 'Show'} All Personalities
              </span>
            </div>
            <span className="text-xs text-[var(--color-text-muted)]">
              {unlockedPersonalities.length} available
            </span>
          </button>

          {showPersonalities && (
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 animate-fadeIn">
              {allPersonalities.map((personality) => {
                const isUnlocked = unlockedIds.has(personality.id);
                const isSelected = selectedPersonalityId === personality.id;
                const icon = personalityIcons[personality.name] || '🗣️';
                return (
                  <button
                    type="button"
                    key={personality.id}
                    onClick={() => {
                      if (isUnlocked) {
                        onSelectPersonality(personality.id);
                        setShowPersonalities(false);
                      } else {
                        onRequestUpgrade();
                      }
                    }}
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
                    <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">
                      {icon}
                    </div>
                    <h4 className="text-xs font-bold text-white leading-tight">{personality.name}</h4>
                    {personality.isBoss && (
                      <span className="mt-1.5 inline-block rounded-full bg-[var(--color-purple)]/20 px-2 py-0.5 text-[9px] font-bold text-[#d8b4fe]">
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
      )}
    </div>
  );
}
