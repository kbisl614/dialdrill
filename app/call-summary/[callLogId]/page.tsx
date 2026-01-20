import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { pool } from '@/lib/db';
import CallSummaryClient from '@/components/CallSummaryClient';

interface CallSummaryData {
  callLog: {
    id: string;
    created_at: string;
    duration_seconds: number;
    personality_name: string;
    personality_description: string;
    transcript: Array<{ role: string; text: string; timestamp?: string }>;
  };
  score: {
    overall_score: number;
    category_scores: Array<{
      category: string;
      score: number;
      maxScore: number;
      signals: string[];
      feedback: {
        strengths: string[];
        improvements: string[];
      };
    }>;
  };
  gamification: {
    powerGained: number;
    badgesUnlocked: Array<{
      id: string;
      name: string;
      description: string;
      rarity: string;
    }>;
    beltUpgrade: {
      upgraded: boolean;
      previousBelt?: { tier: string; belt: string; color: string };
      newBelt?: { tier: string; belt: string; color: string };
    };
  };
}

async function getCallSummary(callLogId: string, userId: string): Promise<CallSummaryData | null> {
  try {
    // Get call log and score
    const result = await pool().query(
      `SELECT
        cl.id,
        cl.created_at,
        cl.duration_seconds,
        cl.transcript,
        p.name AS personality_name,
        p.description AS personality_description,
        cs.overall_score,
        cs.category_scores
       FROM call_logs cl
       INNER JOIN users u ON cl.user_id = u.id
       LEFT JOIN personalities p ON cl.personality_id = p.id
       LEFT JOIN call_scores cs ON cl.id = cs.call_log_id
       WHERE cl.id = $1 AND u.clerk_id = $2`,
      [callLogId, userId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];

    // Parse transcript
    let transcript: Array<{ role: string; text: string; timestamp?: string }> = [];
    if (Array.isArray(row.transcript)) {
      transcript = row.transcript;
    } else if (row.transcript) {
      try {
        transcript = JSON.parse(row.transcript);
      } catch {
        transcript = [];
      }
    }

    // TODO: Get actual gamification data from database
    // For now, return mock data structure
    const gamification = {
      powerGained: Math.floor(row.overall_score * 10), // Mock calculation
      badgesUnlocked: [], // TODO: Query from badge system
      beltUpgrade: {
        upgraded: false, // TODO: Check if user upgraded
      },
    };

    return {
      callLog: {
        id: row.id,
        created_at: row.created_at || new Date().toISOString(),
        duration_seconds: row.duration_seconds || 0,
        personality_name: row.personality_name || 'Unknown',
        personality_description: row.personality_description || '',
        transcript,
      },
      score: {
        overall_score: row.overall_score != null ? parseFloat(String(row.overall_score)) || 0 : 0,
        category_scores: Array.isArray(row.category_scores) ? row.category_scores : [],
      },
      gamification,
    };
  } catch (error) {
    console.error('Error fetching call summary:', error);
    return null;
  }
}

export default async function CallSummaryPage({ params }: { params: { callLogId: string } }) {
  const { userId } = await auth();

  if (!userId) {
    redirect('/');
  }

  const { callLogId } = await params;
  const summary = await getCallSummary(callLogId, userId);

  if (!summary) {
    redirect('/dashboard');
  }

  return <CallSummaryClient summary={summary} />;
}
