/**
 * Match detected objections from transcript analysis to objection library entries.
 *
 * Links scoring system's detected objections to predefined objection profiles.
 */

import { pool } from './db';
import type { TranscriptSignals } from './scoring-framework';

export interface ObjectionMatch {
  objectionId: string;
  triggeredAt: string; // Timestamp or snippet from agent text
  responseSnippet: string; // User's response (first 200 chars)
}

/**
 * Match detected objections to library entries and save to database.
 *
 * Strategy:
 * 1. Get all objections from library grouped by category
 * 2. For each detected objection, find best matching library entry
 * 3. Save matches to call_objections table
 */
export async function matchAndSaveObjections(
  callLogId: string,
  signals: TranscriptSignals
): Promise<void> {
  if (signals.objections.length === 0) {
    // No objections detected, nothing to save
    return;
  }

  try {
    // Fetch objection library
    const result = await pool().query(
      `SELECT id, name, category FROM objection_library`
    );

    const library: Array<{ id: string; name: string; category: string }> = result.rows;

    // Group by category for faster matching
    const byCategory: Record<string, Array<{ id: string; name: string }>> = {};
    for (const entry of library) {
      if (!byCategory[entry.category]) {
        byCategory[entry.category] = [];
      }
      byCategory[entry.category].push({ id: entry.id, name: entry.name });
    }

    // Match each detected objection to library entry
    const matches: ObjectionMatch[] = [];

    for (const objection of signals.objections) {
      const categoryEntries = byCategory[objection.type] || [];

      if (categoryEntries.length === 0) {
        // No library entries for this category, skip
        continue;
      }

      // Simple strategy: Pick first entry in category
      // In production, could use fuzzy matching or keyword similarity
      const matched = categoryEntries[0];

      matches.push({
        objectionId: matched.id,
        triggeredAt: objection.agentText.substring(0, 200), // First 200 chars
        responseSnippet: objection.userResponse.substring(0, 200)
      });
    }

    // Save matches to database
    for (const match of matches) {
      await pool().query(
        `INSERT INTO call_objections (call_log_id, objection_id, triggered_at, response_snippet)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (call_log_id, objection_id) DO NOTHING`,
        [callLogId, match.objectionId, match.triggeredAt, match.responseSnippet]
      );
    }

    console.log(`[ObjectionMatcher] Matched ${matches.length} objections for call ${callLogId}`);
  } catch (error) {
    console.error('[ObjectionMatcher] Error matching objections:', error);
    // Don't throw - this is non-critical
  }
}
