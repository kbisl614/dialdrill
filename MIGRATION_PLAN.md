# Design System Migration Plan

**Date:** 2025-01-27  
**Status:** Ready for Implementation  
**Estimated Impact:** ~30-40 files need updates

---

## Overview

This plan outlines the step-by-step migration from hard-coded design values to the centralized design system, ensuring zero visual changes while improving consistency and maintainability.

---

## Phase 1: Add Missing Design Tokens (1-2 files)

### 1.1 Update `lib/design-system/tokens.ts`

**Add missing color tokens:**

```typescript
// Add to colors object:
cyan: {
  // ... existing
  brightAlt2: '#00ffea',  // NEW - used 89+ times
},
purple: {
  // ... existing
  magenta: '#9d4edd',      // NEW - used 24+ times
  light: '#d8b4fe',        // NEW - used 12+ times
},
background: {
  // ... existing
  darkest: '#030712',      // NEW - used 8+ times
  cardDark: '#1A1F2E',     // NEW - used 10+ times
},
```

**Add missing animation durations:**

```typescript
animation: {
  duration: {
    // ... existing
    medium: 600,            // NEW - used 18+ times
    mediumSlow: 800,        // NEW - used 12+ times
  },
  easing: {
    // ... existing
    easeOutExpo: 'cubic-bezier(0.22, 1, 0.36, 1)',  // NEW - used 3+ times
  },
}
```

### 1.2 Update `app/globals.css`

**Add CSS variables for new tokens:**

```css
@theme inline {
  /* ... existing */
  --color-cyan-bright-alt-2: #00ffea;
  --color-purple-magenta: #9d4edd;
  --color-purple-light: #d8b4fe;
  --color-background-darkest: #030712;
  --color-background-card-dark: #1A1F2E;
  
  --duration-medium: 600ms;
  --duration-medium-slow: 800ms;
  --ease-out-expo: cubic-bezier(0.22, 1, 0.36, 1);
}
```

---

## Phase 2: Create Standardized Component Patterns (3-5 new files)

### 2.1 Create `components/ui/Button.tsx`

Standardized button component with variants matching existing patterns:

```typescript
// Replace all button patterns with:
<Button variant="primary">Click me</Button>
<Button variant="secondary">Click me</Button>
<Button variant="purple">Click me</Button>
```

### 2.2 Create `components/ui/Card.tsx`

Standardized card component:

```typescript
// Replace all card patterns with:
<Card>Content</Card>
<Card variant="glow">Content</Card>
```

### 2.3 Create `components/ui/Modal.tsx`

Standardized modal wrapper:

```typescript
// Replace all modal patterns with:
<Modal isOpen={isOpen} onClose={onClose}>Content</Modal>
```

### 2.4 Update `lib/design-system/tailwind-helpers.ts`

**Add new pattern constants:**

```typescript
export const patterns = {
  // ... existing
  buttonPrimary: '...',  // Update with exact patterns found
  buttonSecondary: '...',
  buttonPurple: '...',
  card: '...',
  cardGlow: '...',
  modal: '...',
}
```

---

## Phase 3: Migrate High-Impact Components

### 3.1 Priority 1: Dashboard (Estimated: 2-3 hours)

**File:** `app/dashboard/page.tsx`
- **Hard-coded colors:** 45+ instances
- **Inline animations:** 12+ instances
- **Actions:**
  1. Replace all `#00d9ff` with `colors.cyan.bright` / `var(--color-cyan-bright)`
  2. Replace all `#00ffea` with `colors.cyan.brightAlt2` / `var(--color-cyan-bright-alt-2)`
  3. Replace inline animations with variants from `animations.ts`
  4. Replace button patterns with `<Button>` component
  5. Replace card patterns with `<Card>` component

### 3.2 Priority 2: Landing Page (Estimated: 2-3 hours)

