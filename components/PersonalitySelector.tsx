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
    <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.5)] backdrop-blur-xl">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-[#2dd4e6]">Choose Your Call Style</p>
          <h2 className="mt-1 text-3xl font-extrabold text-white">Pick a personality or let us randomize it</h2>
          <p className="mt-2 text-sm text-[#9ca3af]">
            Select the persona you want to practice with, or keep training fresh with randomized calls.
          </p>
        </div>
        <div className="flex rounded-full border border-white/10 bg-white/5 p-1">
          <button
            className={`flex-1 rounded-full px-5 py-2 text-sm font-semibold transition ${
              selectionMode === 'select'
                ? 'bg-white text-[#020817] shadow-[0_0_20px_rgba(255,255,255,0.3)]'
                : 'text-white/70'
            }`}
            onClick={() => onModeChange('select')}
          >
            Select Personality
          </button>
          <button
            className={`flex-1 rounded-full px-5 py-2 text-sm font-semibold transition ${
              selectionMode === 'random'
                ? 'bg-white text-[#020817] shadow-[0_0_20px_rgba(255,255,255,0.3)]'
                : 'text-white/70'
            }`}
            onClick={() => onModeChange('random')}
          >
            Randomized (Best for Training)
          </button>
        </div>
      </div>

      {selectionMode === 'random' ? (
        <div className="mt-8 rounded-2xl border border-[#2dd4e6]/20 bg-[#061124] p-6 text-left">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#2dd4e6]/20 text-2xl">
              🎲
            </div>
            <div>
              <p className="text-lg font-semibold text-white">Random Personality Mode</p>
              <p className="text-sm text-[#9ca3af]">
                We&apos;ll automatically pick one of your {unlockedPersonalities.length} unlocked personalities for each call.
              </p>
            </div>
          </div>
          <ul className="mt-4 list-disc pl-6 text-sm text-[#9ca3af]">
            <li>Keeps training unpredictable and closer to real sales floors.</li>
            <li>Rotates through every persona you have access to.</li>
            <li>Great if you don&apos;t have a strong preference or need variety.</li>
          </ul>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {allPersonalities.map((personality) => {
            const isUnlocked = unlockedIds.has(personality.id);
            const isSelected = selectedPersonalityId === personality.id;
            const icon = personalityIcons[personality.name] || '🗣️';
            return (
              <button
                type="button"
                key={personality.id}
                onClick={() => (isUnlocked ? onSelectPersonality(personality.id) : onRequestUpgrade())}
                aria-disabled={!isUnlocked}
                className={`relative flex h-full flex-col rounded-2xl border p-5 text-left transition ${
                  isUnlocked
                    ? 'border-white/10 bg-white/[0.04] hover:border-[#2dd4e6]/60 hover:bg-white/[0.07]'
                    : 'border-white/5 bg-black/20 opacity-60 hover:opacity-80'
                } ${isSelected ? 'ring-2 ring-[#2dd4e6] shadow-[0_0_25px_rgba(45,212,230,0.3)]' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-3xl">{icon}</span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      personality.isBoss
                        ? 'bg-[#a855f7]/20 text-[#d8b4fe]'
                        : 'bg-[#2dd4e6]/20 text-[#99f6e4]'
                    }`}
                  >
                    {personality.isBoss ? 'Boss' : 'Core'}
                  </span>
                </div>
                <h3 className="mt-4 text-xl font-bold text-white">{personality.name}</h3>
                <p className="mt-2 text-sm text-[#9ca3af]">{personality.description}</p>
                {!isUnlocked && (
                  <div className="mt-4 rounded-xl border border-white/10 bg-black/30 p-3 text-center text-sm text-white">
                    <span className="inline-flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="h-5 w-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75M5.25 10.5h13.5c.414 0 .75.336.75.75v8.25A2.25 2.25 0 0117.25 21h-10.5A2.25 2.25 0 014.5 19.5V11.25c0-.414.336-.75.75-.75z"
                        />
                      </svg>
                      Upgrade to unlock
                    </span>
                  </div>
                )}
                {isUnlocked && isSelected && (
                  <p className="mt-4 text-sm font-semibold text-[#2dd4e6]">Selected</p>
                )}
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
