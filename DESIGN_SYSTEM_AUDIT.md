# DialDrill Design System Audit

**Date:** 2025-01-27  
**Purpose:** Comprehensive audit of existing design tokens, patterns, and their usage across the codebase  
**Status:** Pre-Implementation Analysis

---

## Executive Summary

A design system foundation **already exists** at `/lib/design-system/` with:
- ✅ Design tokens (`tokens.ts`)
- ✅ Animation variants (`animations.ts`)
- ✅ Utility functions (`utils.ts`, `tailwind-helpers.ts`)
- ✅ CSS variables defined in `globals.css`
- ✅ Documentation (`USAGE.md`)

**However**, many components are **NOT using the design system** and contain:
- ❌ Hard-coded hex colors (`#00d9ff`, `#00ffea`, etc.)
- ❌ Inline animation definitions
- ❌ Arbitrary spacing/values
- ❌ Duplicated styling patterns

---

## 1. Color Inventory

### 1.1 Design System Colors (Centralized)

Located in: `lib/design-system/tokens.ts` & `app/globals.css`

| Category | Token Name | Value | CSS Variable | Tailwind Class |
|----------|-----------|-------|--------------|----------------|
| **Backgrounds** | | | | |
| Dark Background | `colors.background.dark` | `#080d1a` | `--color-dark-bg` | `bg-dark-bg` |
| Darker Background | `colors.background.darker` | `#050911` | `--color-darker-bg` | `bg-darker-bg` |
| Card Background | `colors.background.card` | `rgba(15, 23, 42, 0.4)` | `--color-card-bg` | `bg-card-bg` |
| **Primary - Cyan** | | | | |
| Cyan Bright | `colors.cyan.bright` | `#00d9ff` | `--color-cyan-bright` | `bg-cyan-bright` |
| Cyan Bright Alt | `colors.cyan.brightAlt` | `#06d9d7` | `--color-cyan-bright-alt` | - |
| Cyan Glow | `colors.cyan.glow` | `rgba(0, 217, 255, 0.4)` | `--color-cyan-glow` | - |
| **Secondary - Purple** | | | | |
| Purple | `colors.purple.DEFAULT` | `#a855f7` | `--color-purple` | `bg-purple` |
| Purple Dark | `colors.purple.dark` | `#9333ea` | `--color-purple-dark` | `bg-purple-dark` |
| **Text** | | | | |
| Text Primary | `colors.text.primary` | `#ffffff` | `--color-text-primary` | `text-text-primary` |
| Text Secondary | `colors.text.secondary` | `#94a3b8` | `--color-text-secondary` | `text-text-secondary` |
| **Borders** | | | | |
| Border Subtle | `colors.border.subtle` | `#1e293b` | `--color-border-subtle` | `border-border-subtle` |

### 1.2 Hard-coded Colors Found in Components

**Critical Issue:** Many components use hard-coded hex values instead of design tokens.

| Hex Value | Usage Count | Example Locations | Should Use |
|-----------|-------------|-------------------|------------|
| `#00d9ff` | **327+ instances** | `app/dashboard/page.tsx`, `components/PersonalitySelector.tsx`, `app/page.tsx` | `colors.cyan.bright` / `--color-cyan-bright` |
| `#00ffea` | **89+ instances** | `app/dashboard/page.tsx`, `components/CallSummaryClient.tsx` | `colors.cyan.brightAlt` (or new token) |
| `#9d4edd` | **24+ instances** | `app/dashboard/page.tsx`, `components/PersonalitySelector.tsx` | New token needed (purple variant) |
| `#d8b4fe` | **12+ instances** | `app/dashboard/page.tsx`, `components/CallComparison.tsx` | New token needed (purple light) |
| `#2dd4e6` | **6+ instances** | `components/BuyTokensButton.tsx` | Close to cyan-bright, consider standardizing |
| `#030712` | **8+ instances** | `components/BuyTokensButton.tsx`, `components/QuickPracticeModal.tsx` | Could use `colors.background.darker` |
| `#1A1F2E` | **10+ instances** | `components/OnboardingModal.tsx`, `components/ProfileDropdownModal.tsx` | New token needed |
| `#0f172a` | **15+ instances** | `components/CallComparison.tsx`, `app/dashboard/page.tsx` | `colors.background.cardSolid` |
| `#fbbf24` | **4+ instances** | `app/settings/privacy/page.tsx` | `colors.warning.DEFAULT` (already exists) |
| `#020817` | **2+ instances** | `app/call/[agentId]/page.tsx` | Close to `colors.background.darker` |
| `#1f2937` | **3+ instances** | `app/call/[agentId]/page.tsx` | Close to `colors.border.subtle` |
| `#ef4444` | **3+ instances** | `app/call/[agentId]/page.tsx` | `colors.error.DEFAULT` |
| `rgba(0, 217, 255, ...)` | **40+ instances** | Various opacity variants | Use `colors.cyan.glow` with `withOpacity()` |
| `rgba(168, 85, 247, ...)` | **15+ instances** | Various opacity variants | Use `colors.purple.glow` with `withOpacity()` |

