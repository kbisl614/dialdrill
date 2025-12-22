/**
 * Scoring engine: converts transcript signals into category scores + feedback.
 *
 * Deterministic scoring with explainable rationale.
 */

import {
  CallScore,
  CategoryScore,
  SCORING_CATEGORIES,
  TranscriptSignals
} from './scoring-framework';
import { parseTranscript, generateMetadata, TranscriptEntry } from './transcript-parser';

/**
 * Score a complete call transcript
 */
export function scoreCall(
  callLogId: string,
  transcript: TranscriptEntry[],
  durationSeconds: number
): CallScore {
  // Parse transcript to extract signals
  const signals = parseTranscript(transcript);
  const metadata = generateMetadata(transcript, signals, durationSeconds);

  // Score each category
  const categoryScores: CategoryScore[] = [
    scoreOpening(signals),
    scoreDiscovery(signals, metadata),
    scoreObjectionHandling(signals),
    scoreClarity(signals, metadata),
    scoreClosing(signals)
  ];

  // Calculate weighted overall score
  const overallScore = calculateWeightedScore(categoryScores);

  return {
    callLogId,
    overallScore,
    categoryScores,
    metadata,
    createdAt: new Date()
  };
}

/**
 * Calculate weighted average score
 */
function calculateWeightedScore(categoryScores: CategoryScore[]): number {
  let totalWeightedScore = 0;
  let totalWeight = 0;

  for (const catScore of categoryScores) {
    const category = SCORING_CATEGORIES.find(c => c.key === catScore.category);
    if (!category) continue;

    totalWeightedScore += catScore.score * category.weight;
    totalWeight += category.weight;
  }

  return totalWeight > 0 ? Math.round((totalWeightedScore / totalWeight) * 10) / 10 : 0;
}

/**
 * Score: Opening (0-10)
 */
function scoreOpening(signals: TranscriptSignals): CategoryScore {
  let score = 0;
  const scoreSignals: string[] = [];
  const strengths: string[] = [];
  const improvements: string[] = [];

  // Greeting (2 points)
  if (signals.hasGreeting) {
    score += 2;
    scoreSignals.push('greeting detected');
    strengths.push('Strong opening with greeting');
  } else {
    improvements.push('Start with a greeting to build rapport');
  }

  // Value prop in opening (3 points)
  if (signals.hasValueProp) {
    score += 3;
    scoreSignals.push('value proposition stated');
    strengths.push('Clear value proposition in opening');
  } else {
    improvements.push('State value proposition in first 30 seconds');
  }

  // Opening conciseness (0-5 points based on word count)
  // Ideal: 30-60 words. Too short or too long loses points.
  if (signals.openingWordCount >= 30 && signals.openingWordCount <= 60) {
    score += 5;
    scoreSignals.push('concise opening (30-60 words)');
  } else if (signals.openingWordCount >= 20 && signals.openingWordCount <= 80) {
    score += 3;
    scoreSignals.push('acceptable opening length');
  } else if (signals.openingWordCount < 20) {
    score += 1;
    scoreSignals.push('very brief opening');
    improvements.push('Opening too brief - provide more context');
  } else {
    score += 1;
    scoreSignals.push('verbose opening');
    improvements.push('Opening too long - be more concise');
  }

  if (strengths.length === 0) {
    strengths.push('Opening completed');
  }

  return {
    category: 'opening',
    score: Math.min(score, 10),
    maxScore: 10,
    signals: scoreSignals,
    feedback: { strengths, improvements }
  };
}

/**
 * Score: Discovery (0-10)
 */