**File:** `app/page.tsx`
- **Hard-coded colors:** 38+ instances
- **Inline animations:** 25+ instances
- **Actions:**
  1. Same as Priority 1
  2. Use `fadeIn`, `slideUp` variants
  3. Use `staggerContainer` for list animations

### 3.3 Priority 3: Personality Selector (Estimated: 1-2 hours)

**File:** `components/PersonalitySelector.tsx`
- **Hard-coded colors:** 18+ instances
- **Actions:**
  1. Replace color values
  2. Standardize hover effects

### 3.4 Priority 4: Call Summary (Estimated: 1-2 hours)

**File:** `components/CallSummaryClient.tsx`
- **Hard-coded colors:** 15+ instances
- **Inline animations:** 18+ instances
- **Actions:**
  1. Replace colors
  2. Use animation variants

### 3.5 Priority 5: Plans Page (Estimated: 1 hour)

**File:** `app/plans/page.tsx`
- **Hard-coded colors:** 22+ instances
- **Actions:**
  1. Replace button patterns
  2. Replace colors

---

## Phase 4: Migrate Remaining Components (Estimated: 4-6 hours)

### 4.1 Medium Priority

| File | Hard-coded Colors | Actions |
|------|-------------------|---------|
| `app/call/[agentId]/page.tsx` | 12+ | Replace colors, standardize status indicators |
| `components/ProfileDropdownModal.tsx` | 8+ | Replace modal patterns |
| `components/BuyTokensButton.tsx` | 6+ | Standardize button |
| `app/settings/privacy/page.tsx` | 8+ | Replace toggle patterns |
| `components/CallComparison.tsx` | 6+ | Replace card patterns |

### 4.2 Low Priority

All other components with 1-5 hard-coded values:
- `components/OnboardingModal.tsx`
- `components/QuickPracticeModal.tsx`
- `components/ObjectionLibraryModal.tsx`
- `components/AchievementBadges.tsx`
- `components/CallHistoryWithComparison.tsx`
- Various other components

---

## Phase 5: Create Find/Replace Operations

### 5.1 Color Replacements

```bash
# These should be done with careful review to ensure correctness

# Pattern 1: Replace hex in className with CSS variable
bg-[#00d9ff] → bg-[var(--color-cyan-bright)]
# OR better: bg-cyan-bright (if Tailwind class exists)

# Pattern 2: Replace hex in style prop
style={{ color: '#00d9ff' }} → style={{ color: colors.cyan.bright }}

# Pattern 3: Replace rgba with opacity utility
rgba(0, 217, 255, 0.4) → var(--color-cyan-glow)
# OR: withOpacity(colors.cyan.bright, 0.4)
```

### 5.2 Animation Replacements

```typescript
// Before:
transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}

// After:
transition={transitions.normal}
```

```typescript
// Before:
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.3 }}

// After:
variants={fadeIn}
initial="initial"
animate="animate"
```

---

## Phase 6: Update Z-Index Usage

### 6.1 Replace Hard-coded Z-Index Values

| Current | Should Use | Files |
|---------|-----------|-------|
| `z-10` | `z-dropdown` or `zIndex.dropdown` | 5+ files |
| `z-40` | `z-modalBackdrop` or `zIndex.modalBackdrop` | 3+ files |
| `z-50` | `z-modal` or `zIndex.modal` | 15+ files |
| `z-[100]` | `z-max` or `zIndex.max` | 1 file |
| `z-[200]` | Update `zIndex.toast` to 200 OR use `zIndex.max` | 1 file |

**Action:** Update `zIndex.toast` to 200 in tokens, or create `zIndex.overlay` for values > 100.

---

## Phase 7: Shadow Standardization

### 7.1 Replace Inline Shadows

```typescript
// Before:
className="shadow-[0_0_40px_rgba(0,217,255,0.6)]"

// After:
style={{ boxShadow: shadows.glowCyanStrong }}
// OR: Add Tailwind class if possible
className="shadow-glow-cyan-strong"
```

---

## Migration Strategy

