# CSP Implementation Guide (Future Reference)

**Current Status**: CSP is disabled. This is intentional and secure for our use case.

## If You Need to Re-enable CSP Later

Only implement CSP if you have a specific security requirement (compliance, enterprise customers, etc.).

### Option 1: Nonce-based CSP (Recommended for Server-Rendered Pages)

```typescript
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    // Only in production
    if (process.env.NODE_ENV !== 'production') {
      return [];
    }

    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'strict-dynamic' 'nonce-{GENERATED_NONCE}' https:",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https:",
              "font-src 'self' data:",
              "connect-src 'self' https://*.elevenlabs.io wss://*.elevenlabs.io https://*.clerk.accounts.dev",
              "media-src 'self' blob:",
              "worker-src 'self' blob:",
              "object-src 'none'",
              "base-uri 'none'",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
```

**Important**: You'll need to:
1. Generate a unique nonce per request
2. Add the nonce to all script tags: `<script nonce={nonce}>`
3. Configure Clerk and ElevenLabs to accept nonces (may not be possible)

### Option 2: Hash-based CSP (For Static Sites)

Calculate hashes of all inline scripts and add them to CSP. Not recommended for your app since you have dynamic content.

### Why We Don't Use CSP Now

1. **Clerk SDK**: Dynamically injects scripts that would be blocked
2. **ElevenLabs SDK**: Uses dynamic script loading and WebSockets
3. **Development friction**: CSP errors slow down feature development
4. **Security is adequate**: Next.js + HTTPS + modern browsers = secure enough

### When to Reconsider CSP

- Enterprise customer requires it
- Compliance mandate (PCI-DSS, SOC2, etc.)
- Handling extremely sensitive data
- You've removed third-party SDKs in favor of server-side alternatives

## Resources

- [Google CSP Guide](https://web.dev/articles/csp)
- [CSP Evaluator](https://csp-evaluator.withgoogle.com/)
- [Next.js Security Headers](https://nextjs.org/docs/app/api-reference/next-config-js/headers)
