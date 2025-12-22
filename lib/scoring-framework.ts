/**
 * Post-call scoring framework for sales training transcripts.
 *
 * Deterministic, explainable scoring based on transcript analysis.
 * Each category scored 0-10 with clear criteria.
 */

export interface ScoringCategory {
  name: string;
  key: string;
  maxScore: number;
  weight: number; // for weighted average
  description: string;
}

export const SCORING_CATEGORIES: ScoringCategory[] = [
  {
    name: 'Opening',
    key: 'opening',
    maxScore: 10,
    weight: 1.0,
    description: 'Introduction quality, rapport building, and initial value proposition'
  },
  {
    name: 'Discovery',
    key: 'discovery',
    maxScore: 10,
    weight: 1.5,
    description: 'Question quality, listening ratio, and uncovering needs'
  },
  {
    name: 'Objection Handling',
    key: 'objectionHandling',
    maxScore: 10,
    weight: 2.0,
    description: 'Response quality to objections, overcoming resistance'
  },
  {
    name: 'Clarity',
    key: 'clarity',
    maxScore: 10,
    weight: 1.0,
    description: 'Communication conciseness, avoiding filler words, staying on message'
  },
  {
    name: 'Closing',
    key: 'closing',
    maxScore: 10,
    weight: 1.5,
    description: 'Call-to-action clarity, commitment securing, next steps'
  }
];

export interface CategoryScore {
  category: string;
  score: number;
  maxScore: number;
  signals: string[]; // What we detected in transcript
  feedback: {
    strengths: string[];
    improvements: string[];
  };
}

export interface CallScore {
  callLogId: string;
  overallScore: number; // Weighted average
  categoryScores: CategoryScore[];
  metadata: {
    callDurationSeconds: number;
    userTurnCount: number;
    agentTurnCount: number;
    userWordCount: number;
    agentWordCount: number;
    listeningRatio: number; // agent words / user words
    objectionsDetected: number;
    questionsAsked: number;
    fillerWordCount: number;
  };
  createdAt: Date;
}

/**
 * Transcript parsing signals
 */
export interface TranscriptSignals {
  // Opening signals (first 3 user turns)
  openingTurns: string[];
  hasGreeting: boolean;
  hasValueProp: boolean;
  openingWordCount: number;

  // Discovery signals
  questionsAsked: string[];
  questionQuality: 'good' | 'weak' | 'none';
  listeningRatio: number; // lower is better (rep should talk less)

  // Objection signals
  objections: Array<{
    agentText: string;
    userResponse: string;
    type: 'price' | 'time' | 'authority' | 'need' | 'trust' | 'other';
    handled: boolean;
  }>;

  // Clarity signals
  fillerWords: string[]; // uh, um, like, you know, etc.
  avgWordsPerTurn: number;
  longestTurn: number;

  // Closing signals
  closingTurns: string[]; // last 3 user turns
  hasCTA: boolean;
  hasNextSteps: boolean;
  closingWordCount: number;
}

/**
 * Objection detection patterns
 */
export const OBJECTION_PATTERNS = {
  price: [
    /too expensive/i,
    /can'?t afford/i,
    /out of (?:my|our) budget/i,
    /(?:too|very) (?:high|pricey|costly)/i,
    /cheaper (?:option|alternative)/i,
    /(?:what'?s|how much).{0,30}(?:cost|price)/i,
    /don'?t have (?:the )?(?:money|budget)/i
  ],
  time: [
    /don'?t have time/i,
    /too busy/i,
    /not (?:a|the) (?:right|good) time/i,
    /maybe (?:later|next (?:month|year|quarter))/i,
    /call (?:me )?back (?:in|next)/i,
    /swamped right now/i
  ],
  authority: [
    /need to (?:talk|check|speak) (?:to|with).{0,30}(?:boss|manager|team|partner|wife|husband)/i,
    /not my decision/i,
    /don'?t have authority/i,
    /have to run (?:this|it) by/i
  ],
  need: [
    /don'?t need/i,
    /not interested/i,
    /(?:already|current(?:ly)?) (?:have|using|working with)/i,
    /happy with (?:what|who) we have/i,
    /no (?:need|use) for/i
  ],
  trust: [
    /sounds too good to be true/i,
    /(?:never )?heard of (?:you|your company)/i,
    /how do I know/i,
    /can you prove/i,
    /skeptical/i,
    /references?/i,
    /testimonials?/i
  ]
};

/**
 * Filler word patterns
 */
export const FILLER_WORDS = [
  /\buh+\b/gi,
  /\bum+\b/gi,
  /\blike\b/gi,
  /\byou know\b/gi,
  /\bbasically\b/gi,
  /\bactually\b/gi,
  /\bkinda\b/gi,
  /\bsorta\b/gi,
  /\bI mean\b/gi,
  /\bright\?/gi,
  /\byeah\b/gi
];

/**
 * Question detection pattern
 */
export const QUESTION_PATTERNS = {
  open: [
    /^(?:what|why|how|tell me|describe|explain)/i,
    /what.{0,50}\?/i,
    /why.{0,50}\?/i,
    /how.{0,50}\?/i
  ],
  closed: [
    /^(?:is|are|do|does|can|could|would|will|have|has)/i,
    /\?$/
  ]
};

/**
 * Value proposition indicators
 */
export const VALUE_PROP_PATTERNS = [
  /help (?:you|your)/i,
  /save (?:you|your).{0,30}(?:time|money)/i,
  /increase.{0,30}(?:revenue|sales|productivity)/i,
  /reduce.{0,30}(?:cost|time|effort)/i,
  /solve.{0,30}problem/i,
  /(?:benefit|value) (?:is|of)/i
];

/**
 * CTA patterns
 */
export const CTA_PATTERNS = [
  /can (?:we|I) schedule/i,
  /let'?s (?:set up|book|schedule)/i,
  /next step/i,
  /ready to (?:move forward|get started|proceed)/i,
  /when (?:can|would) (?:you|we)/i,
  /are you (?:ready|available|interested) to/i,
  /(?:shall|should) we/i
];
