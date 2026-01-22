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

// Part 1: Tell Us About Yourself - Form questions
const formQuestions = [
  {
    id: 'role',
    question: "What's your role?",
    type: 'select' as const,
    optional: true,
    icon: '💼',
  },
  {
    id: 'experience',
    question: "What's your sales experience level?",
    type: 'buttons' as const,
    optional: true,
    icon: '📊',
  },
  {
    id: 'mainStruggles',
    question: 'What are your main struggles?',
    type: 'multi-select' as const,
    optional: true,
    icon: '🎯',
  },
  {
    id: 'howFound',
    question: 'How did you hear about us?',
    type: 'select' as const,
    optional: true,
    icon: '📢',
  },
  {
    id: 'goals',
    question: 'What are your goals with DialDrill?',
    type: 'textarea' as const,
    optional: true,
    icon: '🚀',
  },
];

// Part 2: Welcome to DialDrill - Info screens
const onboardingSteps = [
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
  // Phase tracking: 1 = "Tell Us About Yourself" form, 2 = "Welcome to DialDrill" info screens
  const [phase, setPhase] = useState<1 | 2>(1);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  // Form state
  const [role, setRole] = useState('');
  const [experience, setExperience] = useState('');
  const [mainStruggles, setMainStruggles] = useState<string[]>([]);
  const [howFound, setHowFound] = useState('');
  const [goals, setGoals] = useState('');

  if (!isOpen) return null;

  const handleNext = () => {
    if (phase === 1) {
      // In form phase
      if (currentQuestionIndex < formQuestions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        // Move to phase 2
        setPhase(2);
        setCurrentStep(0);
      }
    } else {
      // In welcome screens phase
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
    }
  };

  const handlePrevious = () => {
    if (phase === 1) {
      if (currentQuestionIndex > 0) {
        setCurrentQuestionIndex(currentQuestionIndex - 1);
      }
    } else {
      if (currentStep > 0) {
        setCurrentStep(currentStep - 1);
      } else {
        // Go back to phase 1
        setPhase(1);
        setCurrentQuestionIndex(formQuestions.length - 1);
      }
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

  const currentQuestion = formQuestions[currentQuestionIndex];
  const step = onboardingSteps[currentStep];
  const isLastStep = phase === 2 && currentStep === onboardingSteps.length - 1;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm" />

      {/* Modal */}
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/10 bg-[#1A1F2E] shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="border-b border-white/10 bg-gradient-to-r from-[var(--color-cyan-bright)]/10 to-[#9d4edd]/10 p-8">
          <div className="text-center">
            <div className="text-6xl mb-4 animate-bounce">
              {phase === 1 ? currentQuestion.icon : step.icon}
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">
              {phase === 1 ? 'Tell Us About Yourself' : step.title}
            </h2>
            <p className="text-sm text-[var(--color-text-secondary)]">
              {phase === 1 ? 'Help us personalize your experience' : step.description}
            </p>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div
          data-lenis-prevent
          className="p-8 overflow-y-scroll flex-1 scrollbar-custom"
          style={{
            maxHeight: '500px',
            scrollbarWidth: 'auto',
            scrollbarColor: '#00d9ff #1e293b',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {phase === 1 ? (
            <div className="space-y-6">
              {/* Question Label */}
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-white mb-2">{currentQuestion.question}</h3>
                {currentQuestion.optional && (
                  <p className="text-sm text-[var(--color-text-secondary)]">Optional - skip if you prefer</p>
                )}
              </div>

              {/* Render question based on ID */}
              {currentQuestion.id === 'role' && (
                <div>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-white focus:border-[var(--color-cyan-bright)] focus:outline-none focus:ring-2 focus:ring-[var(--color-cyan-bright)]/20"
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
              )}

              {currentQuestion.id === 'experience' && (
                <div className="grid grid-cols-2 gap-3">
                  {['Beginner', 'Intermediate', 'Advanced', 'Expert'].map((level) => (
                    <button
                      key={level}
                      onClick={() => setExperience(level)}
                      className={`rounded-lg border px-4 py-3 text-sm font-semibold transition ${
                        experience === level
                          ? 'border-[var(--color-cyan-bright)] bg-[var(--color-cyan-bright)]/20 text-[var(--color-cyan-bright)]'
                          : 'border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.05]'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              )}

              {currentQuestion.id === 'mainStruggles' && (
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
                          ? 'border-[var(--color-cyan-bright)] bg-[var(--color-cyan-bright)]/20 text-[var(--color-cyan-bright)]'
                          : 'border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.05]'
                      }`}
                    >
                      <span className="mr-2">{mainStruggles.includes(struggle) ? '✓' : '○'}</span>
                      {struggle}
                    </button>
                  ))}
                </div>
              )}

              {currentQuestion.id === 'howFound' && (
                <div>
                  <select
                    value={howFound}
                    onChange={(e) => setHowFound(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-white focus:border-[var(--color-cyan-bright)] focus:outline-none focus:ring-2 focus:ring-[var(--color-cyan-bright)]/20"
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
              )}

              {currentQuestion.id === 'goals' && (
                <div>
                  <textarea
                    value={goals}
                    onChange={(e) => setGoals(e.target.value)}
                    placeholder="e.g., Close more deals, improve objection handling, build confidence..."
                    rows={4}
                    className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-white placeholder-[var(--color-text-secondary)] focus:border-[var(--color-cyan-bright)] focus:outline-none focus:ring-2 focus:ring-[var(--color-cyan-bright)]/20 resize-none"
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {step.content?.map((item, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-4 transition hover:bg-white/[0.05]"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-cyan-bright)] to-[#9d4edd] text-sm font-bold text-white flex-shrink-0">
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
          <div className="flex justify-center items-center gap-2">
            {/* Phase 1: Form Questions */}
            {formQuestions.map((_, index) => (
              <button
                key={`q-${index}`}
                onClick={() => {
                  if (phase === 1) {
                    setCurrentQuestionIndex(index);
                  }
                }}
                className={`h-2 rounded-full transition-all ${
                  phase === 1 && index === currentQuestionIndex
                    ? 'w-8 bg-gradient-to-r from-[var(--color-cyan-bright)] to-[#9d4edd]'
                    : phase === 1
                    ? 'w-2 bg-white/20 hover:bg-white/30'
                    : 'w-2 bg-[var(--color-cyan-bright)]/50'
                }`}
                aria-label={`Go to question ${index + 1}`}
              />
            ))}

            {/* Separator */}
            <div className="w-4 h-0.5 bg-white/20 mx-1" />

            {/* Phase 2: Welcome Steps */}
            {onboardingSteps.map((_, index) => (
              <button
                key={`s-${index}`}
                onClick={() => {
                  if (phase === 2) {
                    setCurrentStep(index);
                  }
                }}
                className={`h-2 rounded-full transition-all ${
                  phase === 2 && index === currentStep
                    ? 'w-8 bg-gradient-to-r from-[var(--color-cyan-bright)] to-[#9d4edd]'
                    : phase === 2
                    ? 'w-2 bg-white/20 hover:bg-white/30'
                    : 'w-2 bg-white/10'
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
            className="text-sm font-semibold text-[var(--color-text-secondary)] transition hover:text-white"
          >
            Skip {phase === 1 ? 'Questions' : 'Tutorial'}
          </button>

          <div className="flex gap-3">
            {!(phase === 1 && currentQuestionIndex === 0) && (
              <button
                onClick={handlePrevious}
                className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Previous
              </button>
            )}
            <button
              onClick={handleNext}
              className="rounded-full bg-gradient-to-r from-[var(--color-cyan-bright)] to-[#9d4edd] px-6 py-3 text-sm font-semibold text-white transition hover:scale-105 shadow-lg hover:shadow-xl"
            >
              {isLastStep ? "Let's Start!" : phase === 1 && currentQuestionIndex === formQuestions.length - 1 ? 'Continue to Tour' : 'Next'}
            </button>
          </div>
        </div>
      </div>

      {/* Add scrollbar styles - ALWAYS VISIBLE */}
      <style jsx>{`
        .scrollbar-custom {
          overflow-y: scroll !important;
          scrollbar-width: auto !important;
          scrollbar-color: #00d9ff #1e293b !important;
        }

        .scrollbar-custom::-webkit-scrollbar {
          width: 16px !important;
          display: block !important;
        }

        .scrollbar-custom::-webkit-scrollbar-track {
          background: #1e293b !important;
          border-radius: 0px !important;
          display: block !important;
        }

        .scrollbar-custom::-webkit-scrollbar-thumb {
          background: #00d9ff !important;
          border-radius: 0px !important;
          border: 3px solid #1e293b !important;
          min-height: 50px !important;
          display: block !important;
        }

        .scrollbar-custom::-webkit-scrollbar-thumb:hover {
          background: #00ffea !important;
          cursor: pointer !important;
        }

        .scrollbar-custom::-webkit-scrollbar-thumb:active {
          background: #00d9ff !important;
        }

        /* Force scrollbar to always appear */
        .scrollbar-custom::-webkit-scrollbar-button {
          display: block !important;
          height: 0px !important;
        }
      `}</style>
    </>
  );
}
