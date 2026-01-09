'use client';

import { useState } from 'react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const onboardingSteps = [
  {
    title: 'Welcome to DialDrill!',
    icon: '👋',
    description: 'Your AI-powered sales training platform',
    content: [
      'Practice with realistic AI prospects',
      'Get instant feedback on your performance',
      'Track your progress with our gamification system',
      'Master objection handling and closing techniques',
    ],
  },
  {
    title: 'Earn Power & Level Up',
    icon: '⚡',
    description: 'Progress through the ranks',
    content: [
      'Earn power points for completing calls',
      'Unlock new belt tiers as you improve',
      'Maintain daily streaks for bonus multipliers',
      'Compete on the leaderboard with other sales warriors',
    ],
  },
  {
    title: 'Collect Badges',
    icon: '🏅',
    description: 'Achieve milestones and unlock achievements',
    content: [
      'First Call - Complete your inaugural practice session',
      'Perfect Score - Ace a call with 100% in all categories',
      'Streak Master - Maintain a 7-day practice streak',
      'Objection Handler - Successfully handle 50 objections',
    ],
  },
  {
    title: 'Choose Your Challenge',
    icon: '🎯',
    description: 'Pick your training style',
    content: [
      'Select specific personalities to practice with',
      'Or use randomized mode for varied training',
      'Start with core personalities, unlock boss challenges',
      'Each personality tests different skills',
    ],
  },
];

export default function OnboardingModal({ isOpen, onClose, onComplete }: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const step = onboardingSteps[currentStep];
  const isLastStep = currentStep === onboardingSteps.length - 1;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm" />

      {/* Modal */}
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/10 bg-[#1A1F2E] shadow-2xl">
        {/* Header */}
        <div className="border-b border-white/10 bg-gradient-to-r from-[#00d9ff]/10 to-[#9d4edd]/10 p-8">
          <div className="text-center">
            <div className="text-6xl mb-4 animate-bounce">{step.icon}</div>
            <h2 className="text-3xl font-bold text-white mb-2">{step.title}</h2>
            <p className="text-sm text-[#9ca3af]">{step.description}</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="space-y-4">
            {step.content.map((item, index) => (
              <div
                key={index}
                className="flex items-start gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-4 transition hover:bg-white/[0.05]"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#00d9ff] to-[#9d4edd] text-sm font-bold text-white flex-shrink-0">
                  {index + 1}
                </div>
                <p className="text-sm text-white pt-1">{item}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Progress Indicators */}
        <div className="px-8 pb-4">
          <div className="flex justify-center gap-2">
            {onboardingSteps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentStep
                    ? 'w-8 bg-gradient-to-r from-[#00d9ff] to-[#9d4edd]'
                    : 'w-2 bg-white/20 hover:bg-white/30'
                }`}
                aria-label={`Go to step ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="border-t border-white/10 p-6 flex items-center justify-between">
          <button
            onClick={handleSkip}
            className="text-sm font-semibold text-[#9ca3af] transition hover:text-white"
          >
            Skip Tutorial
          </button>

          <div className="flex gap-3">
            {currentStep > 0 && (
              <button
                onClick={handlePrevious}
                className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Previous
              </button>
            )}
            <button
              onClick={handleNext}
              className="rounded-full bg-gradient-to-r from-[#00d9ff] to-[#9d4edd] px-6 py-3 text-sm font-semibold text-white transition hover:scale-105 shadow-lg hover:shadow-xl"
            >
              {isLastStep ? "Let's Start!" : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