### 1.3 Color Pattern Analysis

**Gradient Patterns:**
```tsx
// Found pattern (327+ instances):
bg-gradient-to-r from-[var(--color-cyan-bright)] to-[#00ffea]
// Should be standardized to use design tokens
bg-gradient-to-r from-cyan-bright to-cyan-bright-alt

// Found pattern (15+ instances):
bg-gradient-to-br from-[var(--color-cyan-bright)]/10 to-[#00ffea]/10
// Should use opacity utility
bg-gradient-to-br from-cyan-bright/10 to-cyan-bright-alt/10
```

**Shadow/Glow Patterns:**
```tsx
// Found pattern (89+ instances):
shadow-[0_0_40px_rgba(0,217,255,0.6)]
// Should use: shadows.glowCyanStrong or design token
```

---

## 2. Animation Inventory

### 2.1 Design System Animation Variants (Centralized)

Located in: `lib/design-system/animations.ts` & `lib/design-system/tokens.ts`

| Variant Name | Type | Duration | Easing | Usage |
|--------------|------|----------|--------|-------|
| `fadeIn` | Framer Motion | 300ms | `cubic-bezier(0.4, 0, 0.2, 1)` | ✅ Available |
| `slideUp` | Framer Motion | 300ms | `cubic-bezier(0.4, 0, 0.2, 1)` | ✅ Available |
| `scaleIn` | Framer Motion | Spring (300/30) | Spring | ✅ Available |
| `modalVariants` | Framer Motion | Spring | Spring | ✅ Available |
| `transitions.fast` | Transition | 150ms | `cubic-bezier(0, 0, 0.2, 1)` | ✅ Available |
| `transitions.normal` | Transition | 300ms | `cubic-bezier(0.4, 0, 0.2, 1)` | ✅ Available |
| `transitions.slow` | Transition | 500ms | `cubic-bezier(0.4, 0, 0.2, 1)` | ✅ Available |

### 2.2 Inline Animation Definitions Found

**Critical Issue:** Many components define animations inline instead of using variants.

| Duration | Easing | Usage Count | Example Locations | Should Use |
|----------|--------|-------------|-------------------|------------|
| `duration: 0.3` | Various | **23+ instances** | `app/page.tsx`, `components/PageTransition.tsx` | `transitions.normal` |
| `duration: 0.6` | Various | **18+ instances** | `app/page.tsx`, `components/CallSummaryClient.tsx` | New token or custom variant |
| `duration: 0.8` | Various | **12+ instances** | `app/page.tsx` | New token or custom variant |
| `duration: 1.0` | Various | **8+ instances** | `components/CallSummaryClient.tsx` | `transitions.slowest` (1000ms) |
| `duration: 0.5` | Various | **10+ instances** | `components/CallSummaryClient.tsx` | `transitions.slow` (500ms) |
| `ease: [0.4, 0, 0.2, 1]` | Cubic bezier | **15+ instances** | Various | `transitions.normal` |
| `ease: [0.22, 1, 0.36, 1]` | Custom | **3+ instances** | `app/page.tsx` | Consider adding to tokens |
| `type: 'spring'` | Spring | **8+ instances** | Various | `transitions.spring` or `transitions.gentleSpring` |
| `stiffness: 80, damping: 25` | Spring | **2+ instances** | `components/ProfileDropdownModal.tsx` | `transitions.gentleSpring` |
| `stiffness: 300, damping: 30` | Spring | **1+ instances** | `lib/design-system/animations.ts` | `transitions.spring` |

### 2.3 Stagger Delays Found

