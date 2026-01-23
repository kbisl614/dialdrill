import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { pool } from '@/lib/db';
import CallSummaryClient from '@/components/CallSummaryClient';
import { logger } from '@/lib/logger';

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

    // Calculate power gained - only if call was 90+ seconds
    const durationSeconds = row.duration_seconds || 0;
    const powerGained = durationSeconds >= 90 ? Math.floor(row.overall_score * 10) : 0;
    
    // Get user's internal ID for queries
    const userResult = await pool().query(
      `SELECT id, current_tier, current_belt, power_level FROM users WHERE clerk_id = $1`,
      [userId]
    );
    const internalUserId = userResult.rows[0]?.id;
    
    // Query badges earned around the time of this call (within 5 minutes after call)
    const callTime = new Date(row.created_at);
    const fiveMinutesLater = new Date(callTime.getTime() + 5 * 60 * 1000);
    
    const badgesResult = await pool().query(
      `SELECT ub.badge_id, ub.earned_at
       FROM user_badges ub
       WHERE ub.user_id = $1 
         AND ub.earned_at >= $2 
         AND ub.earned_at <= $3
       ORDER BY ub.earned_at ASC`,
      [internalUserId, callTime, fiveMinutesLater]
    );
    
    // Badge definitions (matching save-transcript)
    const ALL_BADGES = [
      { id: 'badge_5_calls', name: 'First Steps', description: 'Complete 5 calls', rarity: 'common' },
      { id: 'badge_10_calls', name: 'Building Momentum', description: 'Complete 10 calls', rarity: 'common' },
      { id: 'badge_25_calls', name: 'Quarter Century', description: 'Complete 25 calls', rarity: 'uncommon' },
      { id: 'badge_50_calls', name: 'Halfway Master', description: 'Complete 50 calls', rarity: 'rare' },
      { id: 'badge_7_day_streak', name: 'Week Warrior', description: '7 day streak', rarity: 'uncommon' },
      { id: 'badge_14_day_streak', name: 'Fortnight Fighter', description: '14 day streak', rarity: 'rare' },
      { id: 'badge_30_day_streak', name: 'Month Master', description: '30 day streak', rarity: 'epic' },
    ];
    
    const badgesUnlocked = badgesResult.rows.map(row => {
      const badgeDef = ALL_BADGES.find(b => b.id === row.badge_id);
      return {
        id: row.badge_id,
        name: badgeDef?.name || 'Unknown Badge',
        description: badgeDef?.description || '',
        rarity: badgeDef?.rarity || 'common',
      };
    });
    
    // Check if belt was upgraded around this call time
    // Query notifications for belt_upgrade type around call time
    const beltUpgradeResult = await pool().query(
      `SELECT metadata
       FROM user_notifications
       WHERE user_id = $1 
         AND type = 'belt_upgrade'
         AND created_at >= $2 
         AND created_at <= $3
       ORDER BY created_at DESC
       LIMIT 1`,
      [internalUserId, callTime, fiveMinutesLater]
    );
    
    // Belt progression colors (matching save-transcript)
    const BELT_COLORS: Record<string, string> = {
      'Bronze': '#cd7f32',
      'Silver': '#c0c0c0',
      'Gold': '#ffd700',
      'Platinum': '#e5e4e2',
      'Diamond': '#b9f2ff',
      'Sales Master': '#ff6b6b',
      'Sales Predator': '#8b00ff',
    };
    
    let beltUpgrade: {
      upgraded: boolean;
      newBelt?: { tier: string; belt: string; color: string };
      previousBelt?: { tier: string; belt: string; color: string };
    } = { upgraded: false };
    
    if (beltUpgradeResult.rows.length > 0 && internalUserId) {
      const metadata = beltUpgradeResult.rows[0].metadata;
      const currentUser = userResult.rows[0];
      
      beltUpgrade = {
        upgraded: true,
        newBelt: {
          tier: currentUser.current_tier || 'Bronze',
          belt: currentUser.current_belt || 'White',
          color: BELT_COLORS[currentUser.current_tier] || '#cd7f32',
        },
        previousBelt: metadata?.oldBelt ? {
          tier: metadata.oldBelt.split(' ')[0],
          belt: metadata.oldBelt.split(' ')[1],
          color: BELT_COLORS[metadata.oldBelt.split(' ')[0]] || '#cd7f32',
        } : undefined,
      };
    }
    
    const gamification = {
      powerGained,
      badgesUnlocked,
      beltUpgrade,
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
    logger.apiError('/call-summary/[callLogId]', error, { callLogId, userId });
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
