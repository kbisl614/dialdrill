/**
 * API Route: Get user's learning progress and improvement trends
 * GET /api/analytics/learning-progress
 */

import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's internal ID
    const userResult = await pool().query(`SELECT id FROM users WHERE clerk_id = $1`, [userId]);

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userInternalId = userResult.rows[0].id;

    // Get or create learning progress
    let progressResult = await pool().query(
      `SELECT
        opening_avg_score,
        discovery_avg_score,
        objection_handling_avg_score,
        clarity_avg_score,
        closing_avg_score,
        overall_avg_score,
        opening_trend,
        discovery_trend,
        objection_handling_trend,
        clarity_trend,
        closing_trend,
        overall_trend,
        previous_opening_avg,
        previous_discovery_avg,
        previous_objection_handling_avg,
        previous_clarity_avg,
        previous_closing_avg,
        total_calls_analyzed,
        last_analyzed_call_id,
        overall_improvement_rate,
        primary_focus_area,
        secondary_focus_area,
        updated_at
      FROM learning_progress
      WHERE user_id = $1`,
      [userInternalId]
    );

    // If no progress record exists, create one by calculating from existing calls
    if (progressResult.rows.length === 0) {
      await calculateAndSaveLearningProgress(userInternalId);

      // Try again after calculation
      progressResult = await pool().query(
        `SELECT * FROM learning_progress WHERE user_id = $1`,
        [userInternalId]
      );
    }

    const progress = progressResult.rows[0] || null;

    // Get recent call scores for trend visualization
    const recentCallsResult = await pool().query(
      `SELECT
        cl.id,
        cl.created_at,
        cs.overall_score,
        cs.category_scores
      FROM call_logs cl
      JOIN call_scores cs ON cl.id = cs.call_log_id
      WHERE cl.user_id = $1
      ORDER BY cl.created_at DESC
      LIMIT 20`,
      [userInternalId]
    );

    const recentCalls = recentCallsResult.rows.map((row) => ({
      id: row.id,
      createdAt: row.created_at,
      overallScore: parseFloat(row.overall_score),
      categoryScores: row.category_scores,
    }));

    return NextResponse.json({
      success: true,
      progress: progress
        ? {
            categoryAverages: {
              opening: parseFloat(progress.opening_avg_score),
              discovery: parseFloat(progress.discovery_avg_score),
              objectionHandling: parseFloat(progress.objection_handling_avg_score),
              clarity: parseFloat(progress.clarity_avg_score),
              closing: parseFloat(progress.closing_avg_score),
              overall: parseFloat(progress.overall_avg_score),
            },
            trends: {
              opening: progress.opening_trend,
              discovery: progress.discovery_trend,
              objectionHandling: progress.objection_handling_trend,
              clarity: progress.clarity_trend,
              closing: progress.closing_trend,
              overall: progress.overall_trend,
            },
            previousAverages: {
              opening: progress.previous_opening_avg ? parseFloat(progress.previous_opening_avg) : null,
              discovery: progress.previous_discovery_avg ? parseFloat(progress.previous_discovery_avg) : null,
              objectionHandling: progress.previous_objection_handling_avg
                ? parseFloat(progress.previous_objection_handling_avg)
                : null,
              clarity: progress.previous_clarity_avg ? parseFloat(progress.previous_clarity_avg) : null,
              closing: progress.previous_closing_avg ? parseFloat(progress.previous_closing_avg) : null,
            },
            stats: {
              totalCallsAnalyzed: progress.total_calls_analyzed,
              overallImprovementRate: progress.overall_improvement_rate
                ? parseFloat(progress.overall_improvement_rate)
                : 0,
              primaryFocusArea: progress.primary_focus_area,
              secondaryFocusArea: progress.secondary_focus_area,
            },
            updatedAt: progress.updated_at,
          }
        : null,
      recentCalls,
    });
  } catch (error) {
    console.error('[API /analytics/learning-progress] ERROR:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * Calculate and save learning progress for a user
 */
async function calculateAndSaveLearningProgress(userInternalId: string) {
  try {
    // Get last 20 calls with scores
    const callsResult = await pool().query(
      `SELECT
        cs.overall_score,
        cs.category_scores,
        cl.created_at
      FROM call_logs cl
      JOIN call_scores cs ON cl.id = cs.call_log_id
      WHERE cl.user_id = $1
      ORDER BY cl.created_at DESC
      LIMIT 20`,
      [userInternalId]
    );

    if (callsResult.rows.length === 0) {
      // No calls yet, create empty record
      await pool().query(
        `INSERT INTO learning_progress (user_id, total_calls_analyzed)
         VALUES ($1, 0)
         ON CONFLICT (user_id) DO NOTHING`,
        [userInternalId]
      );
      return;
    }

    const calls = callsResult.rows;
    const recentCalls = calls.slice(0, Math.min(10, calls.length));
    const previousCalls = calls.slice(10, 20);

    // Calculate averages for recent calls
    const recentAverages = calculateCategoryAverages(recentCalls);
    const previousAverages = previousCalls.length > 0 ? calculateCategoryAverages(previousCalls) : null;

    // Calculate trends
    const trends = calculateTrends(recentAverages, previousAverages);

    // Determine focus areas (lowest scoring categories)
    const focusAreas = determineFocusAreas(recentAverages);

    // Calculate overall improvement rate
    const improvementRate = previousAverages
      ? ((recentAverages.overall - previousAverages.overall) / previousAverages.overall) * 100
      : 0;

    // Save to database
    await pool().query(
      `INSERT INTO learning_progress (
        user_id,
        opening_avg_score,
        discovery_avg_score,
        objection_handling_avg_score,
        clarity_avg_score,
        closing_avg_score,
        overall_avg_score,
        opening_trend,
        discovery_trend,
        objection_handling_trend,
        clarity_trend,
        closing_trend,
        overall_trend,
        previous_opening_avg,
        previous_discovery_avg,
        previous_objection_handling_avg,
        previous_clarity_avg,
        previous_closing_avg,
        total_calls_analyzed,
        overall_improvement_rate,
        primary_focus_area,
        secondary_focus_area
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
      ON CONFLICT (user_id)
      DO UPDATE SET
        opening_avg_score = EXCLUDED.opening_avg_score,
        discovery_avg_score = EXCLUDED.discovery_avg_score,
        objection_handling_avg_score = EXCLUDED.objection_handling_avg_score,
        clarity_avg_score = EXCLUDED.clarity_avg_score,
        closing_avg_score = EXCLUDED.closing_avg_score,
        overall_avg_score = EXCLUDED.overall_avg_score,
        opening_trend = EXCLUDED.opening_trend,
        discovery_trend = EXCLUDED.discovery_trend,
        objection_handling_trend = EXCLUDED.objection_handling_trend,
        clarity_trend = EXCLUDED.clarity_trend,
        closing_trend = EXCLUDED.closing_trend,
        overall_trend = EXCLUDED.overall_trend,
        previous_opening_avg = EXCLUDED.previous_opening_avg,
        previous_discovery_avg = EXCLUDED.previous_discovery_avg,
        previous_objection_handling_avg = EXCLUDED.previous_objection_handling_avg,
        previous_clarity_avg = EXCLUDED.previous_clarity_avg,
        previous_closing_avg = EXCLUDED.previous_closing_avg,
        total_calls_analyzed = EXCLUDED.total_calls_analyzed,
        overall_improvement_rate = EXCLUDED.overall_improvement_rate,
        primary_focus_area = EXCLUDED.primary_focus_area,
        secondary_focus_area = EXCLUDED.secondary_focus_area,
        updated_at = NOW()`,
      [
        userInternalId,
        recentAverages.opening,
        recentAverages.discovery,
        recentAverages.objectionHandling,
        recentAverages.clarity,
        recentAverages.closing,
        recentAverages.overall,
        trends.opening,
        trends.discovery,
        trends.objectionHandling,
        trends.clarity,
        trends.closing,
        trends.overall,
        previousAverages?.opening || null,
        previousAverages?.discovery || null,
        previousAverages?.objectionHandling || null,
        previousAverages?.clarity || null,
        previousAverages?.closing || null,
        calls.length,
        improvementRate,
        focusAreas[0],
        focusAreas[1],
      ]
    );

    console.log(`[Learning Progress] Updated progress for user ${userInternalId}`);
  } catch (error) {
    console.error('[Learning Progress] Error calculating progress:', error);
  }
}

function calculateCategoryAverages(calls: any[]) {
  const categories = ['opening', 'discovery', 'objectionHandling', 'clarity', 'closing'];
  const averages: any = { overall: 0 };

  // Calculate overall average
  const overallSum = calls.reduce((sum, call) => sum + parseFloat(call.overall_score), 0);
  averages.overall = overallSum / calls.length;

  // Calculate category averages
  for (const category of categories) {
    let sum = 0;
    let count = 0;

    for (const call of calls) {
      const categoryScores = call.category_scores;
      const categoryScore = categoryScores.find((c: any) => c.category === category);

      if (categoryScore) {
        sum += categoryScore.score;
        count++;
      }
    }

    averages[category] = count > 0 ? sum / count : 0;
  }

  return averages;
}

function calculateTrends(recent: any, previous: any | null) {
  if (!previous) {
    return {
      opening: 'stable',
      discovery: 'stable',
      objectionHandling: 'stable',
      clarity: 'stable',
      closing: 'stable',
      overall: 'stable',
    };
  }

  const calculateTrend = (recentScore: number, previousScore: number) => {
    const diff = recentScore - previousScore;
    if (diff > 0.5) return 'improving';
    if (diff < -0.5) return 'declining';
    return 'stable';
  };

  return {
    opening: calculateTrend(recent.opening, previous.opening),
    discovery: calculateTrend(recent.discovery, previous.discovery),
    objectionHandling: calculateTrend(recent.objectionHandling, previous.objectionHandling),
    clarity: calculateTrend(recent.clarity, previous.clarity),
    closing: calculateTrend(recent.closing, previous.closing),
    overall: calculateTrend(recent.overall, previous.overall),
  };
}

function determineFocusAreas(averages: any): [string, string] {
  const categories = [
    { name: 'opening', score: averages.opening },
    { name: 'discovery', score: averages.discovery },
    { name: 'objectionHandling', score: averages.objectionHandling },
    { name: 'clarity', score: averages.clarity },
    { name: 'closing', score: averages.closing },
  ];

  categories.sort((a, b) => a.score - b.score);

  return [categories[0].name, categories[1].name];
}