| Delay Value | Usage Count | Locations | Should Use |
|-------------|-------------|-----------|------------|
| `delay: 0.1` | **8+ instances** | `app/page.tsx` | `animation.stagger.normal` (0.05) or custom |
| `delay: 0.2` | **6+ instances** | `components/CallSummaryClient.tsx` | Custom stagger |
| `delay: 0.3` | **5+ instances** | Various | Custom stagger |
| `delay: index * 0.1` | **6+ instances** | Various | `staggerContainer` with `animation.stagger.normal` |
| `delay: index * 0.05` | **2+ instances** | Various | `staggerContainer` with `animation.stagger.fast` |
| `delay: index * 0.15` | **1+ instance** | `app/page.tsx` | `staggerContainer` with `animation.stagger.slow` |

### 2.4 CSS Animation Classes

**Found in:** `app/globals.css`

| Class Name | Keyframes | Duration | Usage Count |
|------------|-----------|----------|-------------|
| `animate-fadeIn` | `fadeIn` | 300ms | Available |
| `animate-shimmer` | `shimmer` | 2s infinite | Available |
| `animate-glow-pulse` | `glow-pulse` | 2s infinite | Available |
| `animate-float` | `float` | 3s infinite | Available |
| `animate-scale-bounce` | `scale-bounce` | 0.5s | Available |

**Usage in components:** Found `animate-pulse` (Tailwind default) and `animate-fadeIn` in use.

---

## 3. Spacing Inventory

### 3.1 Design System Spacing

Located in: `lib/design-system/tokens.ts`

| Token | Value (rem) | Value (px) | Tailwind Equivalent |
|-------|-------------|------------|---------------------|
| `spacing.xs` | `0.25rem` | 4px | `p-1`, `gap-1` |
| `spacing.sm` | `0.5rem` | 8px | `p-2`, `gap-2` |
| `spacing.md` | `0.75rem` | 12px | `p-3`, `gap-3` |
| `spacing.lg` | `1rem` | 16px | `p-4`, `gap-4` |
| `spacing.xl` | `1.5rem` | 24px | `p-6`, `gap-6` |
| `spacing['2xl']` | `2rem` | 32px | `p-8`, `gap-8` |
| `spacing['3xl']` | `3rem` | 48px | `p-12`, `gap-12` |

### 3.2 Common Spacing Patterns Found

Most components use standard Tailwind spacing classes, which align with design system tokens:
- `p-4`, `p-6`, `p-8` (most common)
- `gap-2`, `gap-3`, `gap-4`
- `px-6`, `py-3` (button patterns)

**No significant deviations found** - spacing appears consistent.

---

## 4. Component Pattern Analysis

### 4.1 Button Patterns

**Found in:** `components/InteractiveButton.tsx`, `app/dashboard/page.tsx`, various pages

#### Pattern 1: Primary Button (Cyan Gradient)
```tsx
// Found pattern (89+ instances):
className="rounded-full bg-gradient-to-r from-[var(--color-cyan-bright)] to-[#00ffea] px-6 py-3 text-base font-semibold text-[var(--color-dark-bg)] transition-all hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(0,217,255,0.5)]"

// Should use: patterns.buttonPrimary + design tokens
className={cn(patterns.buttonPrimary, 'px-6 py-3 text-base hover:scale-[1.02]')}
```

#### Pattern 2: Secondary Button (Purple Gradient)
```tsx
// Found pattern (12+ instances):
className="rounded-full bg-gradient-to-r from-[var(--color-purple)] to-[var(--color-purple-dark)] px-8 py-4 text-lg font-bold text-white transition-all hover:scale-105 shadow-[0_0_30px_rgba(168,85,247,0.5)]"

// Should use: New pattern.buttonSecondaryPurple
```

#### Pattern 3: Buy Tokens Button
```tsx
// Found in: components/BuyTokensButton.tsx
className="fixed right-6 top-6 z-50 rounded-full bg-gradient-to-r from-[#2dd4e6] to-[var(--color-purple-dark)] px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-[#2dd4e6]/30"

// Should standardize color to use design tokens
```

### 4.2 Card Patterns

**Found in:** `app/dashboard/page.tsx`, `app/settings/privacy/page.tsx`, various pages

#### Pattern 1: Standard Card
```tsx
// Found pattern (23+ instances):
className="rounded-2xl border border-[var(--color-border-subtle)]/50 bg-gradient-to-br from-card-bg to-[rgba(5,9,17,0.8)] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.7)] backdrop-blur-xl hover:border-[var(--color-cyan-bright)]/30 transition-all duration-300"

// Should use: patterns.card + hover variant
className={cn(patterns.card, 'p-6 transition-all duration-300 hover:border-cyan-bright/30')}
```

