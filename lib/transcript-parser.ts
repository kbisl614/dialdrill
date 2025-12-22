/**
 * Transcript parsing and signal extraction.
 *
 * Deterministic analysis of call transcripts to extract scoring signals.
 */

import {
  TranscriptSignals,
  OBJECTION_PATTERNS,
  FILLER_WORDS,
  QUESTION_PATTERNS,
  VALUE_PROP_PATTERNS,
  CTA_PATTERNS
} from './scoring-framework';

export interface TranscriptEntry {
  role: 'user' | 'agent';
  text: string;
  timestamp?: string | null;
}

/**
 * Extract all signals from a transcript
 */
export function parseTranscript(transcript: TranscriptEntry[]): TranscriptSignals {
  const userTurns = transcript.filter(t => t.role === 'user');
  const agentTurns = transcript.filter(t => t.role === 'agent');

  // Opening analysis (first 3 user turns)
  const openingTurns = userTurns.slice(0, 3).map(t => t.text);
  const openingText = openingTurns.join(' ');

  // Closing analysis (last 3 user turns)
  const closingTurns = userTurns.slice(-3).map(t => t.text);
  const closingText = closingTurns.join(' ');

  // Word counts
  const userWordCount = countWords(userTurns.map(t => t.text).join(' '));
  const agentWordCount = countWords(agentTurns.map(t => t.text).join(' '));
  const listeningRatio = userWordCount > 0 ? agentWordCount / userWordCount : 0;

  // Questions asked by user (rep)
  const questionsAsked = extractQuestions(userTurns.map(t => t.text));

  // Objections from agent (prospect)
  const objections = extractObjections(transcript);

  // Filler words
  const fillerWords = extractFillerWords(userTurns.map(t => t.text));

  // Turn length analysis
  const userWordCounts = userTurns.map(t => countWords(t.text));
  const avgWordsPerTurn = userWordCounts.length > 0
    ? userWordCounts.reduce((sum, c) => sum + c, 0) / userWordCounts.length
    : 0;
  const longestTurn = userWordCounts.length > 0 ? Math.max(...userWordCounts) : 0;

  return {
    openingTurns,
    hasGreeting: detectGreeting(openingText),
    hasValueProp: detectValueProp(openingText),
    openingWordCount: countWords(openingText),
    questionsAsked,
    questionQuality: assessQuestionQuality(questionsAsked),
    listeningRatio,
    objections,
    fillerWords,
    avgWordsPerTurn,
    longestTurn,
    closingTurns,
    hasCTA: detectCTA(closingText),
    hasNextSteps: detectNextSteps(closingText),
    closingWordCount: countWords(closingText)
  };
}

/**
 * Count words in text
 */
function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(w => w.length > 0).length;
}

/**
 * Extract questions asked by user
 */
function extractQuestions(texts: string[]): string[] {
  const questions: string[] = [];

  for (const text of texts) {
    // Split by sentence
    const sentences = text.split(/[.!]+/).map(s => s.trim()).filter(s => s.length > 0);

    for (const sentence of sentences) {
      // Check if it's a question
      const isOpenQuestion = QUESTION_PATTERNS.open.some(pattern => pattern.test(sentence));
      const isClosedQuestion = QUESTION_PATTERNS.closed.some(pattern => pattern.test(sentence));

      if (isOpenQuestion || isClosedQuestion) {
        questions.push(sentence);
      }
    }
  }

  return questions;
}

/**
 * Assess question quality (open-ended questions are better)
 */
function assessQuestionQuality(questions: string[]): 'good' | 'weak' | 'none' {
  if (questions.length === 0) return 'none';

  const openQuestions = questions.filter(q =>
    QUESTION_PATTERNS.open.some(pattern => pattern.test(q))
  );

  const openRatio = openQuestions.length / questions.length;

  if (openRatio >= 0.6) return 'good'; // 60%+ open questions
  if (openRatio >= 0.3) return 'weak'; // 30-60% open questions
  return 'weak';
}

/**
 * Extract objections from agent responses
 */
