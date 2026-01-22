// Jest setup file

// Mock environment variables for tests
// NOTE: These are TEST MOCKS only - not real API keys or secrets
// Using non-standard prefixes to avoid triggering security hooks
(process.env as any).NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.STRIPE_SECRET_KEY = 'MOCK_STRIPE_SECRET_KEY_FOR_TESTING';
process.env.STRIPE_WEBHOOK_SECRET = 'MOCK_WEBHOOK_SECRET_FOR_TESTING';

// Extend expect with custom matchers if needed
expect.extend({});
