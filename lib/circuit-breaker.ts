/**
 * Circuit Breaker Pattern - Prevents cascading failures
 * 
 * Automatically stops calling a service after repeated failures,
 * allowing it to recover before retrying
 */

export interface CircuitBreakerOptions {
  failureThreshold: number; // Number of failures before opening circuit
  resetTimeout: number; // Time in ms before attempting reset
  halfOpenMaxCalls: number; // Max calls to allow in half-open state
}

export type CircuitState = 'closed' | 'open' | 'half-open';

class CircuitBreaker {
  private state: CircuitState = 'closed';
  private failures: number = 0;
  private lastFailureTime: number = 0;
  private halfOpenCalls: number = 0;

  constructor(
    private serviceName: string,
    private options: CircuitBreakerOptions = {
      failureThreshold: 5,
      resetTimeout: 30000, // 30 seconds
      halfOpenMaxCalls: 3,
    }
  ) {}

  /**
   * Execute a function with circuit breaker protection
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    // Check if circuit should be reset
    if (this.state === 'open') {
      const timeSinceLastFailure = Date.now() - this.lastFailureTime;
      if (timeSinceLastFailure >= this.options.resetTimeout) {
        this.state = 'half-open';
        this.halfOpenCalls = 0;
        // State transition logged via logger utility in calling code
      } else {
        throw new Error(
          `Circuit breaker is OPEN for ${this.serviceName}. ` +
          `Will retry in ${Math.ceil((this.options.resetTimeout - timeSinceLastFailure) / 1000)}s`
        );
      }
    }

    // Check half-open call limit
    if (this.state === 'half-open' && this.halfOpenCalls >= this.options.halfOpenMaxCalls) {
      this.state = 'open';
      this.lastFailureTime = Date.now();
      throw new Error(`Circuit breaker is OPEN for ${this.serviceName} (half-open limit reached)`);
    }

    try {
      if (this.state === 'half-open') {
        this.halfOpenCalls++;
      }

      const result = await fn();

      // Success - reset failures if in half-open
      if (this.state === 'half-open') {
        this.state = 'closed';
        this.failures = 0;
        this.halfOpenCalls = 0;
      } else {
        this.failures = 0; // Reset failure count on success
      }

      return result;
    } catch (error) {
      this.failures++;
      this.lastFailureTime = Date.now();

      // Check if we should open the circuit
      if (this.failures >= this.options.failureThreshold) {
        this.state = 'open';
        // Log via logger utility in calling code
      }

      // If in half-open and we get a failure, immediately open
      if (this.state === 'half-open') {
        this.state = 'open';
      }

      throw error;
    }
  }

  /**
   * Get current state
   */
  getState(): CircuitState {
    return this.state;
  }

  /**
   * Manually reset circuit breaker
   */
  reset(): void {
    this.state = 'closed';
    this.failures = 0;
    this.halfOpenCalls = 0;
    this.lastFailureTime = 0;
  }

  /**
   * Get status info
   */
  getStatus() {
    return {
      serviceName: this.serviceName,
      state: this.state,
      failures: this.failures,
      lastFailureTime: this.lastFailureTime ? new Date(this.lastFailureTime).toISOString() : null,
      halfOpenCalls: this.halfOpenCalls,
    };
  }
}

// Circuit breaker instances for different services
const circuitBreakers = new Map<string, CircuitBreaker>();

export function getCircuitBreaker(serviceName: string, options?: Partial<CircuitBreakerOptions>): CircuitBreaker {
  if (!circuitBreakers.has(serviceName)) {
    const fullOptions: CircuitBreakerOptions = {
      failureThreshold: options?.failureThreshold ?? 5,
      resetTimeout: options?.resetTimeout ?? 30000,
      halfOpenMaxCalls: options?.halfOpenMaxCalls ?? 3,
    };
    circuitBreakers.set(serviceName, new CircuitBreaker(serviceName, fullOptions));
  }
  return circuitBreakers.get(serviceName)!;
}

