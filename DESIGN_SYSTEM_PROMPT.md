# DialDrill Design System - Complete Reference

Use this document as context when working with the DialDrill codebase. This contains all design tokens, patterns, and conventions.

---

## Tech Stack

- **Framework**: Next.js 16 + React 19 + TypeScript 5
- **Styling**: Tailwind CSS 4.1 (uses `@theme inline` in globals.css)
- **Animations**: Framer Motion 12.23 + CSS keyframes
- **Icons**: Lucide React
- **Class Merging**: clsx + tailwind-merge via `cn()` utility

---

## File Structure

```
lib/design-system/
├── index.ts              # Barrel export
├── tokens.ts             # Color, spacing, typography, shadows, z-index
├── animations.ts         # Framer Motion variants
├── utils.ts              # cn() helper
├── tailwind-helpers.ts   # patterns object, tw helpers
└── USAGE.md

app/globals.css           # CSS variables + @theme inline block
eslint-plugins/design-system.js  # ESLint rules
scripts/migrate-design-tokens.ts # Migration codemod
```

---

## Color Tokens

### Tailwind Classes (use these in className)

```
BACKGROUNDS:
bg-dark-bg          → #080d1a
bg-darker-bg        → #050911
bg-card-bg          → rgba(15, 23, 42, 0.4)
bg-surface          → rgba(15, 23, 42, 0.6)

PRIMARY (Cyan - for CTAs):
bg-cyan-bright      → #00d9ff
text-cyan-bright
border-cyan-bright
bg-cyan-muted       → #0f9b99
bg-cyan-dark        → #0d7a78

SECONDARY (Purple):
bg-purple           → #a855f7
text-purple
border-purple
bg-purple-dark      → #9333ea
bg-magenta          → #d946ef

TEXT:
text-text-primary   → #ffffff
text-text-secondary → #94a3b8
text-text-muted     → #64748b
text-text-disabled  → #475569

BORDERS:
border-border-subtle → #1e293b
border-border-medium → #334155
border-border-strong → #475569

SEMANTIC:
bg-success / text-success → #22c55e
bg-error / text-error     → #ef4444
bg-warning / text-warning → #f59e0b
bg-info / text-info       → #3b82f6

BELT COLORS (gamification):
bg-belt-white   → #f8fafc
bg-belt-yellow  → #facc15
bg-belt-orange  → #f97316
bg-belt-green   → #22c55e
bg-belt-blue    → #3b82f6
bg-belt-purple  → #a855f7
bg-belt-brown   → #92400e
bg-belt-red     → #ef4444
bg-belt-black   → #1e293b
```

### TypeScript Tokens (for dynamic/inline styles)

```typescript
import { colors } from '@/lib/design-system';

colors.cyan.bright      // '#00d9ff'
colors.cyan.muted       // '#0f9b99'
colors.purple.DEFAULT   // '#a855f7'
colors.text.primary     // '#ffffff'
colors.text.secondary   // '#94a3b8'
colors.background.dark  // '#080d1a'
colors.border.subtle    // '#1e293b'
colors.success.DEFAULT  // '#22c55e'
colors.belt.purple      // '#a855f7'
colors.belt.yellow      // '#facc15'
```

---

## Shadows

```
TAILWIND CLASSES:
shadow-card         → Card with subtle cyan glow
shadow-card-hover   → Elevated card shadow
shadow-glow-cyan    → Large cyan glow
shadow-glow-purple  → Large purple glow
shadow-button       → Button glow
shadow-button-hover → Button glow on hover

CSS CLASSES:
.btn-glow           → Cyan button glow + hover state
.btn-glow-purple    → Purple button glow + hover state
.border-glow-cyan   → Border with cyan glow + hover
.border-glow-purple → Border with purple glow + hover
```

---

## Animation Timing Tokens

```css
--duration-instant:  0ms
--duration-fast:     150ms
--duration-normal:   300ms
--duration-slow:     500ms
--duration-slower:   700ms
--duration-slowest:  1000ms

--ease-linear:   linear
--ease-in:       cubic-bezier(0.4, 0, 1, 1)
--ease-out:      cubic-bezier(0, 0, 0.2, 1)
--ease-in-out:   cubic-bezier(0.4, 0, 0.2, 1)
--ease-bounce:   cubic-bezier(0.68, -0.55, 0.265, 1.55)
--ease-spring:   cubic-bezier(0.175, 0.885, 0.32, 1.275)
```

---

## Framer Motion Animation Variants

```typescript
import {
  fadeIn, fadeInDown, fadeInLeft, fadeInRight,
  slideUp, slideDown, slideInLeft, slideInRight,
  scaleIn, popIn, bounce,
  modalVariants, backdropVariants,
  drawerRightVariants, drawerBottomVariants,
  staggerContainer, staggerContainerFast, staggerContainerSlow,
  blurIn, characterReveal,
  shimmer, pulse, spin,
  transitions
} from '@/lib/design-system';

// Usage
<motion.div variants={fadeIn} initial="initial" animate="animate" exit="exit">

// Staggered children
<motion.ul variants={staggerContainer} initial="initial" animate="animate">
  {items.map(item => (
    <motion.li key={item.id} variants={fadeIn}>{item.name}</motion.li>
  ))}
</motion.ul>

// Modal
<AnimatePresence>
  {isOpen && (
    <>
      <motion.div variants={backdropVariants} initial="initial" animate="animate" exit="exit" />
      <motion.div variants={modalVariants} initial="initial" animate="animate" exit="exit">
        {content}
      </motion.div>
    </>
  )}
</AnimatePresence>
```

