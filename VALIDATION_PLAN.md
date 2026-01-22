# Design System Migration Validation Plan

**Date:** 2025-01-27  
**Purpose:** Ensure zero visual changes during design system migration  
**Strategy:** Visual regression testing + manual verification

---

## Pre-Migration Baseline

### 1. Visual Baseline Capture

**Before making ANY changes:**

```bash
# 1. Create a baseline branch
git checkout -b design-system-migration-baseline
git commit -am "Baseline before design system migration"

# 2. Start development server
npm run dev

# 3. Capture screenshots of all pages
```

**Pages to Screenshot:**
- `/` (Landing page)
- `/dashboard` (Dashboard)
- `/dashboard` with different states (loading, error, with data)
- `/call/[agentId]` (Active call page)
- `/call-summary/[callLogId]` (Call summary)
- `/history` (Call history)
- `/performance` (Performance page)
- `/plans` (Plans page)
- `/settings/privacy` (Privacy settings)
- `/how-it-works` (How it works)

**Components to Screenshot:**
- Modal states (OnboardingModal, QuickPracticeModal, ObjectionLibraryModal, ProfileDropdownModal)
- Button variants (hover, active, disabled states)
- Card variants (hover states)
- Loading states
- Error states

**Screenshot Tool:**
```bash
# Using Playwright (if available)
npm run test:visual:baseline

# OR manual screenshots saved to:
screenshots/baseline/
```

---

## Validation Strategy

### Phase 1: After Adding Tokens (Low Risk)

**What to Validate:**
- ✅ TypeScript compilation succeeds
- ✅ Build succeeds (`npm run build`)
- ✅ No console errors
- ✅ CSS variables load correctly

**Commands:**
```bash
npm run type-check
npm run build
npm run lint
```

**Visual Check:** None required (no component changes yet)

---

### Phase 2: After Creating Component Patterns (Low Risk)

**What to Validate:**
- ✅ New components render correctly
- ✅ TypeScript types are correct
- ✅ Components match existing patterns visually

**Test:**
```typescript
// Create test page: app/test-components/page.tsx
// Render all new components side-by-side with old patterns
// Compare visually
```

**Commands:**
```bash
npm run build
# Visit /test-components and visually compare
```

---

### Phase 3: After Each High-Priority File Migration

**Validation Checklist (Repeat for each file):**

#### 3.1 Automated Checks
```bash
# Type checking
npm run type-check

# Build
npm run build

# Linting
npm run lint

# Unit tests (if available)
npm run test
```

#### 3.2 Visual Regression

**Option A: Automated (Preferred)**
```bash
# Run visual regression test for changed page
npm run test:visual -- --changed

# Compare against baseline
# Expected: 0% difference threshold
```

**Option B: Manual Screenshot Comparison**
1. Take new screenshot of migrated page
2. Compare side-by-side with baseline
3. Verify:
   - ✅ Colors match exactly
   - ✅ Spacing is identical
   - ✅ Animations behave the same
   - ✅ Hover states work
   - ✅ Responsive breakpoints unchanged

#### 3.3 Interactive Testing

**Manual verification on migrated page:**
- [ ] Page loads without errors
- [ ] All buttons are clickable
- [ ] Hover effects work correctly
- [ ] Animations play smoothly
- [ ] Forms submit correctly
- [ ] Modals open/close correctly
- [ ] Responsive design works (mobile, tablet, desktop)
- [ ] Dark mode unchanged (if applicable)
- [ ] Accessibility (keyboard navigation, screen reader)

#### 3.4 Browser Testing

**Test in:**
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Mobile Safari (iOS)
- Mobile Chrome (Android)

---

### Phase 4: After All Migrations Complete

#### 4.1 Full Visual Regression Suite

```bash
# Run full visual regression test
npm run test:visual

# Expected: All tests pass with 0% difference
```

#### 4.2 Manual Full Site Walkthrough

**Go through entire user journey:**
1. [ ] Landing page → Sign up
2. [ ] Dashboard → Select personality → Start call
3. [ ] Call page → Complete call → View summary
4. [ ] View call history
5. [ ] View performance page
6. [ ] Navigate to plans page
7. [ ] Update privacy settings
8. [ ] Open all modals
9. [ ] Test all interactive elements

