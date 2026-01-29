# Feature: Phase 5.1 Privacy Foundation

## Overview
Add user privacy controls to DialDrill with 3 settings (profile visibility, stats visibility, leaderboard participation) that are enforced server-side across all relevant API routes. This is the foundation for all future social features.

## User Stories

1. As a user, I want my privacy settings stored in the database so they persist across sessions.
2. As a user, I want an API endpoint to read and update my privacy settings.
3. As a user, I want a settings page where I can toggle my privacy preferences with clear explanations.
4. As a user, I want to opt out of the leaderboard so my rank is not visible to others.
5. As a user, I want to make my profile private so others cannot view it.
6. As a user, I want to hide my stats while still showing my achievements (belt, tier, badges).
7. As a user, I want the system to handle edge cases gracefully (empty leaderboards, new users, etc.).

## Privacy Rules (Truth Table)

| Setting | Value | Behavior |
|---------|-------|----------|
| `profile_visibility` | `'public'` | Anyone logged in can view `/profile/[id]` |
| `profile_visibility` | `'private'` | Returns 404 to other users; owner sees their own |
| `show_stats_publicly` | `true` | Stats visible on profile to others |
| `show_stats_publicly` | `false` | Stats hidden everywhere except to owner (stats = total_calls, total_minutes, scores; NOT belt/tier/badges) |
| `show_on_leaderboard` | `true` | User included in leaderboard results and rank calculations |
| `show_on_leaderboard` | `false` | User excluded from leaderboard results AND rank calculations (ranks recalculate real-time) |

## Acceptance Criteria

### Database
- [ ] `users` table has: `profile_visibility`, `show_stats_publicly`, `show_on_leaderboard`, `privacy_updated_at`
- [ ] Defaults: `'public'`, `true`, `true`
- [ ] Migration is non-breaking for existing users

### Server-Side Enforcement
- [ ] `/api/leaderboard` filters out `show_on_leaderboard = false` server-side
- [ ] `/api/profile/[id]` enforces visibility server-side
- [ ] `/api/users/search` (if exists) filters out `profile_visibility = 'private'` server-side
- [ ] No private users leak through pagination, sorting, or rank edge cases

### Authorization
- [ ] Only logged-in user can update their own privacy settings
- [ ] Attempts to update another user's settings return 403

### UI
- [ ] `/settings/privacy` page with 3 toggles
- [ ] Helper text under each toggle explaining what it affects
- [ ] "Saved" feedback state + error state
- [ ] Preview note when profile is private

### Validation
- [ ] `npm run lint` passes
- [ ] `npm run verify-build` passes
- [ ] No console errors on settings page, leaderboard, or profile routes

### Edge Cases
- [ ] New user with no settings row yet — works with defaults
- [ ] Existing users migrated — works with defaults
- [ ] Leaderboard empty after filtering — UI renders cleanly
- [ ] All users private/hidden — API returns empty list cleanly

## Constraints

- Profile routes use UUID (`/profile/[id]`), not username (no username column exists)
- Stats = `total_calls`, `total_minutes`, scores. NOT belt/tier/badges/power_level.
- Leaderboard ranks recalculate in real-time (no caching)
- Server-side enforcement only — never rely on frontend to hide users

## Non-Goals

- Social profile fields (bio, linkedin, twitter) — save for Public Profile phase
- Username system — save for future phase
- Cached/scheduled rank recalculation
- Team/enterprise privacy features