### Available Variants

| Variant | Description |
|---------|-------------|
| `fade` | Simple opacity 0→1 |
| `fadeIn` | Opacity + translateY(10px→0) |
| `fadeInDown` | Opacity + translateY(-10px→0) |
| `fadeInLeft` | Opacity + translateX(-20px→0) |
| `fadeInRight` | Opacity + translateX(20px→0) |
| `slideUp` | translateY(20px→0) + opacity |
| `slideDown` | translateY(-20px→0) + opacity |
| `slideInLeft` | translateX(-40px→0) + opacity |
| `slideInRight` | translateX(40px→0) + opacity |
| `scaleIn` | scale(0.95→1) + opacity |
| `popIn` | Bouncy scale(0→1) for badges |
| `bounce` | scale [0, 1.2, 1] |
| `modalVariants` | Modal content animation |
| `backdropVariants` | Modal overlay fade |
| `drawerRightVariants` | Drawer from right |
| `drawerBottomVariants` | Drawer from bottom |
| `staggerContainer` | Parent for staggered children (0.05s delay) |
| `staggerContainerFast` | Faster stagger (0.02s) |
| `staggerContainerSlow` | Slower stagger (0.1s) |
| `blurIn` | blur(10px→0) + opacity |
| `shimmer` | Loading shimmer translateX |
| `pulse` | opacity [1, 0.5, 1] infinite |
| `spin` | rotate 360 infinite |

### Transition Presets

```typescript
import { transitions } from '@/lib/design-system';

transitions.fast        // 150ms ease-out
transitions.normal      // 300ms ease-in-out
transitions.slow        // 500ms ease-in-out
transitions.spring      // spring stiffness:300 damping:30
transitions.gentleSpring // spring stiffness:80 damping:25
transitions.bouncySpring // spring stiffness:400 damping:10
```

---

## CSS Animation Classes

```
.animate-shimmer        → Horizontal shimmer (2s infinite)
.animate-fadeIn         → Fade in from below (300ms)
.animate-fadeInDown     → Fade in from above (300ms)
.animate-slideInLeft    → Slide from left (300ms)
.animate-slideInRight   → Slide from right (300ms)
.animate-glow-pulse     → Pulsing cyan glow (2s infinite)
.animate-shimmer-slide  → Background shimmer (2s infinite)
.animate-glitch-flicker → Opacity flicker (0.5s)
.animate-float          → Vertical float (3s infinite)
.animate-scale-bounce   → Scale bounce (0.5s)
```

---

## UI Patterns (Pre-built class combinations)

```typescript
import { patterns, cn } from '@/lib/design-system';

// Card
<div className={cn(patterns.card, 'p-6')}>
// → rounded-2xl border border-border-subtle/50 bg-gradient-to-br from-card-bg to-darker-bg

// Card with glow
<div className={cn(patterns.cardGlow, 'p-6')}>
// → + cyan border glow + shadow-card

// Primary button (cyan)
<button className={patterns.buttonPrimary}>
// → bg-gradient-to-r from-cyan-bright to-cyan-muted text-dark-bg font-semibold rounded-xl px-6 py-3

// Secondary button (outline)
<button className={patterns.buttonSecondary}>
// → border border-border-subtle bg-transparent text-text-primary rounded-xl px-6 py-3

// Ghost button
<button className={patterns.buttonGhost}>
// → bg-transparent text-text-secondary hover:text-text-primary

// Input field
<input className={patterns.input} />
// → bg-darker-bg border border-border-subtle rounded-xl px-4 py-3 focus:border-cyan-bright/50

// Badges
<span className={patterns.badgeCyan}>New</span>
<span className={patterns.badgePurple}>Pro</span>
<span className={patterns.badgeSuccess}>Active</span>

// Section container
<section className={patterns.section}>
// → max-w-7xl mx-auto px-4 sm:px-6 lg:px-8

// Glass morphism
<div className={patterns.glass}>
// → backdrop-blur-xl bg-white/5 border border-white/10

// Text gradients
<span className={patterns.textGradientCyan}>Gradient</span>
// → bg-gradient-to-r from-cyan-bright to-cyan-muted bg-clip-text text-transparent

<span className={patterns.textGradientPurple}>Gradient</span>
// → bg-gradient-to-r from-purple to-magenta bg-clip-text text-transparent

// Focus ring
<button className={cn('...', patterns.focusRing)}>
// → focus:outline-none focus:ring-2 focus:ring-cyan-bright/50 focus:ring-offset-2

// Transitions
<div className={patterns.transitionFast}>   // 150ms
<div className={patterns.transitionNormal}> // 300ms
<div className={patterns.transitionSlow}>   // 500ms
```

