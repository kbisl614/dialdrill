# Debugging & Resilience System Cleanup Plan

## Audit Results

### ✅ **USED (Keep & Improve):**
1. **lib/health-monitor.ts** - Used by `/api/health/route.ts`
   - Issue: External service checks are just key-format checks, not real health checks
   - Fix: Simplify to database-only for quick checks, keep detailed checks optional

2. **lib/circuit-breaker.ts** + **lib/retry.ts** - Used by `lib/ai-coach.ts`
   - Status: Working correctly
   - Issue: Error logging might leak details in production
   - Fix: Use logger utility with production-safe logging

3. **SELF_HEALING_SYSTEM.md** - Design documentation
   - Keep as reference

### ❌ **UNUSED (Remove):**
1. **lib/api-wrapper.ts** - Not imported anywhere (only in docs)
2. **lib/rate-limiter.ts** - Only used by api-wrapper.ts (which is unused)
3. **DEBUG-RESULTS.md** - Historical debug log, outdated

### 🔧 **NEEDS CLEANUP:**
1. **Console logging** - 176 matches across 26 files
   - Replace with centralized logger
   - Remove/consolidate redundant logs
   - Gate performance logs to development

2. **Error responses** - Expose details in production
   - Hide error details in production
   - Standardize error format

3. **Health checks** - External service checks are format-only
   - Simplify or improve to actual health checks

4. **Test scripts** - Can be kept for local dev or removed if not needed

---

## Cleanup Tasks

### Task 1: Create Logger Utility ✅
**File:** `lib/logger.ts`
**Status:** Created
- Environment-aware logging
- Performance timing
- Error logging with context

### Task 2: Remove Unused Code
- Delete `lib/api-wrapper.ts`
- Delete `lib/rate-limiter.ts`
- Update `SELF_HEALING_SYSTEM.md` to remove references

### Task 3: Simplify Health Monitor
- Keep database check (real health check)
- Make external service checks optional/simplified
- Improve health check accuracy

### Task 4: Replace Console Logs
- Replace `console.log` with `logger.debug/info` in API routes
- Replace `console.error` with `logger.error`
- Remove redundant performance logs in UI (or gate to dev)

### Task 5: Harden Error Responses
- Hide error details in production
- Standardize error format across routes
- Keep detailed logs server-side only

### Task 6: Remove Historical Docs
- Delete `DEBUG-RESULTS.md`

---

## Decision: Keep or Remove Test Scripts?

**Files:** `test-db.js`, `init-db.js`, `create-test-user.js`

**Recommendation:** Keep for local development, but can remove if:
- Not using for local testing
- Database migrations handled differently
- Want cleaner repo

**Action:** Will ask user or keep for now