#### 4.3 Performance Validation

```bash
# Measure bundle size
npm run build
# Compare bundle size before/after
# Expected: No significant increase (< 5%)

# Run Lighthouse audit
npm run lighthouse

# Compare scores:
# - Performance should be same or better
# - Accessibility should be same or better
```

#### 4.4 Code Quality Validation

```bash
# Run all linters
npm run lint

# Check for any remaining hard-coded values
grep -r "#[0-9a-fA-F]\{6\}" app/ components/ --exclude-dir=node_modules
# Expected: Only in design system files or comments

# Check for inline animation definitions
grep -r "duration:" app/ components/ --exclude-dir=node_modules
# Expected: Only in design system files or where necessary
```

---

## Visual Regression Testing Setup

### Option 1: Playwright Visual Comparison

```typescript
// tests/visual.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Visual Regression', () => {
  test('landing page', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveScreenshot('landing-page.png', {
      threshold: 0, // Zero tolerance
    });
  });

  test('dashboard', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveScreenshot('dashboard.png', {
      threshold: 0,
    });
  });

  // ... more tests
});
```

### Option 2: Percy (Visual Testing Service)

```bash
npm install -D @percy/playwright

# In CI/CD
PERCY_TOKEN=xxx npm run test:visual
```

### Option 3: Manual Screenshot Comparison

**Process:**
1. Take screenshots before migration → `screenshots/baseline/`
2. Take screenshots after migration → `screenshots/migrated/`
3. Use image comparison tool (e.g., `pixelmatch`, `imagemagick`)
4. Review any differences manually

---

## Expected Changes (Non-Visual)

### DOM Changes (Acceptable)

```html
<!-- Before -->
<div className="bg-[#00d9ff]">

<!-- After -->
<div className="bg-cyan-bright">
<!-- OR -->
<div style={{ backgroundColor: 'var(--color-cyan-bright)' }}>
```

**Impact:** Class names change, but computed styles are identical ✅

### Bundle Changes (Monitor)

**Expected:**
- Possible small increase in bundle size (design system imports)
- Should be offset by reduced duplication

**Acceptable:** < 5% increase in total bundle size

---

## Validation Checklist

### Pre-Migration
- [ ] Screenshots captured of all pages
- [ ] Git branch created
- [ ] Baseline visual regression tests passing
- [ ] All existing tests passing

### During Migration (Per File)
- [ ] TypeScript compiles
- [ ] Build succeeds
- [ ] No console errors
- [ ] Visual regression test passes (0% difference)
- [ ] Manual visual check passes
- [ ] Interactive features work
- [ ] Responsive design works

### Post-Migration
- [ ] All visual regression tests pass
- [ ] Full site walkthrough completed
- [ ] All browsers tested
- [ ] Performance metrics unchanged
- [ ] Bundle size acceptable
- [ ] No hard-coded values remain
- [ ] All tests passing
- [ ] Code review completed

---

## Rollback Plan

If visual regression tests fail:

1. **Immediate:**
   ```bash
   git checkout design-system-migration-baseline
   # Or revert specific commit
   git revert <commit-hash>
   ```

2. **Investigate:**
   - Check what changed
   - Fix issue
   - Re-run validation

3. **Re-attempt:**
   - Fix and re-validate
   - Or revert and fix incrementally

---

## Success Criteria

✅ **Zero visual differences** (0% threshold in visual regression)  
✅ **All existing functionality works** (manual testing)  
✅ **All tests pass** (automated testing)  
✅ **No hard-coded values remain** (code review)  
✅ **Bundle size acceptable** (< 5% increase)  
✅ **Performance unchanged** (Lighthouse scores)  
✅ **Accessibility maintained** (a11y checks)  

---

## Tools Needed

### Required
- ✅ Git (version control)
- ✅ TypeScript compiler
- ✅ Next.js build system
- ✅ Screenshot tool (browser DevTools or Playwright)

### Optional (Recommended)
- Playwright (visual regression)
- Percy (visual testing service)
- Lighthouse (performance)
- Bundle analyzer (size analysis)

---

**Validation should be performed after EACH file migration to catch issues early.**
