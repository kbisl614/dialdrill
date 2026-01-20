# Codebase Memory & Rules

## Architecture Overview

DialDrill is a SaaS cold-calling practice platform built with Next.js App Router. Users practice sales calls with AI personas, receive scores, and progress through a gamification system (belts, badges, streaks).

This phase adds privacy controls as foundation for future social features.

## File Structure Conventions

```
app/
  api/
    [route-name]/
      route.ts          # API handlers (GET, POST, PATCH, etc.)
  [page-name]/
    page.tsx            # Page components
components/
  ComponentName.tsx     # PascalCase
lib/
  module-name.ts        # kebab-case
  migrations/
    migration-name.ts   # kebab-case
```

## Required Patterns

### Database Access

```typescript
// ALWAYS use pool() from lib/db.ts - never new Pool()
import { pool } from '@/lib/db';

// In route handlers:
const client = await pool().connect();
try {
  const result = await client.query('SELECT ...', [params]);
  return NextResponse.json(result.rows);
} finally {
  client.release();
}
```

### API Route Authentication

```typescript
// ALWAYS call auth() at start of every handler
import { auth } from '@clerk/nextjs/server';

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // ... rest of handler
}
```

### Migration Pattern

```typescript
// Follow pattern from lib/migrations/add-gamification-columns.ts
import { pool } from '../db';

export async function addPrivacyColumns() {
  const client = await pool().connect();
  try {
    await client.query(`
      ALTER TABLE users
        ADD COLUMN IF NOT EXISTS column_name TYPE DEFAULT value;
    `);
    console.log('Migration: add-privacy-columns completed');
  } finally {
    client.release();
  }
}
```

### Component Pattern

```typescript
// PascalCase filename, 'use client' for interactive components
'use client';

import { useState, useEffect } from 'react';

export default function ComponentName() {
  // React hooks for state
  // Fetch from API routes
  // Tailwind for styling
}
```

## Privacy-Specific Rules

### Truth Table (IMPLEMENT EXACTLY)

| Setting | Value | Behavior |
|---------|-------|----------|
| `profile_visibility` | `'public'` | Anyone logged in can view |
| `profile_visibility` | `'private'` | 404 to others, owner sees own |
| `show_stats_publicly` | `false` | Hide total_calls, total_minutes from others |
| `show_on_leaderboard` | `false` | Exclude from results AND rank calculation |

### What Counts as "Stats" (hide when show_stats_publicly=false)
- `total_calls`
- `total_minutes`
- Call scores

### What is NOT "Stats" (always visible)
- `current_belt`
- `current_tier`
- `power_level`
- Badges
- `member_since`

## Users Table Schema (Current + New Columns)

```sql
-- Existing columns
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
clerk_id TEXT UNIQUE NOT NULL
email TEXT UNIQUE NOT NULL
free_calls_remaining INTEGER DEFAULT 5
created_at TIMESTAMP DEFAULT NOW()
power_level INTEGER DEFAULT 0
current_tier TEXT DEFAULT 'Bronze'
current_belt TEXT DEFAULT 'White'
current_streak INTEGER DEFAULT 0
longest_streak INTEGER DEFAULT 0
last_login_date DATE
streak_multiplier DECIMAL(3,2) DEFAULT 1.00
total_calls INTEGER DEFAULT 0
total_minutes INTEGER DEFAULT 0
total_badges_earned INTEGER DEFAULT 0
member_since TEXT
onboarding_data JSONB
onboarding_completed_at TIMESTAMP

-- NEW columns (this phase)
profile_visibility TEXT DEFAULT 'public' CHECK (profile_visibility IN ('public', 'private'))
show_stats_publicly BOOLEAN DEFAULT TRUE
show_on_leaderboard BOOLEAN DEFAULT TRUE
privacy_updated_at TIMESTAMP
```

## Known Gotchas

1. **No username column** - Use `id` (UUID) for profile routes, not username
2. **Clerk auth is per-route** - Must call `auth()` in every handler
3. **pool() is singleton** - Never instantiate new Pool()
4. **Migrations use IF NOT EXISTS** - Safe to run multiple times
5. **Check constraints on enums** - profile_visibility must be 'public' or 'private'

## Validation Commands

```bash
npm run lint           # ESLint check
npm run verify-build   # Full preflight (typecheck + build + env validation)
```

Both must pass before marking a story complete.

## Commit Guidelines

- Format: `Ralph: story-XXX - Title of story`
- Commit after each story passes validation
- Never commit if validation fails
- One story = one commit

## DO NOT

- Refactor unrelated code
- "Clean up" or "improve" existing files not in scope
- Add new npm dependencies without explicit approval
- Modify forbidden paths (see ralph.config.json)
- Touch app/layout.tsx, middleware.ts, or config files
- Change existing API route signatures
- Delete or modify existing migrations

---

*This file is read by the agent at the start of each iteration. Only edit for foundational rule changes.*