---

## cn() Utility

Merges Tailwind classes with conditional logic:

```typescript
import { cn } from '@/lib/design-system';

<div className={cn(
  'base-classes here',
  isActive && 'bg-cyan-bright text-dark-bg',
  !isActive && 'bg-transparent text-text-secondary',
  className // from props
)} />
```

---

## Spacing Scale

```typescript
import { spacing, spacingPx } from '@/lib/design-system';

spacing.xs   // '0.25rem' (4px)
spacing.sm   // '0.5rem'  (8px)
spacing.md   // '0.75rem' (12px)
spacing.lg   // '1rem'    (16px)
spacing.xl   // '1.5rem'  (24px)
spacing['2xl'] // '2rem'  (32px)
spacing['3xl'] // '3rem'  (48px)
spacing['4xl'] // '4rem'  (64px)
spacing['5xl'] // '6rem'  (96px)

// Numeric values for calculations
spacingPx.lg // 16
```

---

## Z-Index Scale

```typescript
import { zIndex } from '@/lib/design-system';

zIndex.behind        // -1
zIndex.base          // 0
zIndex.dropdown      // 10
zIndex.sticky        // 20
zIndex.fixed         // 30
zIndex.modalBackdrop // 40
zIndex.modal         // 50
zIndex.popover       // 60
zIndex.tooltip       // 70
zIndex.toast         // 80
zIndex.max           // 9999
```

---

## Breakpoints

```typescript
import { breakpoints, breakpointsPx } from '@/lib/design-system';

breakpoints.sm  // '640px'
breakpoints.md  // '768px'
breakpoints.lg  // '1024px'
breakpoints.xl  // '1280px'
breakpoints['2xl'] // '1536px'
```

---

## Common Component Patterns

### Animated Card

```tsx
import { motion } from 'framer-motion';
import { fadeIn, cn, patterns } from '@/lib/design-system';

<motion.div
  variants={fadeIn}
  initial="initial"
  animate="animate"
  className={cn(patterns.card, 'p-6')}
>
  <h3 className="text-lg font-semibold text-text-primary mb-2">Title</h3>
  <p className="text-text-secondary">Description</p>
</motion.div>
```

### Staggered List

```tsx
import { motion } from 'framer-motion';
import { fadeIn, staggerContainer } from '@/lib/design-system';

<motion.ul
  variants={staggerContainer}
  initial="initial"
  animate="animate"
  className="space-y-2"
>
  {items.map(item => (
    <motion.li
      key={item.id}
      variants={fadeIn}
      className="p-4 rounded-lg bg-card-bg border border-border-subtle"
    >
      {item.name}
    </motion.li>
  ))}
</motion.ul>
```

### Modal

```tsx
import { motion, AnimatePresence } from 'framer-motion';
import { modalVariants, backdropVariants, cn, patterns } from '@/lib/design-system';

<AnimatePresence>
  {isOpen && (
    <>
      <motion.div
        variants={backdropVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      <motion.div
        variants={modalVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div className={cn(patterns.card, 'max-w-md w-full p-6')}>
          {children}
        </div>
      </motion.div>
    </>
  )}
</AnimatePresence>
```

### Primary Button with Glow

```tsx
<button className="btn-glow rounded-full bg-gradient-to-r from-cyan-bright to-cyan-muted px-6 py-3 text-dark-bg font-semibold hover:opacity-90 transition-opacity">
  Get Started
</button>
```

### Text with Gradient

```tsx
<h1 className="text-4xl font-bold">
  Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-bright to-cyan-muted">DialDrill</span>
</h1>
```

### Dynamic Belt Color

```tsx
import { colors } from '@/lib/design-system';

<div
  className="w-4 h-4 rounded-full"
  style={{ backgroundColor: colors.belt[userData.currentBelt] }}
/>
```

---

## Don'ts

```tsx
// ❌ Hard-coded hex colors
<div className="bg-[#00d9ff]" />

// ✅ Use theme colors
<div className="bg-cyan-bright" />

// ❌ Inline animation definitions
<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} />

// ✅ Use variants
<motion.div variants={fadeIn} initial="initial" animate="animate" />

// ❌ Arbitrary spacing
<div className="p-[13px]" />

// ✅ Use standard Tailwind spacing
<div className="p-3" />

// ❌ Repeated card styles
<div className="rounded-2xl border border-slate-800/50 bg-gradient-to-br from-slate-900/40 to-slate-950/80 p-6" />

// ✅ Use patterns
<div className={cn(patterns.card, 'p-6')} />
```

---

## Import Cheatsheet

```typescript
// Everything you typically need
import { motion, AnimatePresence } from 'framer-motion';
import {
  colors,
  spacing,
  fadeIn,
  slideUp,
  staggerContainer,
  modalVariants,
  backdropVariants,
  cn,
  patterns
} from '@/lib/design-system';
```
