# DialDrill Codebase Patterns & Dependencies

## Patterns

### Database Access
- **Raw SQL via pg Pool**: Helper in `db.ts` exposes `pool()` and is used directly in route handlers and libs like `entitlements.ts`.
- **Pattern**: Call `pool()` (not a new Pool) inside handlers and scripts.
- **Migrations**: Live in `lib/migrations/`.

### API Routes
- **Next App Router**: `route.ts` files with per-route `auth()` from `@clerk/nextjs/server`.
- **No shared auth middleware**: Besides `middleware.ts` which handles public-route redirects.
- **Auth Pattern**: Clerk auth is called explicitly in each API handler (e.g., `route.ts`); missing `userId` returns 401s—follow that pattern.
- **Webhook Secret**: Required for Clerk in route.ts (see README and route guard).

### Components
- **Custom components**: Live in `components/` (PascalCase filenames).
- **No shadcn/ui or UI library conventions** found.

### File Naming Conventions
- **Components**: PascalCase (e.g., `Sidebar.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useKeyboardShortcuts.ts`)
- **Lib modules**: kebab-case (e.g., `ai-coach.ts`)
- **Route folders**: kebab-case (e.g., `app/call-summary/`)
- **Route files**: `page.tsx`/`route.ts`

### State Management
- **React hooks and local context only**: Example `SidebarContext.tsx`.
- **No Zustand/Redux**: Not in package.json.

### Settings/Privacy
- **No `/settings` route**: The closest user settings/UI is the profile dropdown modal on `page.tsx` and its component `ProfileDropdownModal.tsx`.

## Known Gotchas / Quirks

1. **Clerk auth** is called explicitly in each API handler; missing `userId` returns 401s.
2. **DB helper** is a singleton pool; call `pool()` (not a new Pool) inside handlers and scripts.
3. **Webhook secret** required for Clerk in route.ts (see README and route guard).

## API Route Dependency Map

### `/api/calls/start/route.ts` (POST)
- **Auth**: `auth()` + `pool()`
- **Helpers**: 
  - `getEntitlements`, `deductCallCredit` (`entitlements.ts`)
  - `getRandomAgentId` (`agent-selector.ts`)

### `/api/calls/score/route.ts` (POST + GET)
- **Auth**: `auth()` + `pool()`
- **Helpers**: 
  - `scoreCall`, `isCallTooShort`, `generateShortCallScore` (`scoring-engine.ts`)

### `/api/calls/save-transcript/route.ts` (POST)
- **Auth**: `auth()` + `pool()`
- **Helpers**: 
  - `parseTranscript` (`transcript-parser.ts`)
  - `scoreCall/isCallTooShort/generateShortCallScore` (`scoring-engine.ts`)
  - `matchAndSaveObjections` (`objection-matcher.ts`)
  - `createNotification` (`create-notification.ts`)
  - `analyzeCallForCoaching/saveCoachingAnalysis` (`ai-coach.ts`)
  - `analyzeVoiceMetrics/saveVoiceAnalytics` (`voice-analytics.ts`)

### `/api/calls/signed-url/route.ts` (POST)
- **Auth**: No auth/db
- **Helpers**: 
  - `isSimulatedMode` (`agent-selector.ts`)
  - Calls ElevenLabs REST API when not simulated

### `/api/user/calls/route.ts` (GET)
- **Auth**: `auth()` + `pool()`
- **Helpers**: No extra helpers

### `/api/user/entitlements/route.ts` (GET)
- **Auth**: `auth()`
- **Helpers**: 
  - `getEntitlements` (`entitlements.ts`)
  - No direct db access in route

### `/api/user/profile/route.ts` (GET)
- **Auth**: `auth()` + `pool()`
- **Helpers**: In-route logic for streak/badges/stats

### `/api/user/onboarding/route.ts` (POST)
- **Auth**: `auth()` + `pool()`
- **Helpers**: No extra helpers

### `/api/leaderboard/route.ts` (GET)
- **Auth**: `auth()` + `pool()`
- **Helpers**: No extra helpers

### `/api/objections/library/route.ts` (GET)
- **Auth**: Public (no auth)
- **Helpers**: `pool()` only

### `/api/coaching/[callLogId]/route.ts` (GET)
- **Auth**: `auth()` + `pool()`
- **Helpers**: 
  - `getCoachingAnalysis` (`ai-coach.ts`)

### `/api/notifications/route.ts` (GET + POST)
- **Auth**: `auth()` + `pool()`
- **Helpers**: No extra helpers

### `/api/analytics/learning-progress/route.ts` (GET)
- **Auth**: `auth()` + `pool()`
- **Helpers**: No extra helpers

### `/api/analytics/voice/[callLogId]/route.ts` (GET)
- **Auth**: `auth()` + `pool()`
- **Helpers**: 
  - `getVoiceAnalytics` (`voice-analytics.ts`)

### `/api/stripe/checkout/route.ts` (POST)
- **Auth**: `auth()` + `pool()`
- **Helpers**: 
  - `getStripeClient` (`stripe.ts`)

### `/api/stripe/webhook/route.ts` (POST)
- **Auth**: No auth()
- **Helpers**: 
  - `pool()` + `getStripeClient` (`stripe.ts`)
  - Validates webhook signature

---

## Most-Used Endpoints & Dependencies

**High-frequency routes:**
1. `/api/calls/start` → `entitlements.ts`, `agent-selector.ts`
2. `/api/calls/save-transcript` → Multiple libs (scoring, AI coach, voice analytics, objections)
3. `/api/user/entitlements` → `entitlements.ts`
4. `/api/user/profile` → Direct db queries for stats

**Core library dependencies:**
- `lib/entitlements.ts` - Used by call start, entitlements route
- `lib/scoring-engine.ts` - Used by score and save-transcript routes
- `lib/ai-coach.ts` - Used by save-transcript and coaching routes
- `lib/voice-analytics.ts` - Used by save-transcript and analytics routes
- `lib/agent-selector.ts` - Used by call start and signed-url routes


