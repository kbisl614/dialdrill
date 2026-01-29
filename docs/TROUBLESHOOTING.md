# Troubleshooting Guide

Quick fixes for common issues in this project.

## Build / Dev Server
- **Google Fonts fetch failures (Inter):** Removed. We use the system font stack now. If you still see font fetch errors, ensure `app/layout.tsx` and `app/globals.css` are up to date and restart the dev server.
- **Turbopack “Operation not permitted” / port binding errors:** Another process may be holding the port. Stop other `next dev` instances or set `PORT=3001` when running locally. On restricted sandboxes, run locally where port binding is allowed.
- **Middleware warning (“middleware convention deprecated”):** Informational from Next.js/Turbopack. Does not block builds; plan to migrate to the new proxy convention later.

## Database & Migrations
- **ECONNREFUSED running migrations:** Ensure `DATABASE_URL` is set in `.env.local` and the database is reachable. The migration script now loads `.env.local` via `dotenv`.
- **Migration didn’t add columns:** Re-run `npx tsx lib/migrations/add-gamification-columns.ts` after confirming `DATABASE_URL` is correct. Check logs for “[Migration] ✓ All gamification tables ready”.
- **Unauthorized API responses:** You must be signed in via Clerk to hit protected endpoints like `/api/user/profile` or call save endpoints.

## Gamification / Profile Modal
- **Streak not updating:** `/api/user/profile` updates streak/multiplier on fetch. Reload the modal to refresh. Calls also update streaks.
- **Power/badges not changing after calls:** Ensure you’re saving a call transcript via `/api/calls/save-transcript`. This route updates power, belts, badges, and streaks.
- **Modal scrolling issues:** Smooth-scroll (Lenis) can block scroll. We add `data-lenis-prevent` and always-visible scrollbars to objection/profile modals. If scroll is blocked, verify those attributes/classes are present.

## Git / Repo
- **`.git/index.lock` prevents add/commit:** A stale lock or permissions issue can block git. Close other git processes; remove the lock (`rm -f .git/index.lock`) if safe in your environment. If the sandbox blocks it, stage/commit locally.

## Environment
- **Missing env vars:** Check `.env.local` for `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `DATABASE_URL`, `WEBHOOK_SECRET`, etc. Restart the dev server after changes.

