# DialDrill Project Handoff Document

## Project Overview
**DialDrill** is a sales call practice platform where users can practice cold calls with AI personalities powered by ElevenLabs. The platform has a tiered subscription model with Stripe payments.

**Tech Stack:**
- Next.js 16 (App Router)
- PostgreSQL (Neon)
- Clerk (Authentication)
- Stripe (Payments)
- ElevenLabs (AI Voice Conversations)
- TypeScript

**Repository:** Located at `/Users/karsynregennitter/dialdrill`

---

## Current Status: Blocks 1 & 2 Complete ✅

### ✅ Block 1: Entitlement System (COMPLETE)
**What was built:**
- Database schema migration with full tier support
- 8 personalities seeded (3 base + 5 premium "bosses")
- Single source of truth: `lib/entitlements.ts` - `getEntitlements(userId)` function
- Call duration enforcement (90s for trial, 300s for paid)
- Time warning UI (floating alert at 30 seconds remaining)

**Key Files:**
- `migrate-entitlements.js` - Database migration script
- `lib/entitlements.ts` - Entitlements logic
- `app/api/calls/start/route.ts` - Updated call start with entitlements
- `app/call/[agentId]/page.tsx` - Call page with timer

**Database Schema:**

```sql
-- Users table (extended)
ALTER TABLE users ADD COLUMNS:
  - stripe_customer_id TEXT
  - plan TEXT ('trial' | 'paid')
  - subscription_status TEXT ('active' | 'cancelled' | 'past_due')
  - trial_purchases_count INTEGER (max 2)
  - trial_calls_remaining INTEGER
  - tokens_remaining INTEGER
  - subscription_id TEXT
  - billing_cycle_start TIMESTAMP

-- Personalities table
CREATE TABLE personalities (
  id UUID PRIMARY KEY,
  name TEXT,
  description TEXT,
  agent_id TEXT (ElevenLabs agent ID),
  tier_required TEXT ('trial' | 'paid'),
  is_boss BOOLEAN
);

-- Call logs table
CREATE TABLE call_logs (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  personality_id UUID REFERENCES personalities(id),
  conversation_id TEXT,
  duration_seconds INTEGER,
  tokens_used INTEGER,
  overage_charge DECIMAL(10, 2),
  transcript JSONB,
  created_at TIMESTAMP
);
```

**Personalities Seeded:**

**Base (Trial + Paid):**
1. Josh - Local hardware store owner
2. Zenia - Foreign florist
3. Marcus - Gym owner

**Premium Bosses (Paid Only):**
4. The Wolf - Wall Street closer
5. The Motivator - Zig Ziglar tribute
6. The Shark - Ruthless investor
7. The Oracle - Visionary tech founder
8. The Titan - Fortune 500 CEO

---

### ✅ Block 2: Stripe Integration (COMPLETE)
**What was built:**
- Stripe products created via API
- Checkout endpoint for payment sessions
- Webhook handler for payment events
- Full payment flow working

**Key Files:**
- `setup-stripe-products.js` - Product creation script
- `app/api/stripe/checkout/route.ts` - Checkout session creation
- `app/api/stripe/webhook/route.ts` - Webhook event handler
- `app/api/webhooks/clerk/route.ts` - Updated for new schema

**Stripe Products:**
- **$5 Trial:** One-time payment, 5 calls, 3 personalities, 1.5min limit
  - Price ID: `price_1SfQnPLvgDMgAhf4sCwhGWTg`
- **$11.99/month Pro:** Subscription, 20k tokens (~20 calls), 8 personalities, 5min limit
  - Price ID: `price_1SfQnPLvgDMgAhf4SiIUxKSv`

**Environment Variables Set:**
```
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_PRICE_TRIAL_ID=price_1SfQnPLvgDMgAhf4sCwhGWTg
STRIPE_PRICE_PAID_ID=price_1SfQnPLvgDMgAhf4SiIUxKSv
```

**Webhook Events Handled:**
- `checkout.session.completed` - Activates trial or subscription
- `invoice.paid` - Resets tokens monthly
- `customer.subscription.updated` - Updates subscription status
- `customer.subscription.deleted` - Cancels subscription

---

## Payment Model Details (CRITICAL)

### Trial Tier ($5)
- **Type:** One-time payment (NOT subscription)
- **Credits:** 5 calls (NOT token-based)
- **Limit:** User can purchase up to 2 trials maximum
- **After 2 trials:** Must upgrade to $11.99 or lose access
- **Call Duration:** 90 seconds (1.5 minutes)
- **Personalities:** 3 base personalities

### Paid Tier ($11.99/month)
- **Type:** Monthly subscription
- **Credits:** 20,000 tokens per month (1 call = 1,000 tokens = ~20 calls)
- **Overage:** When tokens hit 0, user can still call at $1/call (auto-charged)
- **Rollover:** NO - tokens reset monthly
- **Call Duration:** 300 seconds (5 minutes)
- **Personalities:** All 8 personalities
- **Token Deduction:** Fixed 1,000 tokens per call (NOT variable by duration)

