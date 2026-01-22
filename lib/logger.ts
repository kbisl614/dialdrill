/**
 * Centralized Logger - Replaces console.log/error throughout codebase
 * 
 * Provides:
 * - Environment-aware logging (disabled in production)
 * - Structured logging with context
 * - Performance timing utilities
 * - Error tracking integration
 */

// LogLevel type removed - not used in current implementation

interface LogContext {
  service?: string;
  userId?: string;
  requestId?: string;
  [key: string]: unknown;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV !== 'production';
  private isDebug = process.env.DEBUG === 'true' || this.isDevelopment;

  /**
   * Debug logs - only in development or when DEBUG=true
   */
  debug(message: string, context?: LogContext): void {
    if (!this.isDebug) return;
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
   */
  error(message: string, error?: Error | unknown, context?: LogContext): void {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;

    if (this.isDevelopment && stack) {
      console.error(`[ERROR] ${message}`, {
        ...context,
        error: errorMessage,
        stack,
      });
    } else {
      console.error(`[ERROR] ${message}`, {
        ...context,
        error: errorMessage,
      });
    }
  }

  /**
   * Performance timing - only in development or when DEBUG=true
   */
  perf(label: string, duration: number, context?: LogContext): void {
    if (!this.isDebug) return;
    const color = duration > 1000 ? '🔴' : duration > 500 ? '🟡' : '🟢';
    console.log(`[PERF] ${color} ${label}: ${duration}ms`, context || '');
  }

  /**
   * Start a performance timer
   */
  startTimer(label: string): () => void {
    if (!this.isDebug) return () => {};
    const start = Date.now();
    return () => {
      const duration = Date.now() - start;
      this.perf(label, duration);
    };
  }

  /**
   * API route logging helper (debug only)
   */
  api(route: string, message: string, context?: LogContext): void {
    if (!this.isDebug) return;
    this.debug(`[API ${route}] ${message}`, context);
  }

  /**
   * API info logging (always logged, with route context)
   */
  apiInfo(route: string, message: string, context?: LogContext): void {
    this.info(`[API ${route}] ${message}`, context);
  }

  /**
   * API error logging with proper context
   */
  apiError(route: string, error: Error | unknown, context?: LogContext): void {
    const errorMessage = error instanceof Error ? error.message : String(error);
    this.error(`[API ${route}] ${errorMessage}`, error, context);
  }
}

// Singleton instance
export const logger = new Logger();

// Convenience exports
export const log = logger;
export default logger;


