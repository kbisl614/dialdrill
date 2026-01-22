/**
 * Voice Analytics System - Speech pattern analysis
 * Extracts speaking metrics from call transcripts
 */

import { TranscriptEntry } from './ai-coach';
import { logger } from './logger';

export interface VoiceAnalytics {
  // Speech metrics
  avgSpeakingPace: number; // Words per minute
  paceVariability: number; // Variance in WPM across turns
  fillerWordCount: number;
  fillerWordRate: number; // Per 100 words
  pauseCount: number;
  avgPauseDurationMs: number;

  // Conversation flow
  turnCount: number;
  avgTurnLengthWords: number;
  longestTurnWords: number;
  interruptionCount: number;

  // Tone & energy
  energyLevel: 'low' | 'medium' | 'high';
  toneConsistency: number; // 0-1 score

  // Time distribution
  userTalkTimeSeconds: number;
  agentTalkTimeSeconds: number;
  silenceTimeSeconds: number;
  listeningRatio: number; // agent words / user words

  // Question analytics
  questionCount: number;
  questionQualityScore: number; // 0-10
}

// Common filler words to detect
const FILLER_WORDS = [
  'um',
  'uh',
  'like',
  'you know',
  'so',
  'actually',
  'basically',
  'literally',
  'sort of',
  'kind of',
  'i mean',
  'right?',
  'okay?',
  'yeah',
  'well',
];

