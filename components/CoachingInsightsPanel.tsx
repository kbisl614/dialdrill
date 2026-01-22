'use client';

import { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, Target, MessageSquare, AlertCircle, Lightbulb, CheckCircle2 } from 'lucide-react';
import clientLogger from '@/lib/client-logger';

interface CoachingInsight {
  category: string;
  strength?: string;
  improvement?: string;
  example?: {
    quote: string;
    context: string;
    suggestion: string;
  };
}

interface CoachingData {
  strengths: CoachingInsight[];
  improvementAreas: CoachingInsight[];
  specificExamples: Array<{
    quote: string;
    analysis: string;
    rating: 'excellent' | 'good' | 'needs-work';
  }>;
  recommendedPractice: {
    focusArea: string;
    reason: string;
    suggestedScenarios: string[];
    practiceExercises: string[];
  };
  suggestedPhrases: Array<{
    situation: string;
    phrase: string;
    whenToUse: string;
  }>;
  categoryFeedback: {
    opening?: string;
    discovery?: string;
    objectionHandling?: string;
    closing?: string;
    clarity?: string;
  };
}

interface CoachingInsightsPanelProps {
  callLogId: string;
}

export default function CoachingInsightsPanel({ callLogId }: CoachingInsightsPanelProps) {
  const [coaching, setCoaching] = useState<CoachingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'strengths' | 'improvements' | 'phrases' | 'practice'>('strengths');

  useEffect(() => {
    async function fetchCoaching() {
      try {
        const response = await fetch(`/api/coaching/${callLogId}`);

        if (!response.ok) {
          if (response.status === 404) {
            const data = await response.json();
            setError(data.message || 'AI coaching not available for this call');
          } else {
            throw new Error('Failed to fetch coaching insights');
          }
          return;
        }

        const data = await response.json();
        setCoaching(data.coaching);
      } catch (err) {
        clientLogger.error('Error fetching coaching', err);
        setError('Unable to load coaching insights');
      } finally {
        setLoading(false);
      }
    }

    fetchCoaching();
  }, [callLogId]);

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 rounded-xl p-8 border border-purple-200 dark:border-purple-800">
        <div className="animate-pulse flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-purple-500 mr-2" />
          <span className="text-gray-600 dark:text-gray-300">Loading AI coaching insights...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-950/20 rounded-xl p-6 border border-yellow-200 dark:border-yellow-800">
        <div className="flex items-start">
          <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-1">AI Coaching Not Available</h3>
            <p className="text-sm text-yellow-800 dark:text-yellow-200">{error}</p>
            <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-2">
              To enable AI coaching, configure your OPENAI_API_KEY environment variable.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!coaching) {
    return null;
  }

  const categoryIcons: Record<string, string> = {
    opening: '👋',
    discovery: '🔍',
    objectionHandling: '🛡️',
    closing: '🎯',
    clarity: '💬',
  };

  const tabs = [
    { id: 'strengths' as const, label: 'Strengths', icon: CheckCircle2 },
    { id: 'improvements' as const, label: 'Improvements', icon: TrendingUp },
    { id: 'phrases' as const, label: 'Suggested Phrases', icon: MessageSquare },
    { id: 'practice' as const, label: 'Next Steps', icon: Target },
  ];

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 rounded-xl border border-purple-200 dark:border-purple-800 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
        <div className="flex items-center">
          <Sparkles className="w-6 h-6 mr-3" />
          <div>
            <h2 className="text-2xl font-bold">AI Coaching Insights</h2>
            <p className="text-purple-100 text-sm mt-1">Personalized feedback powered by GPT-4</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 bg-white dark:bg-gray-900">
        {/* Strengths Tab */}
        {activeTab === 'strengths' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center mb-4">
              <CheckCircle2 className="w-5 h-5 text-green-600 mr-2" />
              What You Did Well
            </h3>
            {coaching.strengths.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400">No specific strengths identified in this call.</p>
            ) : (
              coaching.strengths.map((strength, index) => (
                <div
                  key={index}
                  className="bg-green-50 dark:bg-green-950/20 rounded-lg p-4 border border-green-200 dark:border-green-800"
                >
                  <div className="flex items-start">
                    <span className="text-2xl mr-3">{categoryIcons[strength.category] || '✓'}</span>
                    <div className="flex-1">
                      <div className="font-medium text-green-900 dark:text-green-100 mb-1 capitalize">
                        {strength.category.replace(/([A-Z])/g, ' $1').trim()}
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 mb-3">{strength.strength}</p>
                      {strength.example && (
                        <div className="bg-white dark:bg-gray-800 rounded p-3 border-l-4 border-green-500">
                          <p className="text-sm italic text-gray-600 dark:text-gray-400 mb-2">
                            &ldquo;{strength.example.quote}&rdquo;
                          </p>
                          <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                            <strong>Why this worked:</strong> {strength.example.context}
                          </p>
                          <p className="text-sm text-green-700 dark:text-green-300">
                            <strong>Keep doing:</strong> {strength.example.suggestion}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Improvements Tab */}
        {activeTab === 'improvements' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center mb-4">
              <TrendingUp className="w-5 h-5 text-blue-600 mr-2" />
              Areas for Growth
            </h3>
            {coaching.improvementAreas.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400">Great job! No major improvements needed.</p>
            ) : (
              coaching.improvementAreas.map((improvement, index) => (
                <div
                  key={index}
                  className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800"
                >
                  <div className="flex items-start">
                    <span className="text-2xl mr-3">{categoryIcons[improvement.category] || '📈'}</span>
                    <div className="flex-1">
                      <div className="font-medium text-blue-900 dark:text-blue-100 mb-1 capitalize">
                        {improvement.category.replace(/([A-Z])/g, ' $1').trim()}
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 mb-3">{improvement.improvement}</p>
                      {improvement.example && (
                        <div className="bg-white dark:bg-gray-800 rounded p-3 border-l-4 border-blue-500">
                          {improvement.example.quote && (
                            <p className="text-sm italic text-gray-600 dark:text-gray-400 mb-2">
                              &ldquo;{improvement.example.quote}&rdquo;
                            </p>
                          )}
                          <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                            <strong>Why improve:</strong> {improvement.example.context}
                          </p>
                          <p className="text-sm text-blue-700 dark:text-blue-300">
                            <strong>Try this instead:</strong> {improvement.example.suggestion}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Suggested Phrases Tab */}
        {activeTab === 'phrases' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center mb-4">
              <MessageSquare className="w-5 h-5 text-purple-600 mr-2" />
              Phrases to Use in Your Next Call
            </h3>
            {coaching.suggestedPhrases.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400">No suggested phrases available.</p>
            ) : (
              <div className="grid gap-3">
                {coaching.suggestedPhrases.map((phrase, index) => (
                  <div
                    key={index}
                    className="bg-purple-50 dark:bg-purple-950/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800"
                  >
                    <div className="font-medium text-purple-900 dark:text-purple-100 mb-2">{phrase.situation}</div>
                    <div className="bg-white dark:bg-gray-800 rounded p-3 mb-2 border-l-4 border-purple-500">
                      <p className="text-gray-900 dark:text-gray-100 font-medium">&ldquo;{phrase.phrase}&rdquo;</p>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <strong>When to use:</strong> {phrase.whenToUse}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Practice Tab */}
        {activeTab === 'practice' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center mb-4">
                <Target className="w-5 h-5 text-orange-600 mr-2" />
                Your Next Practice Focus
              </h3>
              <div className="bg-orange-50 dark:bg-orange-950/20 rounded-lg p-5 border border-orange-200 dark:border-orange-800">
                <div className="text-xl font-bold text-orange-900 dark:text-orange-100 mb-2">
                  {coaching.recommendedPractice.focusArea}
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-4">{coaching.recommendedPractice.reason}</p>

                {coaching.recommendedPractice.suggestedScenarios.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center">
                      <Lightbulb className="w-4 h-4 mr-2" />
                      Recommended Scenarios
                    </h4>
                    <ul className="space-y-2">
                      {coaching.recommendedPractice.suggestedScenarios.map((scenario, index) => (
                        <li key={index} className="flex items-start text-gray-700 dark:text-gray-300">
                          <span className="text-orange-600 mr-2">•</span>
                          <span>{scenario}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {coaching.recommendedPractice.practiceExercises.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Practice Exercises</h4>
                    <ul className="space-y-2">
                      {coaching.recommendedPractice.practiceExercises.map((exercise, index) => (
                        <li key={index} className="flex items-start text-gray-700 dark:text-gray-300">
                          <span className="text-orange-600 mr-2">✓</span>
                          <span>{exercise}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