function scoreDiscovery(
  signals: TranscriptSignals,
  metadata: CallScore['metadata']
): CategoryScore {
  let score = 0;
  const scoreSignals: string[] = [];
  const strengths: string[] = [];
  const improvements: string[] = [];

  // Questions asked (0-5 points)
  const questionCount = metadata.questionsAsked;
  if (questionCount >= 5) {
    score += 5;
    scoreSignals.push(`${questionCount} questions asked`);
    strengths.push('Asked multiple discovery questions');
  } else if (questionCount >= 3) {
    score += 3;
    scoreSignals.push(`${questionCount} questions asked`);
  } else if (questionCount >= 1) {
    score += 1;
    scoreSignals.push(`only ${questionCount} question(s)`);
    improvements.push('Ask more discovery questions (aim for 5+)');
  } else {
    scoreSignals.push('no questions asked');
    improvements.push('Must ask discovery questions to uncover needs');
  }

  // Question quality (0-3 points)
  if (signals.questionQuality === 'good') {
    score += 3;
    scoreSignals.push('high-quality open-ended questions');
    strengths.push('Used open-ended questions effectively');
  } else if (signals.questionQuality === 'weak') {
    score += 1;
    scoreSignals.push('mostly closed questions');
    improvements.push('Use more open-ended questions (what, why, how)');
  } else {
    scoreSignals.push('no questions');
  }

  // Listening ratio (0-2 points)
  // Good: prospect talks 60-70% (ratio 0.4-0.7)
  if (signals.listeningRatio >= 0.4 && signals.listeningRatio <= 0.7) {
    score += 2;
    scoreSignals.push('excellent listening ratio');
    strengths.push('Let prospect do most of the talking');
  } else if (signals.listeningRatio < 0.4) {
    score += 1;
    scoreSignals.push('prospect talked too much');
    improvements.push('Guide conversation more - ask targeted questions');
  } else {
    scoreSignals.push('rep talked too much');
    improvements.push('Talk less, listen more - aim for 40-50% talk time');
  }

  if (strengths.length === 0 && score >= 5) {
    strengths.push('Discovery phase completed');
  }

  return {
    category: 'discovery',
    score: Math.min(score, 10),
    maxScore: 10,
    signals: scoreSignals,
    feedback: { strengths, improvements }
  };
}

/**
 * Score: Objection Handling (0-10)
 */
function scoreObjectionHandling(signals: TranscriptSignals): CategoryScore {
  let score = 0;
  const scoreSignals: string[] = [];
  const strengths: string[] = [];
  const improvements: string[] = [];

  const objectionCount = signals.objections.length;

  if (objectionCount === 0) {
    // No objections: neutral score
    score = 7;
    scoreSignals.push('no objections encountered');
    return {
      category: 'objectionHandling',
      score,
      maxScore: 10,
      signals: scoreSignals,
      feedback: {
        strengths: ['No objections raised'],
        improvements: []
      }
    };
  }

  // Objections detected
  scoreSignals.push(`${objectionCount} objection(s) detected`);

  // Track objection types
  const types = signals.objections.map(o => o.type);
  const uniqueTypes = [...new Set(types)];
  scoreSignals.push(`types: ${uniqueTypes.join(', ')}`);

  // Handling rate (0-7 points)
  const handledCount = signals.objections.filter(o => o.handled).length;
  const handleRate = handledCount / objectionCount;

  if (handleRate >= 0.8) {
    score += 7;
    strengths.push(`Handled ${handledCount}/${objectionCount} objections effectively`);
  } else if (handleRate >= 0.5) {
    score += 4;
    improvements.push(`Only handled ${handledCount}/${objectionCount} objections - give more substantive responses`);
  } else {
    score += 1;
    improvements.push(`Weak objection handling (${handledCount}/${objectionCount}) - provide detailed responses`);
  }

  scoreSignals.push(`${handledCount}/${objectionCount} handled`);

  // Objection diversity bonus (0-3 points)
  if (uniqueTypes.length >= 3) {
    score += 3;
    strengths.push('Handled diverse objection types');
  } else if (uniqueTypes.length === 2) {
    score += 2;
  } else {
    score += 1;
  }

  if (improvements.length === 0 && score >= 7) {
    if (strengths.length === 0) {
      strengths.push('Objections handled');
    }
  }

  return {
    category: 'objectionHandling',
    score: Math.min(score, 10),
    maxScore: 10,
    signals: scoreSignals,
    feedback: { strengths, improvements }
  };
}

/**
 * Score: Clarity (0-10)
 */