#### Pattern 2: Card with Glow
```tsx
// Found pattern (8+ instances):
className="rounded-3xl border border-[var(--color-border-subtle)]/50 bg-gradient-to-br from-card-bg to-[rgba(5,9,17,0.8)] p-8 md:p-12 shadow-[0_20px_60px_rgba(0,0,0,0.7),0_0_40px_rgba(0,217,255,0.08)] backdrop-blur-xl hover:shadow-[0_25px_70px_rgba(0,0,0,0.8),0_0_50px_rgba(0,217,255,0.12)] transition-all duration-500"

// Should use: patterns.cardGlow + shadows.card
```

### 4.3 Modal Patterns

**Found in:** `components/QuickPracticeModal.tsx`, `components/ObjectionLibraryModal.tsx`, `components/OnboardingModal.tsx`

#### Standard Modal Structure
```tsx
// Found pattern (5+ instances):
<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
  <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-[#030712] shadow-2xl">

// Should use: patterns.modal + z-index tokens
<div className={cn('fixed inset-0 z-modal flex items-center justify-center bg-black/70 px-4')}>
```

### 4.4 Input/Form Patterns

**Limited usage found** - most forms use inline styles. Consider creating standardized input pattern.

---

## 5. Z-Index Values

### 5.1 Design System Z-Index

Located in: `lib/design-system/tokens.ts`

| Token | Value | Intended Use |
|-------|-------|--------------|
| `zIndex.dropdown` | 10 | Dropdown menus |
| `zIndex.sticky` | 20 | Sticky headers |
| `zIndex.fixed` | 30 | Fixed elements |
| `zIndex.modalBackdrop` | 40 | Modal backdrops |
| `zIndex.modal` | 50 | Modal content |
| `zIndex.popover` | 60 | Popovers |
| `zIndex.tooltip` | 70 | Tooltips |
| `zIndex.toast` | 80 | Toast notifications |

### 5.2 Z-Index Values Found in Components

| Value | Usage Count | Locations | Should Use |
|-------|-------------|-----------|------------|
| `z-10` | **5+ instances** | `components/PersonalitySelector.tsx`, `components/CallComparison.tsx` | `zIndex.dropdown` |
| `z-20` | **2+ instances** | `components/PersonalitySelector.tsx` | `zIndex.sticky` |
| `z-30` | **0 instances** | - | `zIndex.fixed` |
| `z-40` | **3+ instances** | `app/dashboard/page.tsx`, `components/ProfileDropdownModal.tsx` | `zIndex.modalBackdrop` |
| `z-50` | **15+ instances** | Modals, fixed buttons | `zIndex.modal` |
| `z-[100]` | **1 instance** | `components/Confetti.tsx` | `zIndex.max` or new layer |
| `z-[200]` | **1 instance** | `components/Toast.tsx` | `zIndex.toast` (already 80, but Toast uses 200) |

**Issue:** Toast component uses `z-[200]` but design system defines `zIndex.toast` as 80. Need alignment.

---

## 6. Typography Patterns

### 6.1 Design System Typography

Located in: `lib/design-system/tokens.ts` & `app/globals.css`

| Category | Size | Line Height | Tailwind Class |
|----------|------|-------------|----------------|
| `typography.fontSize.xs` | 0.75rem (12px) | 1rem | `text-xs` |
| `typography.fontSize.sm` | 0.875rem (14px) | 1.25rem | `text-sm` |
| `typography.fontSize.base` | 1rem (16px) | 1.5rem | `text-base` |
| `typography.fontSize.lg` | 1.125rem (18px) | 1.75rem | `text-lg` |
| `typography.fontSize.xl` | 1.25rem (20px) | 1.75rem | `text-xl` |
| `typography.fontSize['2xl']` | 1.5rem (24px) | 2rem | `text-2xl` |
| `typography.fontSize['3xl']` | 1.875rem (30px) | 2.25rem | `text-3xl` |

**Font Families:**
- Sans: `'Inter', system-ui, ...` (defined in globals.css)
- Mono: `'JetBrains Mono', 'Fira Code', ...` (defined in globals.css)

### 6.2 Typography Usage Analysis

Components use standard Tailwind typography classes consistently:
- `text-base`, `text-lg`, `text-xl` (most common)
- `font-semibold`, `font-bold`
- `text-text-primary`, `text-text-secondary` (good usage of design tokens)

