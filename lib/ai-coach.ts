/**
 * AI Coaching System - OpenAI-powered transcript analysis
 * Provides personalized coaching insights based on call performance
 */

import OpenAI from 'openai';
import { CallScore, CategoryScore } from './scoring-framework';

// Initialize OpenAI client
const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  : null;

export interface TranscriptEntry {
  role: 'user' | 'agent';
  text: string;
  timestamp?: string | null;
}

export interface CoachingInsight {
  category: string;
  strength?: string;
  improvement?: string;
  example?: {
    quote: string;
    context: string;
    suggestion: string;
  };
}

export interface CoachingAnalysis {
  // Core coaching feedback
  strengths: CoachingInsight[];
  improvementAreas: CoachingInsight[];
  specificExamples: Array<{
    quote: string;
    analysis: string;
    rating: 'excellent' | 'good' | 'needs-work';
  }>;

  // Suggested next steps
  recommendedPractice: {
    focusArea: string;
    reason: string;
    suggestedScenarios: string[];
    practiceExercises: string[];
  };

  // Actionable phrases
  suggestedPhrases: Array<{
    situation: string;
    phrase: string;
    whenToUse: string;
  }>;

  // Category-specific feedback
  categoryFeedback: {
    opening?: string;
    discovery?: string;
    objectionHandling?: string;
    closing?: string;
    clarity?: string;
  };

  // AI metadata
  aiMetadata: {
    model: string;
    processingTimeMs: number;
    confidenceScore: number;
    tokensUsed: number;
  };
}

/**
 * Main function to analyze a call transcript and generate coaching insights
 */
export async function analyzeCallForCoaching(
  transcript: TranscriptEntry[],
  scores: CallScore,
  personalityName?: string
): Promise<CoachingAnalysis> {
  if (!openai) {
    throw new Error('OpenAI API key not configured. Please set OPENAI_API_KEY environment variable.');
  }

  const startTime = Date.now();

  try {
    // Format transcript for AI analysis
    const formattedTranscript = transcript
      .map((entry) => `${entry.role === 'user' ? 'Sales Rep' : 'Prospect'}: ${entry.text}`)
      .join('\n\n');

    // Format scores for context
    const scoresContext = scores.categoryScores
      .map((cat) => `${cat.category}: ${cat.score}/10`)
      .join(', ');

    // Build comprehensive prompt
    const systemPrompt = `You are an expert sales coach with 20+ years of experience training top-performing sales representatives. Your role is to provide actionable, specific, and encouraging feedback on sales calls.

Key principles:
- Be specific: Reference exact quotes from the transcript
- Be balanced: Find genuine strengths AND areas for improvement
- Be actionable: Provide concrete phrases and techniques
- Be encouraging: Frame feedback positively while being honest
- Focus on sales fundamentals: opening, discovery, objection handling, closing, and clarity`;

    const userPrompt = `Analyze this sales call and provide detailed coaching feedback.

CALL CONTEXT:
- Personality: ${personalityName || 'Unknown'}
- Overall Score: ${scores.overallScore.toFixed(1)}/10
- Category Scores: ${scoresContext}
- Call Duration: ${Math.floor(scores.metadata.callDurationSeconds / 60)} minutes
- Questions Asked: ${scores.metadata.questionsAsked}
- Objections Handled: ${scores.metadata.objectionsDetected}

TRANSCRIPT:
${formattedTranscript}

DETAILED SCORING BREAKDOWN:
${scores.categoryScores
  .map(
    (cat) => `
${cat.category} (${cat.score}/10):
- Strengths: ${cat.feedback.strengths.join(', ') || 'None identified'}
- Improvements: ${cat.feedback.improvements.join(', ') || 'None identified'}
`
  )
  .join('\n')}

Provide comprehensive coaching feedback in the following JSON format:
{
  "strengths": [
    {
      "category": "opening|discovery|objectionHandling|closing|clarity",
      "strength": "Brief description of what they did well",
      "example": {
        "quote": "Exact quote from transcript",
        "context": "Why this was effective",
        "suggestion": "How to replicate this success"
      }
    }
  ],
  "improvementAreas": [
    {
      "category": "opening|discovery|objectionHandling|closing|clarity",
      "improvement": "Specific area to work on",
      "example": {
        "quote": "Exact quote from transcript (if applicable)",
        "context": "Why this needs improvement",
        "suggestion": "Specific technique or phrase to use instead"
      }
    }
  ],
  "specificExamples": [
    {
      "quote": "Exact quote from transcript",
      "analysis": "Detailed analysis of this moment",
      "rating": "excellent|good|needs-work"
    }
  ],
  "recommendedPractice": {
    "focusArea": "Primary skill to practice next",
    "reason": "Why this should be the focus",
    "suggestedScenarios": ["List of 2-3 specific scenarios to practice"],
    "practiceExercises": ["List of 2-3 specific exercises"]
  },
  "suggestedPhrases": [
    {
      "situation": "When to use this phrase",
      "phrase": "The actual phrase to use",
      "whenToUse": "Specific context for using it"
    }
  ],
  "categoryFeedback": {
    "opening": "2-3 sentence feedback on opening (if relevant)",
    "discovery": "2-3 sentence feedback on discovery (if relevant)",
    "objectionHandling": "2-3 sentence feedback on objection handling (if relevant)",
    "closing": "2-3 sentence feedback on closing (if relevant)",
    "clarity": "2-3 sentence feedback on clarity (if relevant)"
  },
  "confidenceScore": 0.85
}

Rules:
- Include 2-4 strengths with specific examples
- Include 2-4 improvement areas with actionable suggestions
- Provide 3-5 specific transcript examples with ratings
- Suggest 4-6 alternative phrases the rep can use
- Only include category feedback for categories that are relevant to this call
- Confidence score should reflect how clear the coaching recommendations are (0.0-1.0)`;

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 4000,
    });

    const processingTime = Date.now() - startTime;
    const analysisResult = JSON.parse(response.choices[0].message.content || '{}');

    // Extract token usage
    const tokensUsed = response.usage?.total_tokens || 0;

    // Build final coaching analysis
    const coaching: CoachingAnalysis = {
      strengths: analysisResult.strengths || [],
      improvementAreas: analysisResult.improvementAreas || [],
      specificExamples: analysisResult.specificExamples || [],
      recommendedPractice: analysisResult.recommendedPractice || {
        focusArea: 'General improvement',
        reason: 'Continue practicing',
        suggestedScenarios: [],
        practiceExercises: [],
      },
      suggestedPhrases: analysisResult.suggestedPhrases || [],
      categoryFeedback: analysisResult.categoryFeedback || {},
      aiMetadata: {
        model: response.model,
        processingTimeMs: processingTime,
        confidenceScore: analysisResult.confidenceScore || 0.8,
        tokensUsed,
      },
    };

    return coaching;
  } catch (error) {
    console.error('[AI Coach] Error analyzing call:', error);
    throw error;
  }
}

