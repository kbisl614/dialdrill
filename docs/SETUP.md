# DialDrill Setup Guide

## Authentication & Database Integration

Your Next.js app is now configured with Clerk authentication and Neon PostgreSQL database.

## What's Been Set Up

### 1. Installed Dependencies
- `@clerk/nextjs` - Clerk authentication SDK
- `pg` - PostgreSQL client for Neon database
- `svix` - Webhook verification for Clerk events

### 2. Files Created/Modified

#### Core Files
- `/lib/db.ts` - Database connection pool and initialization
- `/middleware.ts` - Clerk authentication middleware
- `/app/layout.tsx` - ClerkProvider wrapper added
- `/app/page.tsx` - Sign-up landing page with Clerk buttons
- `/app/dashboard/page.tsx` - Protected dashboard showing user info and free calls

#### API Routes
- `/app/api/user/calls/route.ts` - Fetch user's free calls remaining
- `/app/api/webhooks/clerk/route.ts` - Webhook endpoint for new user creation

### 3. Database Schema
The `users` table is automatically created with:
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  free_calls_remaining INTEGER DEFAULT 5,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Environment Variables Required

Your `.env.local` should have these keys:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
DATABASE_URL=postgresql://...
WEBHOOK_SECRET=whsec_...  # You'll get this from Clerk Dashboard
```

## Critical Setup Steps

### 1. Configure Clerk Webhook (REQUIRED!)

Without this webhook, new users won't be saved to your database.

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application
3. Navigate to **Webhooks** in the sidebar
4. Click **Add Endpoint**
5. Configure:
   - **Endpoint URL**: `https://yourdomain.com/api/webhooks/clerk`
     - For local testing: Use [ngrok](https://ngrok.com) to expose localhost
     - Example: `https://abc123.ngrok.io/api/webhooks/clerk`
   - **Subscribe to events**: Check `user.created`
6. Copy the **Signing Secret** (starts with `whsec_`)
7. Add to `.env.local` as `WEBHOOK_SECRET=whsec_...`

### 2. Testing Locally with ngrok

To test webhooks locally:

```bash
# Install ngrok (if not already installed)
brew install ngrok  # macOS
# or download from https://ngrok.com

# Start your Next.js dev server
npm run dev

# In another terminal, start ngrok
ngrok http 3000

# Copy the HTTPS URL (e.g., https://abc123.ngrok.io)
# Use this URL in Clerk webhook configuration: https://abc123.ngrok.io/api/webhooks/clerk
```

## Testing the Authentication Flow

### Step-by-Step Test

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Visit http://localhost:3000**:
   - You should see the landing page with "Get Started" buttons
   - The page uses your DialDrill styling (dark navy, cyan accents)

3. **Click "Get Started" or "Sign Up"**:
   - Clerk modal will appear
   - Enter a test email (e.g., `test@example.com`)
   - Complete the sign-up flow

4. **After sign-up**:
   - You're automatically redirected to `/dashboard`
   - Dashboard shows:
     - "Welcome back, [your-email]"
     - "Free Calls Remaining: 5"
     - Progress bar showing 100% (5/5 calls)
     - "Start Call" button (currently a placeholder)
     - Account stats

5. **Verify database**:
   - Check your Neon database
   - Query: `SELECT * FROM users;`
   - You should see the new user with `clerk_id`, `email`, and `free_calls_remaining = 5`

6. **Test sign-out**:
   - Click "Sign Out" in dashboard header
   - You're redirected back to the landing page

7. **Test sign-in**:
   - Click "Sign In" in header
   - Enter your credentials
   - Redirected back to dashboard

## Architecture Overview

### Authentication Flow
1. User clicks "Get Started" → Clerk sign-up modal opens
2. User completes sign-up → Clerk creates account
3. Clerk sends webhook to `/api/webhooks/clerk` → User created in database
4. User automatically signed in → Redirected to `/dashboard`

### Dashboard Data Flow
1. Dashboard loads → Checks if user is authenticated (Clerk)
2. If authenticated → Fetches user data from `/api/user/calls`
3. API route → Queries database using `clerk_id`
4. Returns `free_calls_remaining` → Displayed on dashboard

### Security
- All routes except `/` and `/api/webhooks/clerk` are protected by Clerk middleware
- Unauthenticated users are automatically redirected to sign-in
- Database queries use the Clerk user ID (`clerk_id`) for secure lookups
- Webhook signatures are verified using `svix` to prevent spoofing

## Common Issues & Solutions

### Issue 1: "User not found" in dashboard
**Cause**: Webhook didn't fire or failed
**Solution**:
- Check Clerk webhook logs in dashboard
- Verify `WEBHOOK_SECRET` is correct in `.env.local`
- For local testing, ensure ngrok is running

### Issue 2: Database connection error
**Cause**: Invalid `DATABASE_URL`
**Solution**:
- Verify the connection string in `.env.local`
- Check that your Neon database is active
- Test connection: `psql $DATABASE_URL`

### Issue 3: Clerk authentication not working
**Cause**: Missing or incorrect Clerk keys
**Solution**:
- Verify `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` in `.env.local`
- Check that keys match your Clerk application

### Issue 4: Webhook returning 401/403
**Cause**: Invalid webhook signature
**Solution**:
- Ensure you copied the correct signing secret from Clerk
- The secret should start with `whsec_`

## Next Steps

### 1. Deploy to Production
When deploying to Vercel/production:
- Add all environment variables to your hosting platform
- Update Clerk webhook URL to your production domain
- Test the full authentication flow in production

### 2. Implement Call Functionality
Currently, "Start Call" is a placeholder. Next steps:
- Create API route to handle call initiation
- Integrate with voice/AI service
- Decrement `free_calls_remaining` after each call
- Store call records and transcripts

### 3. Add Payment Integration
For users who exhaust free calls:
- Integrate Stripe for payments
- Create subscription plans
- Update database schema for paid users

## File Structure

```
/app
  /layout.tsx              # ClerkProvider wrapper, DB initialization
  /page.tsx                # Landing page with sign-up
  /dashboard
    /page.tsx              # Protected dashboard
  /api
    /user
      /calls
        /route.ts          # Get user's free calls remaining
    /webhooks
      /clerk
        /route.ts          # Handle user.created webhook
/lib
  /db.ts                   # Database connection & initialization
/middleware.ts             # Clerk authentication middleware
.env.local                 # Environment variables (not in git)
```

## Support & Documentation

- [Clerk Documentation](https://clerk.com/docs)
- [Neon Documentation](https://neon.tech/docs)
- [Next.js Documentation](https://nextjs.org/docs)

## Your Dev Server

Your app is currently running at:
- **Local**: http://localhost:3000
- **Landing Page**: Authentication, sign-up
- **Dashboard**: http://localhost:3000/dashboard (requires sign-in)

Happy coding! 🚀
