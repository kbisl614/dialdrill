'use client';

import { useState } from 'react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (userData?: OnboardingUserData) => void;
}

interface OnboardingUserData {
  role?: string;
  experience?: string;
  mainStruggles?: string[];
  howFound?: string;
  goals?: string;
}

const onboardingSteps = [
  {
    type: 'form' as const,
    title: 'Tell Us About Yourself',
    icon: '👤',
    description: 'Help us personalize your experience',
  },
  {
    type: 'content' as const,
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
    type: 'content' as const,
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
    type: 'content' as const,
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
    type: 'content' as const,
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function OnboardingModal({ isOpen, onClose, onComplete }: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(0);

  // Form state
  const [role, setRole] = useState('');
  const [experience, setExperience] = useState('');
  const [mainStruggles, setMainStruggles] = useState<string[]>([]);
  const [howFound, setHowFound] = useState('');
  const [goals, setGoals] = useState('');

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding with collected data
      const userData: OnboardingUserData = {
        role: role || undefined,
        experience: experience || undefined,
        mainStruggles: mainStruggles.length > 0 ? mainStruggles : undefined,
        howFound: howFound || undefined,
        goals: goals || undefined,
      };
      onComplete(userData);
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

  const toggleStruggle = (struggle: string) => {
    if (mainStruggles.includes(struggle)) {
      setMainStruggles(mainStruggles.filter(s => s !== struggle));
    } else {
      setMainStruggles([...mainStruggles, struggle]);
    }
  };

  const step = onboardingSteps[currentStep];
  const isLastStep = currentStep === onboardingSteps.length - 1;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm" />

      {/* Modal */}
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/10 bg-[#1A1F2E] shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="border-b border-white/10 bg-gradient-to-r from-[#00d9ff]/10 to-[#9d4edd]/10 p-8">
          <div className="text-center">
            <div className="text-6xl mb-4 animate-bounce">{step.icon}</div>
            <h2 className="text-3xl font-bold text-white mb-2">{step.title}</h2>
            <p className="text-sm text-[#9ca3af]">{step.description}</p>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="p-8 overflow-y-auto flex-1">
          {step.type === 'form' ? (
            <div className="space-y-6">
              {/* Role/Title */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  What's your role? <span className="text-[#9ca3af] font-normal">(Optional)</span>
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-white focus:border-[#00d9ff] focus:outline-none focus:ring-2 focus:ring-[#00d9ff]/20"
                >
                  <option value="">Select your role</option>
                  <option value="sdr">SDR / BDR</option>
                  <option value="ae">Account Executive</option>
                  <option value="closer">Closer</option>
                  <option value="manager">Sales Manager</option>
                  <option value="entrepreneur">Entrepreneur / Founder</option>
                  <option value="student">Student</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Experience Level */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Sales experience level? <span className="text-[#9ca3af] font-normal">(Optional)</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {['Beginner', 'Intermediate', 'Advanced', 'Expert'].map((level) => (
                    <button
                      key={level}
                      onClick={() => setExperience(level)}
                      className={`rounded-lg border px-4 py-3 text-sm font-semibold transition ${
                        experience === level
                          ? 'border-[#00d9ff] bg-[#00d9ff]/20 text-[#00d9ff]'
                          : 'border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.05]'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Main Struggles */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  What are your main struggles? <span className="text-[#9ca3af] font-normal">(Select all that apply)</span>
                </label>
                <div className="space-y-2">
                  {[
                    'Handling objections',
                    'Closing deals',
                    'Building rapport',
                    'Discovery questions',
                    'Cold calling confidence',
                    'Talking too fast/slow',
                    'Filler words (um, uh, like)',
                    'Product knowledge',
                  ].map((struggle) => (
                    <button
                      key={struggle}
                      onClick={() => toggleStruggle(struggle)}
                      className={`w-full text-left rounded-lg border px-4 py-3 text-sm font-medium transition ${
                        mainStruggles.includes(struggle)
                          ? 'border-[#00d9ff] bg-[#00d9ff]/20 text-[#00d9ff]'
                          : 'border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.05]'
                      }`}
                    >
                      <span className="mr-2">{mainStruggles.includes(struggle) ? '✓' : '○'}</span>
                      {struggle}
                    </button>
                  ))}
                </div>
              </div>

              {/* How did you find us */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  How did you find DialDrill? <span className="text-[#9ca3af] font-normal">(Optional)</span>
                </label>
                <select
                  value={howFound}
                  onChange={(e) => setHowFound(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-white focus:border-[#00d9ff] focus:outline-none focus:ring-2 focus:ring-[#00d9ff]/20"
                >
                  <option value="">Select an option</option>
                  <option value="google">Google Search</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="twitter">Twitter / X</option>
                  <option value="reddit">Reddit</option>
                  <option value="youtube">YouTube</option>
                  <option value="friend">Friend / Colleague</option>
                  <option value="sales_community">Sales Community</option>
                  <option value="podcast">Podcast</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Goals */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  What's your main goal? <span className="text-[#9ca3af] font-normal">(Optional)</span>
                </label>
                <textarea
                  value={goals}
                  onChange={(e) => setGoals(e.target.value)}
                  placeholder="e.g., Close more deals, improve objection handling, build confidence..."
                  rows={3}
                  className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-white placeholder-[#9ca3af] focus:border-[#00d9ff] focus:outline-none focus:ring-2 focus:ring-[#00d9ff]/20 resize-none"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {step.content?.map((item, index) => (
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
          )}
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
