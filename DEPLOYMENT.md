# Deployment Guide - DialDrill

## Root Cause Summary

The Vercel build failures were caused by two issues:

### 1. **Database Connection During Build Time**
- **Problem**: `lib/db.ts` was creating a PostgreSQL connection pool at module initialization time
- **Impact**: When Next.js ran `npm run build`, it attempted to connect to the database at `127.0.0.1:5432`, which doesn't exist during Vercel builds
- **Fix**: Converted the pool to a lazy-loaded singleton pattern (`getPool()` function) that only initializes when actually called at runtime

### 2. **Clerk Authentication During Static Page Generation**
- **Problem**: Next.js was pre-rendering the `/_not-found` page at build time, which triggered `ClerkProvider` initialization before environment variables were available
- **Impact**: Build failed with `Missing publishableKey` error
- **Fix**: Created `app/not-found.tsx` with `export const dynamic = 'force-dynamic'` to force runtime rendering instead of build-time static generation

## Files Changed

### 1. `lib/db.ts`
**Rationale**: Prevent database connection during build time
- Changed from immediate pool creation to lazy-loaded singleton
- Pool only initializes when `pool()` is called (at runtime in API routes)
- Removed module-level database initialization that ran during import

### 2. `app/layout.tsx`
**Rationale**: Remove database initialization from layout
- Removed `initializeDatabase()` call from module scope
- Database tables are created on-demand when first API call occurs
- Layout now only handles React component rendering

### 3. `app/not-found.tsx` (created)
**Rationale**: Prevent Clerk initialization during static page generation
- Added `export const dynamic = 'force-dynamic'` to force runtime rendering
- Prevents Next.js from trying to pre-render 404 page at build time
- Custom 404 page with proper styling

### 4. `app/api/calls/start/route.ts`
**Rationale**: Update to use lazy-loaded pool
- Changed `pool.query()` to `pool().query()` (function call)
- Now triggers pool initialization only when API is called

### 5. `app/api/user/calls/route.ts`
**Rationale**: Update to use lazy-loaded pool
- Changed `pool.query()` to `pool().query()` (function call)

### 6. `app/api/webhooks/clerk/route.ts`
**Rationale**: Update to use lazy-loaded pool
- Changed `pool.query()` to `pool().query()` (function call)

### 7. `scripts/verify-build.sh` (created)
**Rationale**: Preflight check for contributors
- Validates environment variables are set
- Runs TypeScript check
- Runs production build (same as Vercel)
- Ensures .env.local is gitignored

### 8. `DEPLOYMENT.md` (this file)
**Rationale**: Documentation for deployment and troubleshooting

## Required Environment Variables for Production

These must be set in **Vercel Dashboard → Settings → Environment Variables**:

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | ✅ Yes | Clerk publishable key (safe to expose) | `pk_test_...` |
| `CLERK_SECRET_KEY` | ✅ Yes | Clerk secret key (server-only) | `sk_test_...` |
| `DATABASE_URL` | ✅ Yes | PostgreSQL connection string | `postgresql://user:pass@host/db?sslmode=require` |
| `WEBHOOK_SECRET` | ✅ Yes | Clerk webhook secret | `whsec_...` |
| `ELEVENLABS_API_KEY` | ✅ Yes | ElevenLabs API key | `sk_...` |
| `ELEVENLABS_AGENT_IDS` | ✅ Yes | Comma-separated agent IDs | `agent_...,agent_...` |
| `ELEVENLABS_MOCK` | No | Set to `1` for mock mode (dev) | `0` or `1` |
| `SIMULATE_CALLS` | No | Simulate calls without API | `false` |

### Setting Environment Variables in Vercel

1. Go to https://vercel.com/
2. Select your `dialdrill` project
3. Go to **Settings** → **Environment Variables**
4. Add each variable above
5. Select environments: **Production**, **Preview**, and **Development**
6. Click **Save**
7. Redeploy to apply changes

## Local Build Verification

### Quick Check
```bash
npm run build
```

### Full Preflight Check
```bash
./scripts/verify-build.sh
```

