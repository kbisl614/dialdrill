import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Only enable in production
  enabled: process.env.NODE_ENV === 'production',

  // Performance monitoring
  tracesSampleRate: 0.1, // 10% of transactions for performance monitoring

  // Session replay for debugging user issues
  replaysSessionSampleRate: 0.1, // 10% of sessions
  replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors

  // Don't send PII
  sendDefaultPii: false,

  // Filter out noisy errors
  ignoreErrors: [
    // Browser extensions
    /extensions\//i,
    /^chrome-extension:\/\//i,
    // Network errors that aren't actionable
    'Network request failed',
    'Failed to fetch',
    'Load failed',
    // User navigation
    'AbortError',
  ],

  // Add context
  beforeSend(event) {
    // Remove sensitive data from breadcrumbs
    if (event.breadcrumbs) {
      event.breadcrumbs = event.breadcrumbs.map((breadcrumb) => {
        if (breadcrumb.category === 'fetch' && breadcrumb.data?.url) {
          // Redact API keys from URLs
          breadcrumb.data.url = breadcrumb.data.url.replace(
            /key=[^&]+/g,
            'key=[REDACTED]'
          );
        }
        return breadcrumb;
      });
    }
    return event;
  },
});