### New User Flow
- New users get: `plan = 'trial'`, `trial_calls_remaining = 5`, `trial_purchases_count = 1`
- This is their FIRST trial (counts as 1 of 2 allowed)

---

## Remaining Work: Blocks 3-8

### ⏳ Block 3: Upgrade Button Placement (HIGH PRIORITY)
**Estimated Time:** 45-60 minutes

**Requirements:**
- Add "Upgrade" button on dashboard next to credits display
- Show when user runs out of credits
- Click behavior:
  - Trial users (< 2 purchases): Show both $5 trial + $11.99 options
  - Trial users (2 purchases): Only show $11.99 option
  - Paid users: Hide button entirely
- Button calls `/api/stripe/checkout` with appropriate `priceId` and `planType`
- Redirects to Stripe Checkout

**Files to Modify:**
- `app/dashboard/page.tsx` - Add upgrade button UI

---

### ⏳ Block 4: "Buy More Tokens" Button (HIGH PRIORITY)
**Estimated Time:** 30-45 minutes

**Requirements:**
- Global button in top-right corner of EVERY page
- Always visible (add to layout component)
- Click behavior by plan:
  - **Trial (< 2 purchases):** Show modal with trial + pro options
  - **Trial (2 purchases):** Route to $11.99 upgrade only
  - **Paid users:** Show message: "You're on the highest tier. Additional calls are $1 each."

**Files to Create/Modify:**
- Create reusable component: `components/BuyTokensButton.tsx`
- Add to layout: `app/layout.tsx` or create shared header component

---

### ⏳ Block 5: Personality Picker UI (MEDIUM PRIORITY)
**Estimated Time:** 1.5-2 hours

**Requirements:**
- Add personality selection UI on dashboard BEFORE starting call
- Two modes:
  1. **Select Personality:** Grid showing all 8 personalities
     - Trial users: 3 unlocked, 5 locked (grayed with lock icon)
     - Paid users: All 8 unlocked
     - Click locked personality → Shows upgrade modal
  2. **Randomized:** Auto-selects from unlocked personalities
- Pass `personalityId` to `/api/calls/start` endpoint
- Display personality metadata: name, description, tier badge

**API Already Ready:**
- `getEntitlements()` returns `unlockedPersonalities` and `lockedPersonalities`
- `/api/calls/start` accepts `personalityId` in request body

**Files to Create/Modify:**
- Create: `components/PersonalitySelector.tsx`
- Modify: `app/dashboard/page.tsx` - Add personality selection step

---

### ⏳ Block 6: Tokens Display (HIGH PRIORITY)
**Estimated Time:** 30-45 minutes

**Requirements:**
- Update dashboard credits display based on plan:
  - **Trial users:** "5 calls remaining"
  - **Paid users:** "18,432 tokens remaining (~18 calls)"
- Show overage status if tokens = 0 for paid users
- Create new API endpoint: `/api/user/entitlements` (returns full entitlements)
- Replace existing `/api/user/calls` endpoint

**Files to Create/Modify:**
- Create: `app/api/user/entitlements/route.ts`
- Modify: `app/dashboard/page.tsx` - Update credits display logic

**API Response Format:**
```typescript
GET /api/user/entitlements
{
  plan: 'trial' | 'paid',
  canCall: boolean,
  trialCallsRemaining?: number,
  tokensRemaining?: number,
  isOverage: boolean,
  trialPurchasesCount: number,
  canBuyAnotherTrial: boolean,
  unlockedPersonalities: Personality[],
  lockedPersonalities: Personality[]
}
```

---

### ⏳ Block 7: Post-Call Transcripts (MEDIUM PRIORITY)
**Estimated Time:** 1-1.5 hours

**Requirements:**
- Save transcript to database after call ends
- Create "Call History" page showing past calls
- Display: transcript, duration, personality used, tokens spent, timestamp
- Transcript already captured in UI - need to POST to backend

**Files to Create:**
- Create: `app/api/calls/save-transcript/route.ts`
- Create: `app/history/page.tsx` (call history page)
- Modify: `app/call/[agentId]/page.tsx` - POST transcript on call end

**Database:**
- `call_logs` table already has `transcript JSONB` column

---

### ⏳ Block 8: Site Hygiene + UI Cleanup (LOW PRIORITY)
**Estimated Time:** 30-45 minutes

**Requirements:**
- Test all navigation links
- Remove bottom mini dashboard from call page (if exists)
- Verify all CTAs point to correct destinations
- Check Loom walkthrough link works
- Test all pages for broken links

**Files to Check:**
- All page components for broken links
- Navigation components
- Footer/header links

---

## Important Implementation Notes

### Trial Purchase Counter Logic
```typescript
// User can buy trial if:
trial_purchases_count < 2

// After each trial purchase:
trial_purchases_count = trial_purchases_count + 1
trial_calls_remaining = trial_calls_remaining + 5
```

### Credit Deduction Logic
```typescript
// Trial users:
UPDATE users SET trial_calls_remaining = trial_calls_remaining - 1

// Paid users (with tokens):
UPDATE users SET tokens_remaining = tokens_remaining - 1000

// Paid users (overage):
// Don't deduct tokens (already 0)
// Log overage_charge = 1.00 in call_logs
// Stripe will invoice $1 separately
```

