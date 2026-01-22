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