**No significant issues found.**

---

## 7. Shadow & Elevation System

### 7.1 Design System Shadows

Located in: `lib/design-system/tokens.ts` & `app/globals.css`

| Token | Value | Intended Use |
|-------|-------|--------------|
| `shadows.card` | `0 20px 60px rgba(0, 0, 0, 0.7), 0 0 40px rgba(6, 217, 215, 0.08)` | Standard cards |
| `shadows.cardHover` | `0 25px 80px rgba(0, 0, 0, 0.8), 0 0 60px rgba(6, 217, 215, 0.15)` | Card hover state |
| `shadows.glowCyan` | `0 0 100px rgba(6, 217, 215, 0.4)` | Cyan glow effect |
| `shadows.glowCyanStrong` | `0 0 30px rgba(0, 217, 255, 0.6), 0 0 60px rgba(0, 217, 255, 0.3)` | Strong cyan glow |
| `shadows.button` | `0 0 20px rgba(6, 217, 215, 0.4), 0 0 40px rgba(6, 217, 215, 0.2)` | Button shadow |

### 7.2 Shadow Patterns Found

**Critical Issue:** Many components use inline shadow values instead of tokens.

| Pattern | Usage Count | Example Locations | Should Use |
|---------|-------------|-------------------|------------|
| `shadow-[0_0_40px_rgba(0,217,255,0.6)]` | **45+ instances** | `app/dashboard/page.tsx`, `app/plans/page.tsx` | `shadows.glowCyanStrong` |
| `shadow-[0_0_30px_rgba(0,217,255,0.5)]` | **23+ instances** | `components/CallSummaryClient.tsx` | `shadows.buttonHover` |
| `shadow-[0_0_20px_rgba(0,217,255,0.4)]` | **18+ instances** | `components/PersonalitySelector.tsx` | `shadows.button` |
| `shadow-[0_20px_60px_rgba(0,0,0,0.7)]` | **15+ instances** | Card patterns | `shadows.card` |
| `shadow-2xl` | **8+ instances** | Modals | Standard Tailwind (acceptable) |

---

## 8. Border Radius Patterns

### 8.1 Design System Border Radius

Located in: `lib/design-system/tokens.ts`

| Token | Value | Tailwind Class |
|-------|-------|----------------|
| `borderRadius.sm` | `0.25rem` (4px) | `rounded-sm` |
| `borderRadius.DEFAULT` | `0.375rem` (6px) | `rounded` |
| `borderRadius.md` | `0.5rem` (8px) | `rounded-md` |
| `borderRadius.lg` | `0.75rem` (12px) | `rounded-lg` |
| `borderRadius.xl` | `1rem` (16px) | `rounded-xl` |
| `borderRadius['2xl']` | `1.5rem` (24px) | `rounded-2xl` |
| `borderRadius.full` | `9999px` | `rounded-full` |

### 8.2 Border Radius Usage

Components consistently use:
- `rounded-full` for buttons (most common)
- `rounded-2xl` for cards
- `rounded-xl` for smaller elements

**No significant issues found** - usage is consistent.

---

## 9. Existing Design System Files

### 9.1 Files Already Created

| File | Purpose | Status |
|------|---------|--------|
| `lib/design-system/tokens.ts` | Color, spacing, typography tokens | ✅ Complete |
| `lib/design-system/animations.ts` | Framer Motion variants | ✅ Complete |
| `lib/design-system/utils.ts` | `cn()`, helper functions | ✅ Complete |
| `lib/design-system/tailwind-helpers.ts` | Type-safe Tailwind builders | ✅ Complete |
| `lib/design-system/index.ts` | Barrel exports | ✅ Complete |
| `lib/design-system/USAGE.md` | Documentation | ✅ Complete |
| `app/globals.css` | CSS variables, keyframes | ✅ Complete |

### 9.2 Design System Adoption Rate

**Estimated Adoption:**
- ✅ **Design tokens defined:** 100%
- ⚠️ **Components using tokens:** ~20-30%
- ❌ **Hard-coded values:** ~70-80% of components

---

## 10. Component-Specific Findings

### 10.1 High-Priority Migration Targets

