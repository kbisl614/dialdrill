# Contributing to DialDrill

## Before You Push

**Always run the build verification before pushing code:**

```bash
npm run verify-build
```

This ensures your code will build successfully on Vercel.

## Quick Start

1. **Clone and install:**
   ```bash
   git clone <repo-url>
   cd dialdrill
   npm install
   ```

2. **Set up environment:**
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your actual API keys
   ```

3. **Run development server:**
   ```bash
   npm run dev
   ```

4. **Before committing:**
   ```bash
   npm run verify-build
   ```

## Environment Variables

See `.env.local.example` for required variables. **Never commit `.env.local`** - it's gitignored for security.

### Required for Development:
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk auth
- `CLERK_SECRET_KEY` - Clerk server-side
- `DATABASE_URL` - PostgreSQL connection
- `WEBHOOK_SECRET` - Clerk webhooks
- `ELEVENLABS_API_KEY` - Voice AI
- `ELEVENLABS_AGENT_IDS` - Agent configurations

### Optional:
- `ELEVENLABS_MOCK=1` - Test without using API credits
- `SIMULATE_CALLS=true` - Simulate calls without external APIs

## Build Requirements

The project must build on Vercel with **no network access** during build time:

❌ **Don't do this:**
```typescript
// This will fail on Vercel - database access at module scope
import { pool } from '@/lib/db';
const users = await pool.query('SELECT * FROM users'); // ❌ Runs during build
```

✅ **Do this instead:**
```typescript
// Database access only in API routes/server functions
export async function GET() {
  const users = await pool().query('SELECT * FROM users'); // ✅ Runs at request time
  return Response.json(users);
}
```

## Common Mistakes

### 1. Database Access During Build
```typescript
// ❌ Bad: module-level database call
const data = await db.query('...');

// ✅ Good: database call in function/route
export async function getData() {
  const data = await pool().query('...');
  return data;
}
```

### 2. Client/Server Boundary Violations
```typescript
// ❌ Bad: Node.js APIs in client component
'use client';
import { readFileSync } from 'fs';

// ✅ Good: Node.js APIs only in server components/routes
// Remove 'use client' or move to API route
```

### 3. Environment Variables in Client
```typescript
// ❌ Bad: secret in client component
'use client';
const secret = process.env.CLERK_SECRET_KEY;

// ✅ Good: only NEXT_PUBLIC_* in client
'use client';
const key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
```

### 4. Static Page Generation with Auth
```typescript
// ❌ Bad: trying to pre-render auth-required page
export default function Page() { ... }

// ✅ Good: force dynamic rendering
export const dynamic = 'force-dynamic';
export default function Page() { ... }
```

## Testing Your Changes

### Local Build Test
```bash
npm run build
```

### Full Preflight Check
```bash
npm run verify-build
```

This runs:
- Environment variable validation
- TypeScript type checking
- Production build (same as Vercel)

### Development Server
```bash
npm run dev
```

## Deployment

Vercel automatically deploys when you push to `main`. To ensure success:

1. ✅ Run `npm run verify-build` locally
2. ✅ Commit and push
3. ✅ Check Vercel dashboard for deployment status

If deployment fails:
1. Check Vercel logs for exact error
2. Reproduce locally with `npm run build`
3. Fix and push again

## Project Structure

```
dialdrill/
├── app/                    # Next.js App Router
│   ├── api/               # API routes (server-only)
│   ├── call/              # Call pages
│   ├── dashboard/         # Dashboard
│   └── layout.tsx         # Root layout
├── lib/                   # Shared utilities
│   └── db.ts             # Database (lazy-loaded)
├── scripts/              # Build scripts
│   └── verify-build.sh   # Preflight check
├── .env.local.example    # Environment template
├── DEPLOYMENT.md         # Deployment guide
└── CONTRIBUTING.md       # This file
```

## Need Help?

- **Deployment issues**: See [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Build failures**: Run `npm run verify-build` for details
- **Environment setup**: Check `.env.local.example`

## Code Quality

- TypeScript strict mode is enabled
- Run `npm run lint` to check code style
- Fix all TypeScript errors before committing
- Keep functions small and focused
- Add comments for complex logic

## Database Changes

Database schema is in `lib/db.ts` (`initializeDatabase` function). Changes automatically apply on next API call.

To manually initialize:
```bash
node init-db.js
```

## Pull Request Checklist

- [ ] Code builds locally (`npm run verify-build`)
- [ ] No TypeScript errors
- [ ] No lint errors
- [ ] Environment variables documented in `.env.local.example`
- [ ] Tested locally with real services (or mock mode)
- [ ] No secrets in code
- [ ] No `.env.local` committed

## Questions?

Open an issue or check existing documentation:
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment and troubleshooting
- [.env.local.example](./.env.local.example) - Environment variables
