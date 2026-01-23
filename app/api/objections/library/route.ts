import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { logger } from '@/lib/logger';
import { rateLimit, RATE_LIMITS, rateLimitHeaders } from '@/lib/rate-limit';

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
 * Rate limited to prevent abuse.
 */
export async function GET(request: Request) {
  const requestId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  logger.apiInfo('/objections/library', 'Request received', { requestId });
  
  try {
    // Rate limit by IP (public endpoint)
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
    const rateLimitResult = rateLimit(`objections-library:${ip}`, RATE_LIMITS.read);
    
    if (!rateLimitResult.success) {
      logger.apiInfo('/objections/library', 'Rate limited', { ip, requestId });
      return NextResponse.json(
        { error: 'Too many requests. Please wait before requesting the objection library again.' },
        { status: 429, headers: rateLimitHeaders(rateLimitResult) }
      );
    }
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

    logger.apiInfo('/objections/library', 'Library retrieved successfully', { total: objections.length, requestId });
    return NextResponse.json({
      total: objections.length,
      byIndustry
    });
  } catch (error) {
    logger.apiError('/objections/library', error, { route: '/objections/library', requestId });
    return NextResponse.json(
      {
        error: 'Failed to fetch objection library',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