### Entitlements Function Usage
**ALWAYS use `getEntitlements(userId)` instead of direct database queries**

This is the single source of truth for:
- Can user make a call?
- Which personalities are unlocked?
- How many credits/tokens remaining?
- Call duration limit
- Trial purchase eligibility

**Example:**
```typescript
const entitlements = await getEntitlements(userId);
if (!entitlements.canCall) {
  // Show upgrade button
}
```

---

## Key Files Reference

### Backend
- `lib/entitlements.ts` - Core entitlements logic (USE THIS EVERYWHERE)
- `lib/db.ts` - Database connection
- `app/api/calls/start/route.ts` - Start call endpoint
- `app/api/stripe/checkout/route.ts` - Create checkout session
- `app/api/stripe/webhook/route.ts` - Handle Stripe events
- `app/api/webhooks/clerk/route.ts` - Handle Clerk user creation

### Frontend
- `app/dashboard/page.tsx` - Main dashboard (needs upgrade button + token display)
- `app/call/[agentId]/page.tsx` - Call page with timer
- Need to create: Personality selector, buy tokens button, call history

### Database Scripts
- `migrate-entitlements.js` - Already run, creates all tables
- `setup-stripe-products.js` - Already run, created Stripe products

---

## Git Workflow
**IMPORTANT:** User wants to test locally before pushing to GitHub.

**Current Branch:** `main`

**Workflow:**
1. Make changes and commit frequently
2. Test locally with `npm run dev`
3. User will manually `git push` when ready to deploy
4. Vercel auto-deploys on push to main

**Recent Commits:**
```
f8b5944 - Fix TypeScript error in Stripe webhook handler
c2cf1f1 - Add Stripe checkout and webhook handlers
b21b9e1 - Install Stripe SDK and create products
1aa71d1 - Add call duration enforcement with time warning UI
dd4857e - Add entitlements system and update call start logic
6e85073 - Add entitlements database migration
```

---

## Environment Setup

### Already Configured:
- `.env.local` has all keys (Clerk, Stripe, ElevenLabs, Database)
- Stripe products created in test mode
- Database migrated with all tables
- Dependencies installed (`stripe` package added)

### To Run Locally:
```bash
npm run dev
# App runs on http://localhost:3000
```

### To Test Stripe Webhooks Locally:
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Copy webhook secret to .env.local:
# STRIPE_WEBHOOK_SECRET=whsec_...
```

### Test Cards (Stripe Test Mode):
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`

---

## Critical Constraints

### DO NOT:
- ❌ Change the entitlements model (it's the foundation)
- ❌ Modify Stripe webhook logic (payments will break)
- ❌ Change database schema without migration
- ❌ Push to GitHub without user approval
- ❌ Allow unlimited trial purchases (max 2)
- ❌ Allow token rollover (resets monthly)

### DO:
- ✅ Use `getEntitlements()` for all access checks
- ✅ Commit after each logical change
- ✅ Test locally before deployment
- ✅ Follow existing code patterns
- ✅ Use TypeScript strictly
- ✅ Log important events with `console.log`

---

## Next Steps for New LLM

**Recommended Order:**
1. **Read this entire document carefully**
2. **Verify environment setup** (`npm run dev` works)
3. **Start with Block 6** (Tokens Display) - Quick win, needed for other blocks
4. **Then Block 3** (Upgrade Button) - High priority UX
5. **Then Block 4** (Buy Tokens Button) - Complete payment UX
6. **Then Block 5** (Personality Picker) - Enhance call experience
7. **Then Block 7** (Transcripts) - Nice-to-have feature
8. **Finally Block 8** (Cleanup) - Polish

**Estimated Total Time:** 5-7 hours

---

## Questions for User Before Starting

Before implementing each block, ask:
1. **UI/UX preferences** (button placement, colors, wording)
2. **Confirmation on behavior** (e.g., modal vs redirect for upgrade)
3. **Priority changes** (if they want to reorder blocks)

---

## Testing Checklist

After each block, test:
- [ ] Build succeeds (`npm run build`)
- [ ] No TypeScript errors
- [ ] Feature works locally (`npm run dev`)
- [ ] Database updates correctly
- [ ] Error states handled gracefully
- [ ] Mobile responsive (if UI changes)

---

## Contact/Handoff

**User:** karsynregennitter
**Project Path:** `/Users/karsynregennitter/dialdrill`
**Current Status:** Blocks 1-2 complete, ready for Blocks 3-8
**Deadline:** 2 days total (Day 1 spent on Blocks 1-2)

**All backend infrastructure is DONE. Remaining work is primarily frontend/UI.**

---

## Additional Context

### User Preferences:
- Wants to see progress via todo lists
- Prefers clear explanations before implementation
- Wants to test locally before deploying
- Values clean, professional code

### Code Style:
- TypeScript strict mode
- Functional components (React)
- Server components where possible
- Clear console logging for debugging
- Descriptive commit messages

---

**Good luck! The foundation is solid. Focus on shipping clean UI/UX for the remaining blocks.** 🚀