### Step-by-Step Process

1. **Add missing tokens** (Phase 1)
   - Files: `lib/design-system/tokens.ts`, `app/globals.css`
   - Risk: Low
   - Time: 30 minutes

2. **Create component patterns** (Phase 2)
   - Files: New `components/ui/*.tsx` files
   - Risk: Low (backward compatible)
   - Time: 2-3 hours

3. **Migrate one high-priority file** (Phase 3 - start with dashboard)
   - File: `app/dashboard/page.tsx`
   - Risk: Medium (high visibility)
   - Time: 2-3 hours
   - **Validate visually before proceeding**

4. **Continue with other high-priority files** (Phase 3)
   - Files: `app/page.tsx`, `components/PersonalitySelector.tsx`, etc.
   - Risk: Medium
   - Time: 6-8 hours total

5. **Batch migrate remaining files** (Phase 4)
   - Risk: Low (fewer instances per file)
   - Time: 4-6 hours

6. **Cleanup and validation** (Phase 5-7)
   - Run visual regression tests
   - Fix any issues
   - Time: 2-3 hours

---

## Estimated Timeline

| Phase | Files | Time Estimate | Risk Level |
|-------|-------|---------------|------------|
| Phase 1: Add Tokens | 2 | 30 min | Low |
| Phase 2: Component Patterns | 3-5 | 2-3 hours | Low |
| Phase 3: High-Priority | 5 | 8-10 hours | Medium |
| Phase 4: Remaining | 20-30 | 4-6 hours | Low |
| Phase 5-7: Cleanup | All | 2-3 hours | Low |
| **Total** | **30-40** | **16-22 hours** | **Medium** |

---

## Risk Mitigation

### Before Starting

1. ✅ **Take screenshots** of all pages/components
2. ✅ **Commit current state** to git (new branch)
3. ✅ **Run visual regression tests** (if available)

### During Migration

1. **Migrate one file at a time**
2. **Test visually** after each file
3. **Commit after each successful migration**
4. **Review diffs** to ensure no logic changes

### After Migration

1. ✅ **Run full visual regression suite**
2. ✅ **Check all pages manually**
3. ✅ **Verify animations still work**
4. ✅ **Test responsive behavior**

---

## Success Criteria

- ✅ Zero hard-coded hex colors in components
- ✅ Zero inline animation definitions (all use variants)
- ✅ All buttons use `<Button>` component
- ✅ All cards use `<Card>` component
- ✅ All modals use `<Modal>` component
- ✅ Visual regression tests show 0% difference
- ✅ All existing tests pass
- ✅ Bundle size has not increased significantly

---

## Files That Will Be Modified

### Design System Files (Additions Only)
- `lib/design-system/tokens.ts` - Add missing tokens
- `app/globals.css` - Add CSS variables

### New Component Files
- `components/ui/Button.tsx`
- `components/ui/Card.tsx`
- `components/ui/Modal.tsx`

### Files to Migrate (30-40 files)

**High Priority (5 files):**
1. `app/dashboard/page.tsx`
2. `app/page.tsx`
3. `components/PersonalitySelector.tsx`
4. `components/CallSummaryClient.tsx`
5. `app/plans/page.tsx`

**Medium Priority (10 files):**
6. `app/call/[agentId]/page.tsx`
7. `components/ProfileDropdownModal.tsx`
8. `components/BuyTokensButton.tsx`
9. `app/settings/privacy/page.tsx`
10. `components/CallComparison.tsx`
11. `components/OnboardingModal.tsx`
12. `components/QuickPracticeModal.tsx`
13. `components/ObjectionLibraryModal.tsx`
14. `components/AchievementBadges.tsx`
15. `components/CallHistoryWithComparison.tsx`

**Low Priority (15-25 files):**
- Remaining components with < 5 hard-coded values

---

**Ready to proceed?** Start with Phase 1 (adding missing tokens), then Phase 2 (component patterns), then begin migrating files one at a time.
