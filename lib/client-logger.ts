/**
 * Client-side Logger - Safe for use in React components
 * 
 * Provides:
 * - Environment-aware logging (disabled in production)
 * - Structured logging with context
 * - Performance timing utilities
 */

interface LogContext {
  [key: string]: unknown;
}

function serializeError(error: Error | unknown) {
  if (error instanceof Response) {
    return {
      name: 'Response',
      message: `${error.status} ${error.statusText}`,
      status: error.status,
      statusText: error.statusText,
    };
  }
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
      cause: 'cause' in error ? error.cause : undefined,
    };
  }
  return { message: String(error) };
}

class ClientLogger {
  private isDevelopment = typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || 
     window.location.hostname === '127.0.0.1' ||
     process.env.NODE_ENV === 'development');

  /**
   * Debug logs - only in development
   */
  debug(message: string, context?: LogContext): void {
    if (!this.isDevelopment) return;
    console.log(`[DEBUG] ${message}`, context || '');
  }

  /**
   * Info logs - always logged
   */
  info(message: string, context?: LogContext): void {
    console.log(`[INFO] ${message}`, context || '');
  }

  /**
   * Warning logs - always logged
   */
  warn(message: string, context?: LogContext): void {
    console.warn(`[WARN] ${message}`, context || '');
  }

  /**
   * Error logs - always logged, includes stack trace in development
   *
   * @param message - Human-readable error description
   * @param error - The caught error (Error, Response, or unknown)
   * @param context - Additional debugging context (NEVER pass empty {})
   */
  error(message: string, error?: Error | unknown, context?: LogContext): void {
    const errorInfo = serializeError(error);

    // Build context payload - ensure we NEVER log empty {}
    const contextPayload: LogContext = {
      timestamp: new Date().toISOString(),
      error: errorInfo,
    };

    // Merge caller-provided context, filtering out undefined/null values
    if (context && typeof context === 'object') {
      for (const [key, value] of Object.entries(context)) {
        if (value !== undefined && value !== null) {
          contextPayload[key] = value;
        }
      }
    }

    // Always include at least error info - never log empty {}
    console.error(`[ERROR] ${message}`, contextPayload);

    // In development, also log the raw error for stack trace inspection
    if (this.isDevelopment && error instanceof Error) {
      console.error('[ERROR] Stack trace:', error);
    }
  }

  /**
   * Performance timing - only in development
   */
  perf(label: string, duration: number, context?: LogContext): void {
    if (!this.isDevelopment) return;
    const color = duration > 1000 ? '🔴' : duration > 500 ? '🟡' : '🟢';
    console.log(`[PERF] ${color} ${label}: ${duration}ms`, context || '');
  }

  /**
   * Start a performance timer
   */
  startTimer(label: string): () => void {
    if (!this.isDevelopment) return () => {};
    const start = Date.now();
    return () => {
      const duration = Date.now() - start;
      this.perf(label, duration);
    };
  }
}

// Singleton instance
export const clientLogger = new ClientLogger();

// Convenience exports
export default clientLogger;
