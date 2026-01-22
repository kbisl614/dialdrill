'use client';

import { useState, useEffect } from 'react';
import { Activity, Clock, MessageCircle, TrendingUp, Volume2 } from 'lucide-react';
import clientLogger from '@/lib/client-logger';

interface VoiceAnalytics {
  avgSpeakingPace: number;
  paceVariability: number;
  fillerWordCount: number;
  fillerWordRate: number;
  pauseCount: number;
  turnCount: number;
  avgTurnLengthWords: number;
  longestTurnWords: number;
  energyLevel: 'low' | 'medium' | 'high';
  toneConsistency: number;
  userTalkTimeSeconds: number;
  agentTalkTimeSeconds: number;
  silenceTimeSeconds: number;
  listeningRatio: number;
  questionCount: number;
  questionQualityScore: number;
}

interface VoiceAnalyticsPanelProps {
  callLogId: string;
}

export default function VoiceAnalyticsPanel({ callLogId }: VoiceAnalyticsPanelProps) {
  const [analytics, setAnalytics] = useState<VoiceAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const response = await fetch(`/api/analytics/voice/${callLogId}`);

        if (response.ok) {
          const data = await response.json();
          setAnalytics(data.analytics);
        }
      } catch (err) {
        clientLogger.error('Error fetching voice analytics', err);
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, [callLogId]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return null;
  }


  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const metrics = [
    {
      icon: Activity,
      label: 'Speaking Pace',
      value: `${analytics.avgSpeakingPace} WPM`,
      description: 'Words per minute',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950/20',
    },
    {
      icon: MessageCircle,
      label: 'Filler Words',
      value: analytics.fillerWordCount.toString(),
      description: `${analytics.fillerWordRate.toFixed(2)} per 100 words`,
      color: analytics.fillerWordRate > 3 ? 'text-red-600' : 'text-green-600',
      bgColor:
        analytics.fillerWordRate > 3
          ? 'bg-red-50 dark:bg-red-950/20'
          : 'bg-green-50 dark:bg-green-950/20',
    },
    {
      icon: MessageCircle,
      label: 'Questions Asked',
      value: analytics.questionCount.toString(),
      description: `Quality: ${analytics.questionQualityScore.toFixed(1)}/10`,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950/20',
    },
    {
      icon: Volume2,
      label: 'Energy Level',
      value: analytics.energyLevel.charAt(0).toUpperCase() + analytics.energyLevel.slice(1),
      description: 'Overall engagement',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-950/20',
    },
    {
      icon: Clock,
      label: 'Your Talk Time',
      value: formatTime(analytics.userTalkTimeSeconds),
      description: `${Math.round((analytics.userTalkTimeSeconds / (analytics.userTalkTimeSeconds + analytics.agentTalkTimeSeconds)) * 100)}% of conversation`,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950/20',
    },
    {
      icon: TrendingUp,
      label: 'Listening Ratio',
      value: analytics.listeningRatio.toFixed(2),
      description: analytics.listeningRatio < 0.5 ? 'Excellent!' : analytics.listeningRatio < 1 ? 'Good' : 'Talk less',
      color:
        analytics.listeningRatio < 0.5
          ? 'text-green-600'
          : analytics.listeningRatio < 1
            ? 'text-blue-600'
            : 'text-yellow-600',
      bgColor:
        analytics.listeningRatio < 0.5
          ? 'bg-green-50 dark:bg-green-950/20'
          : analytics.listeningRatio < 1
            ? 'bg-blue-50 dark:bg-blue-950/20'
            : 'bg-yellow-50 dark:bg-yellow-950/20',
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
        <div className="flex items-center">
          <Activity className="w-6 h-6 mr-3" />
          <div>
            <h2 className="text-2xl font-bold">Voice Analytics</h2>
            <p className="text-indigo-100 text-sm mt-1">Speech patterns and conversation dynamics</p>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div
              key={index}
              className={`${metric.bgColor} rounded-lg p-4 border ${metric.bgColor.replace('bg-', 'border-').replace('dark:bg-', 'dark:border-')}`}
            >
              <div className="flex items-start justify-between mb-2">
                <Icon className={`w-5 h-5 ${metric.color}`} />
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">{metric.label}</div>
              <div className={`text-2xl font-bold ${metric.color} mb-1`}>{metric.value}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{metric.description}</div>
            </div>
          );
        })}
      </div>

      {/* Detailed Breakdown */}
      <div className="px-6 pb-6">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Conversation Breakdown</h3>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600 dark:text-gray-400">Your talk time</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {formatTime(analytics.userTalkTimeSeconds)}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{
                  width: `${(analytics.userTalkTimeSeconds / (analytics.userTalkTimeSeconds + analytics.agentTalkTimeSeconds)) * 100}%`,
                }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600 dark:text-gray-400">Prospect talk time</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {formatTime(analytics.agentTalkTimeSeconds)}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-purple-600 h-2 rounded-full"
                style={{
                  width: `${(analytics.agentTalkTimeSeconds / (analytics.userTalkTimeSeconds + analytics.agentTalkTimeSeconds)) * 100}%`,
                }}
              ></div>
            </div>
          </div>

          <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{analytics.turnCount}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Your turns</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {analytics.avgTurnLengthWords}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Avg words/turn</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {analytics.longestTurnWords}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Longest turn</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
