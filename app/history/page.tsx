import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { pool } from '@/lib/db';
import { logger } from '@/lib/logger';
import DashboardLayout from '@/components/DashboardLayout';
import Breadcrumb from '@/components/Breadcrumb';
import CallHistoryWithComparison from '@/components/CallHistoryWithComparison';

interface TranscriptEntry {
  role: 'user' | 'agent';
  text: string;
  timestamp?: string | null;
}

interface CategoryScore {
  category: string;
  score: number;
  maxScore: number;
  signals: string[];
  feedback: {
    strengths: string[];
    improvements: string[];
  };
}

interface CallScore {
  overallScore: number;
  categoryScores: CategoryScore[];
}

interface TriggeredObjection {
  id: string;
  name: string;
  industry: string;
  category: string;
  description: string;
  triggeredAt: string;
  responseSnippet: string;
}

interface CallHistoryItem {
  id: string;
  createdAt: string;
  durationSeconds: number | null;
  tokensUsed: number | null;
  overageCharge: string | null;
  personalityName: string | null;
  personalityDescription: string | null;
  personalityIsBoss: boolean | null;
  transcript: TranscriptEntry[];
  score: CallScore | null;
  objections: TriggeredObjection[];
}

async function getCallHistory(userId: string): Promise<CallHistoryItem[]> {
  try {
    const result = await pool().query(
      `SELECT
          cl.id,
          cl.created_at,
          cl.duration_seconds,
          cl.tokens_used,
          cl.overage_charge,
          cl.transcript,
          p.name AS personality_name,
          p.description AS personality_description,
          p.is_boss AS personality_is_boss,
          cs.overall_score,
          cs.category_scores
       FROM call_logs cl
       INNER JOIN users u ON cl.user_id = u.id
       LEFT JOIN personalities p ON cl.personality_id = p.id
       LEFT JOIN call_scores cs ON cl.id = cs.call_log_id
       WHERE u.clerk_id = $1
       ORDER BY cl.created_at DESC
       LIMIT 50`,
      [userId]
    );

    // For each call, fetch triggered objections
    const callsWithObjections = await Promise.all(
      result.rows.map(async (row) => {
        const objectionsResult = await pool().query(
          `SELECT
            ol.id,
            ol.name,
            ol.industry,
            ol.category,
            ol.description,
            co.triggered_at,
            co.response_snippet
           FROM call_objections co
           INNER JOIN objection_library ol ON co.objection_id = ol.id
           WHERE co.call_log_id = $1
           ORDER BY co.created_at`,
          [row.id]
        );

        const objections: TriggeredObjection[] = objectionsResult.rows.map((obj) => ({
          id: obj.id,
          name: obj.name,
          industry: obj.industry,
          category: obj.category,
          description: obj.description,
          triggeredAt: obj.triggered_at,
          responseSnippet: obj.response_snippet
        }));

        return { ...row, objections };
      })
    );

    return callsWithObjections.map((row) => {
      let transcript: TranscriptEntry[] = [];
      if (Array.isArray(row.transcript)) {
        transcript = row.transcript as TranscriptEntry[];
      } else if (row.transcript) {
        try {
          transcript = JSON.parse(row.transcript);
        } catch {
          transcript = [];
        }
      }

      let score: CallScore | null = null;
      if (row.overall_score !== null && row.category_scores) {
        score = {
          overallScore: parseFloat(row.overall_score),
          categoryScores: row.category_scores
        };
      }

      return {
        id: row.id,
        createdAt: row.created_at,
        durationSeconds: row.duration_seconds,
        tokensUsed: row.tokens_used,
        overageCharge: row.overage_charge,
        personalityName: row.personality_name,
        personalityDescription: row.personality_description,
        personalityIsBoss: row.personality_is_boss,
        transcript,
        score,
        objections: row.objections
      };
    });
  } catch (error) {
    // Log error but don't crash - return empty array gracefully
    logger.error('[History] Failed to load call history', error, { 
      userId,
      route: '/history'
    });
    // Return empty array so page still renders (just shows "No calls" message)
    return [];
  }
}

export default async function HistoryPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/');
  }

  const calls = await getCallHistory(userId);

  return (
    <DashboardLayout>
      <section className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-12 py-12 sm:py-16">
        <Breadcrumb items={[{ label: 'Call History' }]} />

        <div className="mb-12 text-center">
          <h1 className="text-4xl font-extrabold text-white sm:text-5xl">Call History</h1>
          <p className="mt-4 text-lg text-[var(--color-text-secondary)]">
            Review transcripts, durations, and minutes used from your recent practice calls.
          </p>
        </div>

        <CallHistoryWithComparison calls={calls} />
      </section>
    </DashboardLayout>
  );
}
