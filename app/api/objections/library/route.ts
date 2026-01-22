import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { logger } from '@/lib/logger';

export interface ObjectionProfile {
  id: string;
  name: string;
  industry: string;
  category: string;
  description: string;
  handlingStrategies: string[];
}

export interface ObjectionLibraryResponse {
  total: number;
  byIndustry: Record<string, ObjectionProfile[]>;
}

/**
 * GET /api/objections/library
 *
 * Returns full objection library grouped by industry.
 * Public endpoint - no auth required (informational only).
 */
export async function GET() {
  try {
    const result = await pool().query(
      `SELECT id, name, industry, category, description, handling_strategies
       FROM objection_library
       ORDER BY industry, name`
    );

    const objections: ObjectionProfile[] = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      industry: row.industry,
      category: row.category,
      description: row.description,
      handlingStrategies: row.handling_strategies || []
    }));

    // Group by industry
    const byIndustry: Record<string, ObjectionProfile[]> = {};
    for (const objection of objections) {
      if (!byIndustry[objection.industry]) {
        byIndustry[objection.industry] = [];
      }
      byIndustry[objection.industry].push(objection);
    }

    return NextResponse.json({
      total: objections.length,
      byIndustry
    });
  } catch (error) {
    logger.apiError('/objections/library', error, { route: '/objections/library' });
    return NextResponse.json(
      {
        error: 'Failed to fetch objection library',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
