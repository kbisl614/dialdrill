/**
 * Health Monitor - Self-Healing System Core
 * 
 * Monitors system health, detects issues, and enables automatic recovery
 */

import { pool } from './db';

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  checks: {
    database: ServiceCheck;
    openai?: ServiceCheck;
    elevenlabs?: ServiceCheck;
    stripe?: ServiceCheck;
    memory?: ServiceCheck;
  };
  uptime: number;
  errors: Array<{
    timestamp: string;
    service: string;
    error: string;
  }>;
}

export interface ServiceCheck {
  status: 'up' | 'down' | 'degraded';
  responseTime?: number;
  lastChecked: string;
  error?: string;
}

class HealthMonitor {
  private startTime: number;
  private errors: Array<{ timestamp: string; service: string; error: string }> = [];
  private maxErrors = 100; // Keep last 100 errors

  constructor() {
    this.startTime = Date.now();
  }

  /**
   * Record an error for monitoring
   */
  recordError(service: string, error: Error | string): void {
    const errorMessage = error instanceof Error ? error.message : error;
    this.errors.push({
      timestamp: new Date().toISOString(),
      service,
      error: errorMessage,
    });

    // Keep only last N errors
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors);
    }

    // Error is logged via logger utility in calling code
  }

  /**
   * Check database health
   */
  async checkDatabase(): Promise<ServiceCheck> {
    const startTime = Date.now();
    try {
      const result = await pool().query('SELECT NOW() as time, version() as version');
      const responseTime = Date.now() - startTime;

      if (result.rows.length === 0) {
        throw new Error('Database query returned no rows');
      }

      return {
        status: responseTime > 1000 ? 'degraded' : 'up',
        responseTime,
        lastChecked: new Date().toISOString(),
      };
    } catch (error) {
      this.recordError('database', error instanceof Error ? error : String(error));
      return {
        status: 'down',
        lastChecked: new Date().toISOString(),
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Check OpenAI API health (if configured)
   * Simplified check - just verify configuration exists
   */
  async checkOpenAI(): Promise<ServiceCheck> {
    const apiKey = process.env.OPENAI_API_KEY;
    const isConfigured = !!apiKey && apiKey.length > 10;
    
    return {
      status: isConfigured ? 'up' : 'down',
      lastChecked: new Date().toISOString(),
      error: isConfigured ? undefined : 'OpenAI API key not configured',
    };
  }

  /**
   * Check ElevenLabs API health
   * Simplified check - just verify configuration exists
   */
  async checkElevenLabs(): Promise<ServiceCheck> {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    const isConfigured = !!apiKey && apiKey.length > 10;
    
    return {
      status: isConfigured ? 'up' : 'down',
      lastChecked: new Date().toISOString(),
      error: isConfigured ? undefined : 'ElevenLabs API key not configured',
    };
  }

  /**
   * Check Stripe API health
   * Simplified check - just verify configuration exists
   */
  async checkStripe(): Promise<ServiceCheck> {
    const apiKey = process.env.STRIPE_SECRET_KEY;
    const isConfigured = !!apiKey && apiKey.length > 10;
    
    return {
      status: isConfigured ? 'up' : 'down',
      lastChecked: new Date().toISOString(),
      error: isConfigured ? undefined : 'Stripe API key not configured',
    };
  }

  /**
   * Check memory usage
   */
  checkMemory(): ServiceCheck {
    try {
      const usage = process.memoryUsage();
      const memoryUsedMB = usage.heapUsed / 1024 / 1024;
      const memoryTotalMB = usage.heapTotal / 1024 / 1024;
      const memoryPercent = (memoryUsedMB / memoryTotalMB) * 100;

      // Warn if using more than 80% of allocated heap
      let status: 'up' | 'degraded' | 'down' = 'up';
      if (memoryPercent > 90) {
        status = 'down';
      } else if (memoryPercent > 80) {
        status = 'degraded';
      }

      return {
        status,
        lastChecked: new Date().toISOString(),
        responseTime: 0,
        error: memoryPercent > 80 ? `High memory usage: ${memoryPercent.toFixed(1)}%` : undefined,
      };
    } catch (error) {
      return {
        status: 'degraded',
        lastChecked: new Date().toISOString(),
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Get overall health status
   */
  async getHealthStatus(): Promise<HealthStatus> {
    const [database, openai, elevenlabs, stripe] = await Promise.all([
      this.checkDatabase(),
      this.checkOpenAI(),
      this.checkElevenLabs(),
      this.checkStripe(),
    ]);

    const memory = this.checkMemory();

    // Determine overall status
    const allChecks = [database, openai, elevenlabs, stripe, memory];
    const criticalDown = database.status === 'down';
    const anyDown = allChecks.some(check => check.status === 'down');
    const anyDegraded = allChecks.some(check => check.status === 'degraded');

    let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    if (criticalDown) {
      overallStatus = 'unhealthy';
    } else if (anyDown || anyDegraded) {
      overallStatus = 'degraded';
    }

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      checks: {
        database,
        openai,
        elevenlabs,
        stripe,
        memory,
      },
      uptime: Date.now() - this.startTime,
      errors: this.errors.slice(-10), // Return last 10 errors
    };
  }

  /**
   * Get recent errors
   */
  getRecentErrors(limit: number = 10): Array<{ timestamp: string; service: string; error: string }> {
    return this.errors.slice(-limit);
  }

  /**
   * Clear old errors (maintenance)
   */
  clearOldErrors(olderThanMs: number = 24 * 60 * 60 * 1000): void {
    const cutoff = Date.now() - olderThanMs;
    this.errors = this.errors.filter(
      err => new Date(err.timestamp).getTime() > cutoff
    );
  }
}

// Singleton instance
let healthMonitorInstance: HealthMonitor | null = null;

export function getHealthMonitor(): HealthMonitor {
  if (!healthMonitorInstance) {
    healthMonitorInstance = new HealthMonitor();
  }
  return healthMonitorInstance;
}

