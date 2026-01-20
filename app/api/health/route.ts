/**
 * Health Check API Endpoint
 * 
 * Used by monitoring systems, load balancers, and self-healing mechanisms
 * GET /api/health - Basic health check
 * GET /api/health/detailed - Detailed health status with all checks
 */

import { NextResponse } from 'next/server';
import { getHealthMonitor } from '@/lib/health-monitor';
import { logger } from '@/lib/logger';

/**
 * Basic health check - fast response for load balancers
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const detailed = searchParams.get('detailed') === 'true';

  try {
    const healthMonitor = getHealthMonitor();

    if (detailed) {
      // Detailed health check with all service statuses
      const healthStatus = await healthMonitor.getHealthStatus();
      return NextResponse.json(healthStatus, {
        status: healthStatus.status === 'unhealthy' ? 503 : healthStatus.status === 'degraded' ? 200 : 200,
      });
    } else {
      // Quick health check - just database
      const dbCheck = await healthMonitor.checkDatabase();
      const isHealthy = dbCheck.status === 'up';

      return NextResponse.json(
        {
          status: isHealthy ? 'healthy' : 'unhealthy',
          timestamp: new Date().toISOString(),
          database: dbCheck.status,
        },
        { status: isHealthy ? 200 : 503 }
      );
    }
  } catch (error) {
    logger.error('[Health Check] Error', error, { route: '/api/health' });
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: process.env.NODE_ENV === 'production' 
          ? 'Health check failed' 
          : error instanceof Error ? error.message : String(error),
      },
      { status: 503 }
    );
  }
}