function extractObjections(transcript: TranscriptEntry[]): TranscriptSignals['objections'] {
  const objections: TranscriptSignals['objections'] = [];

  for (let i = 0; i < transcript.length; i++) {
    const entry = transcript[i];
    if (entry.role !== 'agent') continue;

    // Check each objection type
    for (const [type, patterns] of Object.entries(OBJECTION_PATTERNS)) {
      for (const pattern of patterns) {
        if (pattern.test(entry.text)) {
          // Get user's response (next user turn)
          const userResponse = transcript.slice(i + 1).find(t => t.role === 'user');

          objections.push({
            agentText: entry.text,
            userResponse: userResponse?.text || '',
            type: type as 'price' | 'time' | 'authority' | 'need' | 'trust' | 'other',
            handled: assessObjectionHandled(userResponse?.text || '')
          });

          break; // Only count each turn once
        }
      }
    }
  }

  return objections;
}

/**
 * Assess if objection was handled (not just acknowledged)
 */
function assessObjectionHandled(userResponse: string): boolean {
  if (!userResponse || userResponse.length < 10) return false;

  // Simple heuristic: response should be substantive (>20 words)
  // and not just "okay" or "I understand"
  const wordCount = countWords(userResponse);
  if (wordCount < 15) return false;

  // Check for acknowledgement-only phrases
  const acknowledgementOnly = /^(?:okay|ok|I understand|I see|got it|makes sense)\.?$/i;
  if (acknowledgementOnly.test(userResponse.trim())) return false;

  return true;
}

/**
 * Extract filler words from user text
 */
function extractFillerWords(texts: string[]): string[] {
  const fillers: string[] = [];
  const fullText = texts.join(' ');

  for (const pattern of FILLER_WORDS) {
    const matches = fullText.match(pattern);
    if (matches) {
      fillers.push(...matches);
    }
  }

  return fillers;
}

/**
 * Detect greeting in opening
 */
function detectGreeting(openingText: string): boolean {
  const greetingPatterns = [
    /^(?:hi|hello|hey|good (?:morning|afternoon|evening))/i,
    /how are you/i,
    /thanks for (?:taking|joining)/i
  ];

  return greetingPatterns.some(pattern => pattern.test(openingText));
}

/**
 * Detect value proposition in opening
 */
function detectValueProp(openingText: string): boolean {
  return VALUE_PROP_PATTERNS.some(pattern => pattern.test(openingText));
}

/**
 * Detect call-to-action in closing
 */
function detectCTA(closingText: string): boolean {
  return CTA_PATTERNS.some(pattern => pattern.test(closingText));
}

/**
 * Detect next steps discussion in closing
 */
function detectNextSteps(closingText: string): boolean {
  const nextStepPatterns = [
    /next step/i,
    /follow up/i,
    /send (?:you|over)/i,
    /(?:email|call) you/i,
    /schedule/i,
    /calendar/i
  ];

  return nextStepPatterns.some(pattern => pattern.test(closingText));
}

/**
 * Generate metadata for scoring
 */
export function generateMetadata(
  transcript: TranscriptEntry[],
  signals: TranscriptSignals,
  durationSeconds: number
): {
  callDurationSeconds: number;
  userTurnCount: number;
  agentTurnCount: number;
  userWordCount: number;
  agentWordCount: number;
  listeningRatio: number;
  objectionsDetected: number;
  questionsAsked: number;
  fillerWordCount: number;
} {
  const userTurns = transcript.filter(t => t.role === 'user');
  const agentTurns = transcript.filter(t => t.role === 'agent');

  return {
    callDurationSeconds: durationSeconds,
    userTurnCount: userTurns.length,
    agentTurnCount: agentTurns.length,
    userWordCount: countWords(userTurns.map(t => t.text).join(' ')),
    agentWordCount: countWords(agentTurns.map(t => t.text).join(' ')),
    listeningRatio: signals.listeningRatio,
    objectionsDetected: signals.objections.length,
    questionsAsked: signals.questionsAsked.length,
    fillerWordCount: signals.fillerWords.length
  };
}
