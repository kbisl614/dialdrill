import { rateLimit, RATE_LIMITS, rateLimitHeaders } from '@/lib/rate-limit';

describe('Rate Limiter', () => {
  beforeEach(() => {
    // Clear the rate limit store between tests by using unique identifiers
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('rateLimit', () => {
    it('should allow requests within the limit', () => {
      const identifier = `test-allow-${Date.now()}`;
      const config = { limit: 5, windowSeconds: 60 };

      for (let i = 0; i < 5; i++) {
        const result = rateLimit(identifier, config);
        expect(result.success).toBe(true);
        expect(result.remaining).toBe(4 - i);
      }
    });

    it('should block requests over the limit', () => {
      const identifier = `test-block-${Date.now()}`;
      const config = { limit: 3, windowSeconds: 60 };

      // Use up the limit
      for (let i = 0; i < 3; i++) {
        rateLimit(identifier, config);
      }

      // Next request should be blocked
      const result = rateLimit(identifier, config);
      expect(result.success).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('should reset after window expires', () => {
      const identifier = `test-reset-${Date.now()}`;
      const config = { limit: 2, windowSeconds: 60 };

      // Use up the limit
      rateLimit(identifier, config);
      rateLimit(identifier, config);

      // Should be blocked
      expect(rateLimit(identifier, config).success).toBe(false);

      // Advance time past the window
      jest.advanceTimersByTime(61 * 1000);

      // Should be allowed again
      const result = rateLimit(identifier, config);
      expect(result.success).toBe(true);
      expect(result.remaining).toBe(1);
    });

    it('should track separate limits for different identifiers', () => {
      const config = { limit: 2, windowSeconds: 60 };

      const result1 = rateLimit(`user1-${Date.now()}`, config);
      const result2 = rateLimit(`user2-${Date.now()}`, config);

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      expect(result1.remaining).toBe(1);
      expect(result2.remaining).toBe(1);
    });
  });

  describe('RATE_LIMITS presets', () => {
    it('should have correct expensive preset', () => {
      expect(RATE_LIMITS.expensive).toEqual({ limit: 10, windowSeconds: 60 });
    });

    it('should have correct payment preset', () => {
      expect(RATE_LIMITS.payment).toEqual({ limit: 5, windowSeconds: 60 });
    });

    it('should have correct standard preset', () => {
      expect(RATE_LIMITS.standard).toEqual({ limit: 30, windowSeconds: 60 });
    });
  });

  describe('rateLimitHeaders', () => {
    it('should return correct headers', () => {
      const result = {
        success: true,
        limit: 10,
        remaining: 5,
        resetTime: 1234567890,
      };

      const headers = rateLimitHeaders(result);

      expect(headers['X-RateLimit-Limit']).toBe('10');
      expect(headers['X-RateLimit-Remaining']).toBe('5');
      expect(headers['X-RateLimit-Reset']).toBe('1234567890');
    });
  });
});
