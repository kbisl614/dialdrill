/**
 * Automatic Retry Mechanism with Exponential Backoff
 * 
 * Retries failed operations with increasing delays between attempts
 */

export interface RetryOptions {
  maxAttempts: number;
  initialDelay: number; // in milliseconds
  maxDelay: number; // in milliseconds
  backoffMultiplier: number;
  retryableErrors?: Array<{ message?: string; code?: string; status?: number }>;
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Check if error is retryable
 */
function isRetryableError(error: any, retryableErrors?: Array<{ message?: string; code?: string; status?: number }>): boolean {
  if (!retryableErrors || retryableErrors.length === 0) {
    // Default: retry on network errors and 5xx status codes
    if (error?.status >= 500 && error?.status < 600) return true;
    if (error?.code === 'ECONNRESET' || error?.code === 'ETIMEDOUT' || error?.code === 'ENOTFOUND') return true;
    if (error?.message?.includes('timeout')) return true;
    return false;
  }

  // Check against custom retryable errors
  return retryableErrors.some(retryable => {
    if (retryable.message && error?.message?.includes(retryable.message)) return true;
    if (retryable.code && error?.code === retryable.code) return true;
    if (retryable.status && error?.status === retryable.status) return true;
    return false;
  });
}

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {
    maxAttempts: 3,
    initialDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2,
  }
): Promise<T> {
  let lastError: any;
  let delay = options.initialDelay;

  for (let attempt = 1; attempt <= options.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Check if error is retryable
      if (!isRetryableError(error, options.retryableErrors)) {
        throw error;
      }

      // Don't retry on last attempt
      if (attempt >= options.maxAttempts) {
        break;
      }

      // Calculate delay with exponential backoff
      const currentDelay = Math.min(delay, options.maxDelay);
      // Logging handled by logger utility in calling code

      await sleep(currentDelay);
      delay *= options.backoffMultiplier;
    }
  }

  throw lastError;
}

/**
 * Retry with circuit breaker integration
 */
export async function retryWithCircuitBreaker<T>(
  serviceName: string,
  fn: () => Promise<T>,
  retryOptions?: RetryOptions,
  circuitBreakerOptions?: { failureThreshold?: number; resetTimeout?: number; halfOpenMaxCalls?: number }
): Promise<T> {
  const { getCircuitBreaker } = await import('./circuit-breaker');
  const circuitBreaker = getCircuitBreaker(serviceName, circuitBreakerOptions);

  return circuitBreaker.execute(() => retryWithBackoff(fn, retryOptions));
}