This script will:
- ✅ Verify Node.js version
- ✅ Check `.env.local` exists
- ✅ Validate all required environment variables are set
- ✅ Confirm `.env.local` is gitignored
- ✅ Run TypeScript type checking
- ✅ Run production build (same as Vercel)

### If Build Fails Locally

1. **Missing .env.local**: Copy `.env.local.example` to `.env.local` and fill in real values
2. **Missing env vars**: Check the error message and add missing variables to `.env.local`
3. **TypeScript errors**: Fix type errors before building
4. **Database connection errors**: Normal during build (database isn't accessed at build time anymore)

## Environment File Safety

### ✅ What's Safe
- `.env.local` is in `.gitignore` (line 42: `.env*.local`)
- `.env.local.example` contains only placeholder values
- `.env.local` was never committed to git history (verified)

### ⚠️ Security Checklist
- [ ] Never commit `.env.local` to git
- [ ] Never hardcode secrets in code
- [ ] Only use `NEXT_PUBLIC_*` for values safe to expose in browser
- [ ] Keep `.env.local.example` updated with placeholder values only
- [ ] Set environment variables in Vercel dashboard, not in code

## Deployment Workflow

### Standard Deployment
1. Make code changes locally
2. Test with `npm run build` or `./scripts/verify-build.sh`
3. Commit and push to GitHub
4. Vercel automatically deploys

### If Build Fails on Vercel
1. Check Vercel deployment logs for exact error
2. Reproduce locally with `npm run build`
3. Fix the issue locally
4. Verify with `./scripts/verify-build.sh`
5. Push the fix
6. Vercel will auto-deploy

### Manual Redeploy
If you need to redeploy without code changes (e.g., after adding env vars):
1. Go to Vercel dashboard
2. Click **Deployments** tab
3. Click the **...** menu on latest deployment
4. Click **Redeploy**

## Database Schema

The database schema is automatically created on first use. Tables created:

```sql
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  free_calls_remaining INTEGER DEFAULT 5,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Troubleshooting

### Build Error: "Missing publishableKey"
- **Cause**: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` not set in Vercel
- **Fix**: Add the env var in Vercel dashboard and redeploy

### Build Error: "DATABASE_URL exists: false"
- **Cause**: `DATABASE_URL` not set in Vercel
- **Fix**: Add the env var in Vercel dashboard and redeploy
- **Note**: Database is NOT accessed during build, only at runtime

### Build Error: "ECONNREFUSED 127.0.0.1:5432"
- **Cause**: Old code trying to connect to database during build
- **Fix**: Ensure you're using the latest code with lazy-loaded pool

### Runtime Error: User not found in database
- **Cause**: Clerk webhook hasn't created user yet, or database isn't initialized
- **Fix**:
  1. Ensure `WEBHOOK_SECRET` is set in Vercel
  2. Ensure Clerk webhook is configured to point to your API
  3. Database tables are created automatically on first API call

## Development Tips

### Local Development
```bash
# Install dependencies
npm install

# Copy environment template
cp .env.local.example .env.local
# Then edit .env.local with your actual values

# Run development server
npm run dev

# Run build check before pushing
./scripts/verify-build.sh
```

### Testing Without ElevenLabs Credits
Set in `.env.local`:
```
ELEVENLABS_MOCK=1
```

### Database Initialization
The database initializes automatically when the first API call is made. You can also run:
```bash
node init-db.js
```

## Production Health

### After Successful Deployment
- ✅ Build completes without errors
- ✅ All pages load without errors
- ✅ Authentication works (Clerk)
- ✅ Database queries work
- ✅ API routes respond correctly
- ✅ ElevenLabs integration works

### Monitoring
- Check Vercel deployment logs for errors
- Monitor Vercel analytics for 500 errors
- Check Clerk dashboard for webhook delivery failures
- Check Neon (database) dashboard for connection issues

## Next Steps

When adding new features:
1. **Never** access database at module scope (use functions/API routes)
2. **Never** use Node.js APIs (`fs`, `pg`, etc.) in client components
3. **Always** test with `npm run build` before pushing
4. **Always** use `process.env.NEXT_PUBLIC_*` for browser-accessible values
5. Keep `.env.local.example` updated when adding new env vars