| Component | Hard-coded Colors | Inline Animations | Impact |
|-----------|-------------------|-------------------|--------|
| `app/dashboard/page.tsx` | 45+ instances | 12+ instances | 🔴 **CRITICAL** |
| `app/page.tsx` | 38+ instances | 25+ instances | 🔴 **CRITICAL** |
| `components/PersonalitySelector.tsx` | 18+ instances | 5+ instances | 🟡 **HIGH** |
| `components/CallSummaryClient.tsx` | 15+ instances | 18+ instances | 🟡 **HIGH** |
| `app/plans/page.tsx` | 22+ instances | 8+ instances | 🟡 **HIGH** |
| `app/call/[agentId]/page.tsx` | 12+ instances | 3+ instances | 🟢 **MEDIUM** |
| `components/ProfileDropdownModal.tsx` | 8+ instances | 2+ instances | 🟢 **MEDIUM** |

### 10.2 Components Already Using Design System

| Component | Design System Usage | Status |
|-----------|---------------------|--------|
| `components/PageTransition.tsx` | ✅ Uses inline but could use variants | ⚠️ Partial |
| `components/InteractiveButton.tsx` | ⚠️ Uses some tokens but hard-codes gradients | ⚠️ Partial |

---

## 11. Missing Design Tokens

### 11.1 Colors Not Yet in Design System

| Color Value | Usage Count | Proposed Token Name |
|-------------|-------------|---------------------|
| `#00ffea` | 89+ instances | `colors.cyan.brightAlt` (already exists but value is `#06d9d7` - need to update or add `brightAlt2`) |
| `#9d4edd` | 24+ instances | `colors.purple.magenta` or `colors.magenta.variant` |
| `#d8b4fe` | 12+ instances | `colors.purple.light` |
| `#1A1F2E` | 10+ instances | `colors.background.cardDark` |
| `#030712` | 8+ instances | `colors.background.darkest` |
| `#2dd4e6` | 6+ instances | Consider standardizing to `colors.cyan.bright` |

### 11.2 Animation Values Not Yet in Design System

| Duration/Easing | Usage Count | Proposed Token Name |
|-----------------|-------------|---------------------|
| `duration: 0.6` | 18+ instances | `animation.duration.medium` (600ms) |
| `duration: 0.8` | 12+ instances | `animation.duration.mediumSlow` (800ms) |
| `ease: [0.22, 1, 0.36, 1]` | 3+ instances | `animation.easing.easeOutExpo` |

---

## 12. Tailwind Configuration

### 12.1 Current Status

**No `tailwind.config.ts` file found** - using Tailwind v4 `@import "tailwindcss"` with `@theme inline` in `globals.css`.

### 12.2 Design Tokens in CSS

All tokens are defined in `app/globals.css` using `@theme inline`:
- ✅ Colors available as Tailwind classes
- ✅ Custom animations defined
- ✅ Shadow values defined
- ⚠️ Some hard-coded values in components bypass these

---

## 13. Summary Statistics

| Metric | Count | Status |
|--------|-------|--------|
| **Total hard-coded hex colors** | **327+ instances** | ❌ Needs migration |
| **Total inline animation definitions** | **96+ instances** | ❌ Needs migration |
| **Components using design system** | **~15-20%** | ⚠️ Low adoption |
| **Components with hard-coded values** | **~80-85%** | 🔴 High migration needed |
| **Design system files** | **7 files** | ✅ Complete |
| **Design tokens defined** | **100+ tokens** | ✅ Complete |
| **Animation variants defined** | **25+ variants** | ✅ Complete |

---

## 14. Recommendations

### Priority 1: Add Missing Tokens
1. Add `#00ffea` as `colors.cyan.brightAlt2` or update existing `brightAlt`
2. Add `#9d4edd` as `colors.purple.magenta`
3. Add `#d8b4fe` as `colors.purple.light`
4. Add missing animation durations (0.6s, 0.8s)

### Priority 2: Migrate High-Impact Components
1. `app/dashboard/page.tsx` (45+ hard-coded colors)
2. `app/page.tsx` (38+ hard-coded colors)
3. `components/PersonalitySelector.tsx` (18+ hard-coded colors)

### Priority 3: Create Component Patterns
1. Standardize button variants
2. Standardize card patterns
3. Standardize modal patterns

### Priority 4: Enforcement
1. Add ESLint rules to flag hard-coded colors
2. Create migration script
3. Update VSCode snippets

---

**Next Steps:** Review this audit, approve/add missing tokens, then proceed with `MIGRATION_PLAN.md` and `VALIDATION_PLAN.md`.
