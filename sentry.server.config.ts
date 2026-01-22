import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  // Only enable in production
  enabled: process.env.NODE_ENV === 'production',

  // Performance monitoring
  tracesSampleRate: 0.1, // 10% of transactions

  // Don't send PII
  sendDefaultPii: false,

  // Filter out noisy errors
  ignoreErrors: [
    // Expected errors
    'UNAUTHORIZED',
    'NOT_FOUND',
  ],

  beforeSend(event) {
    // Redact sensitive data
    if (event.request?.headers) {
      delete event.request.headers['authorization'];
      delete event.request.headers['cookie'];
    }
    return event;
  },
});