/**
 * Save coaching analysis to database
 */
export async function saveCoachingAnalysis(
  pool: any,
  callLogId: string,
  coaching: CoachingAnalysis
): Promise<void> {
  try {
    await pool.query(
      `
      INSERT INTO call_coaching (
        call_log_id,
        strengths,
        improvement_areas,
        specific_examples,
        recommended_practice,
        suggested_phrases,
        opening_feedback,
        discovery_feedback,
        objection_handling_feedback,
        closing_feedback,
        clarity_feedback,
        ai_model,
        processing_time_ms,
        confidence_score,
        tokens_used
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      ON CONFLICT (call_log_id)
      DO UPDATE SET
        strengths = EXCLUDED.strengths,
        improvement_areas = EXCLUDED.improvement_areas,
        specific_examples = EXCLUDED.specific_examples,
        recommended_practice = EXCLUDED.recommended_practice,
        suggested_phrases = EXCLUDED.suggested_phrases,
        opening_feedback = EXCLUDED.opening_feedback,
        discovery_feedback = EXCLUDED.discovery_feedback,
        objection_handling_feedback = EXCLUDED.objection_handling_feedback,
        closing_feedback = EXCLUDED.closing_feedback,
        clarity_feedback = EXCLUDED.clarity_feedback,
        updated_at = NOW()
    `,
      [
        callLogId,
        JSON.stringify(coaching.strengths),
        JSON.stringify(coaching.improvementAreas),
        JSON.stringify(coaching.specificExamples),
        JSON.stringify(coaching.recommendedPractice),
        JSON.stringify(coaching.suggestedPhrases),
        coaching.categoryFeedback.opening || null,
        coaching.categoryFeedback.discovery || null,
        coaching.categoryFeedback.objectionHandling || null,
        coaching.categoryFeedback.closing || null,
        coaching.categoryFeedback.clarity || null,
        coaching.aiMetadata.model,
        coaching.aiMetadata.processingTimeMs,
        coaching.aiMetadata.confidenceScore,
        coaching.aiMetadata.tokensUsed,
      ]
    );

    console.log(`[AI Coach] Saved coaching analysis for call ${callLogId}`);
  } catch (error) {
    console.error('[AI Coach] Error saving coaching analysis:', error);
    throw error;
  }
}

/**
 * Retrieve coaching analysis from database
 */
export async function getCoachingAnalysis(
  pool: any,
  callLogId: string
): Promise<CoachingAnalysis | null> {
  try {
    const result = await pool.query(
      `
      SELECT
        strengths,
        improvement_areas,
        specific_examples,
        recommended_practice,
        suggested_phrases,
        opening_feedback,
        discovery_feedback,
        objection_handling_feedback,
        closing_feedback,
        clarity_feedback,
        ai_model,
        processing_time_ms,
        confidence_score,
        tokens_used,
        created_at
      FROM call_coaching
      WHERE call_log_id = $1
    `,
      [callLogId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];

    return {
      strengths: row.strengths,
      improvementAreas: row.improvement_areas,
      specificExamples: row.specific_examples,
      recommendedPractice: row.recommended_practice,
      suggestedPhrases: row.suggested_phrases,
      categoryFeedback: {
        opening: row.opening_feedback,
        discovery: row.discovery_feedback,
        objectionHandling: row.objection_handling_feedback,
        closing: row.closing_feedback,
        clarity: row.clarity_feedback,
      },
      aiMetadata: {
        model: row.ai_model,
        processingTimeMs: row.processing_time_ms,
        confidenceScore: parseFloat(row.confidence_score),
        tokensUsed: row.tokens_used,
      },
    };
  } catch (error) {
    console.error('[AI Coach] Error retrieving coaching analysis:', error);
    return null;
  }
}