function scoreClarity(
  signals: TranscriptSignals,
  metadata: CallScore['metadata']
): CategoryScore {
  let score = 10; // Start at perfect, deduct points
  const scoreSignals: string[] = [];
  const strengths: string[] = [];
  const improvements: string[] = [];

  // Filler word penalty (0-4 points deduction)
  const fillerCount = metadata.fillerWordCount;
  const fillerRate = metadata.userWordCount > 0
    ? fillerCount / metadata.userWordCount
    : 0;

  if (fillerRate <= 0.02) {
    // 2% or less: excellent
    scoreSignals.push('minimal filler words');
    strengths.push('Clear, professional communication');
  } else if (fillerRate <= 0.05) {
    // 2-5%: acceptable
    score -= 1;
    scoreSignals.push('few filler words');
  } else if (fillerRate <= 0.10) {
    // 5-10%: noticeable
    score -= 2;
    scoreSignals.push(`${fillerCount} filler words`);
    improvements.push('Reduce filler words (um, uh, like) for more polished delivery');
  } else {
    // 10%+: problematic
    score -= 4;
    scoreSignals.push(`excessive filler words (${fillerCount})`);
    improvements.push('Too many filler words - practice pausing instead');
  }

  // Turn length penalty (0-3 points deduction)
  if (signals.avgWordsPerTurn <= 40) {
    // Concise turns: good
    scoreSignals.push('concise responses');
    if (strengths.length === 0) {
      strengths.push('Responses were clear and concise');
    }
  } else if (signals.avgWordsPerTurn <= 60) {
    // Moderate
    score -= 1;
    scoreSignals.push('moderate turn length');
  } else {
    // Too verbose
    score -= 3;
    scoreSignals.push('verbose turns');
    improvements.push('Keep responses shorter - aim for 30-40 words per turn');
  }

  // Longest turn check (0-3 points deduction)
  if (signals.longestTurn <= 80) {
    scoreSignals.push('no monologues');
  } else if (signals.longestTurn <= 120) {
    score -= 1;
    scoreSignals.push('one long turn detected');
  } else {
    score -= 3;
    scoreSignals.push(`longest turn: ${signals.longestTurn} words`);
    improvements.push('Avoid long monologues - break into dialogue');
  }

  return {
    category: 'clarity',
    score: Math.max(score, 0),
    maxScore: 10,
    signals: scoreSignals,
    feedback: { strengths, improvements }
  };
}

/**
 * Score: Closing (0-10)
 */
function scoreClosing(signals: TranscriptSignals): CategoryScore {
  let score = 0;
  const scoreSignals: string[] = [];
  const strengths: string[] = [];
  const improvements: string[] = [];

  // Clear CTA (0-5 points)
  if (signals.hasCTA) {
    score += 5;
    scoreSignals.push('clear call-to-action');
    strengths.push('Clear call-to-action stated');
  } else {
    scoreSignals.push('no clear CTA');
    improvements.push('Always end with a clear call-to-action');
  }

  // Next steps defined (0-3 points)
  if (signals.hasNextSteps) {
    score += 3;
    scoreSignals.push('next steps defined');
    strengths.push('Defined clear next steps');
  } else {
    scoreSignals.push('no next steps');
    improvements.push('Specify concrete next steps before ending');
  }

  // Closing conciseness (0-2 points)
  // Ideal: 20-50 words
  if (signals.closingWordCount >= 20 && signals.closingWordCount <= 50) {
    score += 2;
    scoreSignals.push('concise close');
  } else if (signals.closingWordCount < 20) {
    score += 1;
    scoreSignals.push('brief close');
    improvements.push('Closing too brief - reinforce value and next steps');
  } else {
    scoreSignals.push('verbose close');
    improvements.push('Closing too long - be direct');
  }

  if (strengths.length === 0 && score >= 5) {
    strengths.push('Closing completed');
  }

  return {
    category: 'closing',
    score: Math.min(score, 10),
    maxScore: 10,
    signals: scoreSignals,
    feedback: { strengths, improvements }
  };
}

/**
 * Edge case: Very short calls
 */
export function isCallTooShort(durationSeconds: number, transcript: TranscriptEntry[]): boolean {
  return durationSeconds < 30 || transcript.length < 4;
}

/**
 * Generate placeholder score for very short calls
 */
export function generateShortCallScore(
  callLogId: string,
  transcript: TranscriptEntry[],
  durationSeconds: number
): CallScore {
  const signals = parseTranscript(transcript);
  const metadata = generateMetadata(transcript, signals, durationSeconds);

  return {
    callLogId,
    overallScore: 0,
    categoryScores: SCORING_CATEGORIES.map(cat => ({
      category: cat.key,
      score: 0,
      maxScore: 10,
      signals: ['call too short to score'],
      feedback: {
        strengths: [],
        improvements: ['Complete a full call (60+ seconds) to receive scoring']
      }
    })),
    metadata,
    createdAt: new Date()
  };
}