// Question patterns
const QUESTION_PATTERNS = {
  open: [
    /what.*(?:looking for|trying to|hoping to|need)/i,
    /how.*(?:currently|doing|handling)/i,
    /tell me (?:about|more)/i,
    /walk me through/i,
    /describe.*(?:process|situation|challenge)/i,
    /why.*(?:important|matter|decide)/i,
  ],
  discovery: [
    /what(?:'s| is).*(?:biggest|main|primary|top) (?:challenge|problem|issue|concern)/i,
    /how.*(?:affecting|impacting|costing)/i,
    /who.*(?:involved|affected|responsible)/i,
    /when.*(?:need|start|deadline)/i,
    /what happens if/i,
  ],
  closed: [/^(?:do|does|is|are|can|could|would|will|have|has)/i],
};

/**
 * Analyze transcript for voice/speech patterns
 */
export function analyzeVoiceMetrics(
  transcript: TranscriptEntry[],
  callDurationSeconds: number
): VoiceAnalytics {
  // Separate user and agent turns
  const userTurns = transcript.filter((t) => t.role === 'user');
  const agentTurns = transcript.filter((t) => t.role === 'agent');

  // Calculate word counts
  const userWords = userTurns.map((t) => t.text.split(/\s+/).length);
  const agentWords = agentTurns.map((t) => t.text.split(/\s+/).length);
  const totalUserWords = userWords.reduce((sum, count) => sum + count, 0);
  const totalAgentWords = agentWords.reduce((sum, count) => sum + count, 0);

  // Calculate speaking pace (WPM)
  const userTalkTimeSeconds = Math.max(callDurationSeconds * 0.4, 1); // Estimate
  const agentTalkTimeSeconds = Math.max(callDurationSeconds * 0.4, 1);
  const avgUserWPM = Math.round((totalUserWords / userTalkTimeSeconds) * 60);

  // Calculate pace variability
  const userWPMs = userTurns
    .map((turn, idx) => {
      const words = userWords[idx];
      const estimatedSeconds = Math.max(words / 2.5, 1); // ~150 WPM average
      return (words / estimatedSeconds) * 60;
    })
    .filter((wpm) => !isNaN(wpm) && wpm > 0);

  const paceVariability = calculateVariance(userWPMs);

  // Count filler words
  const fillerWordCount = countFillerWords(userTurns);
  const fillerWordRate = totalUserWords > 0 ? (fillerWordCount / totalUserWords) * 100 : 0;

  // Analyze turn lengths
  const avgTurnLengthWords = totalUserWords / Math.max(userTurns.length, 1);
  const longestTurnWords = Math.max(...userWords, 0);

  // Detect questions
  const questions = analyzeQuestions(userTurns);

  // Calculate listening ratio (lower is better for sales)
  const listeningRatio = totalUserWords > 0 ? totalAgentWords / totalUserWords : 0;

  // Estimate energy level based on avg turn length and pace
  const energyLevel = determineEnergyLevel(avgUserWPM, avgTurnLengthWords);

  // Tone consistency (based on turn length consistency)
  const toneConsistency = calculateConsistency(userWords);

  // Estimate silence time (rough approximation)
  const estimatedActiveTime = userTalkTimeSeconds + agentTalkTimeSeconds;
  const silenceTimeSeconds = Math.max(callDurationSeconds - estimatedActiveTime, 0);

  return {
    avgSpeakingPace: avgUserWPM,
    paceVariability: Math.round(paceVariability * 100) / 100,
    fillerWordCount,
    fillerWordRate: Math.round(fillerWordRate * 100) / 100,
    pauseCount: estimatePauseCount(userTurns),
    avgPauseDurationMs: 0, // Would need audio analysis

    turnCount: userTurns.length,
    avgTurnLengthWords: Math.round(avgTurnLengthWords),
    longestTurnWords,
    interruptionCount: 0, // Would need timing data

    energyLevel,
    toneConsistency: Math.round(toneConsistency * 100) / 100,

    userTalkTimeSeconds: Math.round(userTalkTimeSeconds),
    agentTalkTimeSeconds: Math.round(agentTalkTimeSeconds),
    silenceTimeSeconds: Math.round(silenceTimeSeconds),
    listeningRatio: Math.round(listeningRatio * 100) / 100,

    questionCount: questions.count,
    questionQualityScore: questions.qualityScore,
  };
}

/**
 * Count filler words in user turns
 */
function countFillerWords(turns: TranscriptEntry[]): number {
  let count = 0;

  for (const turn of turns) {
    const lowerText = turn.text.toLowerCase();

    for (const filler of FILLER_WORDS) {
      // Use word boundaries to avoid false positives
      const regex = new RegExp(`\\b${filler}\\b`, 'gi');
      const matches = lowerText.match(regex);
      if (matches) {
        count += matches.length;
      }
    }
  }

  return count;
}

/**
 * Analyze question quality and count
 */
function analyzeQuestions(turns: TranscriptEntry[]): {
  count: number;
  qualityScore: number;
} {
  let openQuestions = 0;
  let discoveryQuestions = 0;
  let closedQuestions = 0;
  let totalQuestions = 0;

  for (const turn of turns) {
    // Split by sentence endings to catch multiple questions
    const sentences = turn.text.split(/[.!?]+/).filter((s) => s.trim().length > 0);

    for (const sentence of sentences) {
      const trimmed = sentence.trim();

      // Check if it's a question
      if (trimmed.endsWith('?') || /\b(?:what|how|why|when|where|who)\b/i.test(trimmed)) {
        totalQuestions++;

        // Classify question type
        if (QUESTION_PATTERNS.open.some((pattern) => pattern.test(trimmed))) {
          openQuestions++;
        } else if (QUESTION_PATTERNS.discovery.some((pattern) => pattern.test(trimmed))) {
          discoveryQuestions++;
        } else if (QUESTION_PATTERNS.closed.some((pattern) => pattern.test(trimmed))) {
          closedQuestions++;
        }
      }
    }
  }

  // Calculate quality score (0-10)
  // Open and discovery questions are high quality
  // Closed questions are lower quality
  const qualityScore = totalQuestions > 0
    ? Math.min(
        ((openQuestions * 10 + discoveryQuestions * 8 + closedQuestions * 4) / totalQuestions / 10) * 10,
        10
      )
    : 0;

  return {
    count: totalQuestions,
    qualityScore: Math.round(qualityScore * 10) / 10,
  };
}

/**
 * Calculate variance in a series of numbers
 */
function calculateVariance(numbers: number[]): number {
  if (numbers.length === 0) return 0;

  const mean = numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
  const squaredDiffs = numbers.map((n) => Math.pow(n - mean, 2));
  const variance = squaredDiffs.reduce((sum, n) => sum + n, 0) / numbers.length;

  return Math.sqrt(variance); // Return standard deviation
}

/**
 * Calculate consistency in turn lengths (0-1, higher is more consistent)
 */
function calculateConsistency(wordCounts: number[]): number {
  if (wordCounts.length < 2) return 1.0;

  const variance = calculateVariance(wordCounts);
  const mean = wordCounts.reduce((sum, n) => sum + n, 0) / wordCounts.length;

  // Coefficient of variation (CV), inverted to get consistency
  const cv = mean > 0 ? variance / mean : 0;
  const consistency = Math.max(0, 1 - Math.min(cv, 1));

  return consistency;
}

/**
 * Determine energy level based on speaking pace and turn length
 */
function determineEnergyLevel(wpm: number, avgTurnLength: number): 'low' | 'medium' | 'high' {
  // High energy: fast pace (>160 WPM) and longer turns
  if (wpm > 160 && avgTurnLength > 30) {
    return 'high';
  }

  // Low energy: slow pace (<120 WPM) or very short turns
  if (wpm < 120 || avgTurnLength < 15) {
    return 'low';
  }

  return 'medium';
}

/**
 * Estimate pause count based on turn structure
 */
function estimatePauseCount(turns: TranscriptEntry[]): number {
  let pauseCount = 0;

  for (const turn of turns) {
    // Look for common pause indicators
    const text = turn.text;

    // Multiple commas often indicate pauses
    pauseCount += (text.match(/,/g) || []).length;

    // Ellipsis indicates pauses
    pauseCount += (text.match(/\.\.\./g) || []).length * 2;

    // Long dashes indicate pauses
    pauseCount += (text.match(/—/g) || []).length;
  }

  return pauseCount;
}

/**
 * Save voice analytics to database
 */
import type { Pool } from 'pg';

export async function saveVoiceAnalytics(
  pool: Pool,
  callLogId: string,
  analytics: VoiceAnalytics
): Promise<void> {
  try {
    await pool.query(
      `
      INSERT INTO voice_analytics (
        call_log_id,
        avg_speaking_pace,
        pace_variability,
        filler_word_count,
        filler_word_rate,
        pause_count,
        avg_pause_duration_ms,
        turn_count,
        avg_turn_length_words,
        longest_turn_words,
        interruption_count,
        energy_level,
        tone_consistency,
        user_talk_time_seconds,
        agent_talk_time_seconds,
        silence_time_seconds,
        listening_ratio,
        question_count,
        question_quality_score
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
      ON CONFLICT (call_log_id)
      DO UPDATE SET
        avg_speaking_pace = EXCLUDED.avg_speaking_pace,
        pace_variability = EXCLUDED.pace_variability,
        filler_word_count = EXCLUDED.filler_word_count,
        filler_word_rate = EXCLUDED.filler_word_rate,
        pause_count = EXCLUDED.pause_count,
        avg_pause_duration_ms = EXCLUDED.avg_pause_duration_ms,
        turn_count = EXCLUDED.turn_count,
        avg_turn_length_words = EXCLUDED.avg_turn_length_words,
        longest_turn_words = EXCLUDED.longest_turn_words,
        interruption_count = EXCLUDED.interruption_count,
        energy_level = EXCLUDED.energy_level,
        tone_consistency = EXCLUDED.tone_consistency,
        user_talk_time_seconds = EXCLUDED.user_talk_time_seconds,
        agent_talk_time_seconds = EXCLUDED.agent_talk_time_seconds,
        silence_time_seconds = EXCLUDED.silence_time_seconds,
        listening_ratio = EXCLUDED.listening_ratio,
        question_count = EXCLUDED.question_count,
        question_quality_score = EXCLUDED.question_quality_score
    `,
      [
        callLogId,
        analytics.avgSpeakingPace,
        analytics.paceVariability,
        analytics.fillerWordCount,
        analytics.fillerWordRate,
        analytics.pauseCount,
        analytics.avgPauseDurationMs,
        analytics.turnCount,
        analytics.avgTurnLengthWords,
        analytics.longestTurnWords,
        analytics.interruptionCount,
        analytics.energyLevel,
        analytics.toneConsistency,
        analytics.userTalkTimeSeconds,
        analytics.agentTalkTimeSeconds,
        analytics.silenceTimeSeconds,
        analytics.listeningRatio,
        analytics.questionCount,
        analytics.questionQualityScore,
      ]
    );

    logger.debug(`[Voice Analytics] Saved analytics for call ${callLogId}`);
  } catch (error) {
    logger.error('[Voice Analytics] Error saving analytics', error);
    throw error;
  }
}

/**
 * Retrieve voice analytics from database
 */
export async function getVoiceAnalytics(pool: Pool, callLogId: string): Promise<VoiceAnalytics | null> {
  try {
    const result = await pool.query(
      `
      SELECT
        avg_speaking_pace,
        pace_variability,
        filler_word_count,
        filler_word_rate,
        pause_count,
        avg_pause_duration_ms,
        turn_count,
        avg_turn_length_words,
        longest_turn_words,
        interruption_count,
        energy_level,
        tone_consistency,
        user_talk_time_seconds,
        agent_talk_time_seconds,
        silence_time_seconds,
        listening_ratio,
        question_count,
        question_quality_score
      FROM voice_analytics
      WHERE call_log_id = $1
    `,
      [callLogId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];

    return {
      avgSpeakingPace: row.avg_speaking_pace,
      paceVariability: parseFloat(row.pace_variability),
      fillerWordCount: row.filler_word_count,
      fillerWordRate: parseFloat(row.filler_word_rate),
      pauseCount: row.pause_count,
      avgPauseDurationMs: row.avg_pause_duration_ms,
      turnCount: row.turn_count,
      avgTurnLengthWords: row.avg_turn_length_words,
      longestTurnWords: row.longest_turn_words,
      interruptionCount: row.interruption_count,
      energyLevel: row.energy_level as 'low' | 'medium' | 'high',
      toneConsistency: parseFloat(row.tone_consistency),
      userTalkTimeSeconds: row.user_talk_time_seconds,
      agentTalkTimeSeconds: row.agent_talk_time_seconds,
      silenceTimeSeconds: row.silence_time_seconds,
      listeningRatio: parseFloat(row.listening_ratio),
      questionCount: row.question_count,
      questionQualityScore: parseFloat(row.question_quality_score),
    };
  } catch (error) {
    logger.error('[Voice Analytics] Error retrieving analytics', error);
    return null;
  }
}
