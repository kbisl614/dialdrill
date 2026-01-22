# DialDrill Design System

A comprehensive, TypeScript-typed design system for consistent UI across the application.

## Quick Start

```tsx
// Import what you need
import { colors, spacing, fadeIn, cn, patterns } from '@/lib/design-system';
```

## File Structure

```
lib/design-system/
├── index.ts              # Main export barrel
├── tokens.ts             # Color, spacing, typography tokens
├── animations.ts         # Framer Motion variants
├── utils.ts              # cn() and helper utilities
├── tailwind-helpers.ts   # Type-safe Tailwind class builders
└── USAGE.md              # This file

eslint-plugins/
└── design-system.js      # ESLint rules for enforcement

scripts/
└── migrate-design-tokens.ts  # Migration codemod

.vscode/
└── design-system.code-snippets  # VSCode snippets
```

---

## 1. Using Colors

### In Tailwind Classes (Recommended)

All colors are available as Tailwind classes:

```tsx
// ✅ Use Tailwind theme colors
<div className="bg-cyan-bright text-text-primary border-border-subtle" />
<div className="bg-purple text-text-secondary" />
<div className="bg-dark-bg border-border-medium" />
```

### For Dynamic Values

When you need dynamic colors (e.g., belt colors from data):

```tsx
import { colors } from '@/lib/design-system';

// ✅ Use tokens for dynamic values
<div style={{ backgroundColor: colors.belt.purple }} />
<div style={{ color: colors.cyan.bright }} />
```

### Available Color Classes

| Category | Classes |
|----------|---------|
| **Backgrounds** | `bg-dark-bg`, `bg-darker-bg`, `bg-card-bg`, `bg-surface` |
| **Cyan (Primary)** | `bg-cyan-bright`, `text-cyan-bright`, `border-cyan-bright` |
| **Purple (Secondary)** | `bg-purple`, `text-purple`, `border-purple` |
| **Text** | `text-text-primary`, `text-text-secondary`, `text-text-muted` |
| **Borders** | `border-border-subtle`, `border-border-medium` |
| **Semantic** | `bg-success`, `bg-error`, `bg-warning`, `text-success`, etc. |
| **Belts** | `bg-belt-white`, `bg-belt-yellow`, `bg-belt-purple`, etc. |

---

## 2. Using Animations

### Framer Motion Variants (Recommended)

```tsx
import { motion } from 'framer-motion';
import { fadeIn, slideUp, staggerContainer } from '@/lib/design-system';

// Simple fade in
<motion.div variants={fadeIn} initial="initial" animate="animate">
  Content
</motion.div>

// Staggered list
<motion.ul variants={staggerContainer} initial="initial" animate="animate">
  {items.map(item => (
    <motion.li key={item.id} variants={fadeIn}>
      {item.name}
    </motion.li>
  ))}
</motion.ul>
```

### Available Animation Variants

| Variant | Use Case |
|---------|----------|
| `fade` | Simple opacity toggle |
| `fadeIn` | Fade in from below |
| `fadeInDown` | Fade in from above |
| `fadeInLeft` / `fadeInRight` | Horizontal fade in |
| `slideUp` / `slideDown` | Vertical slide |
| `slideInLeft` / `slideInRight` | Horizontal slide |
| `scaleIn` | Scale from 0.95 |
| `popIn` | Bouncy scale from 0 (for badges) |
| `bounce` | Bouncy scale animation |
| `modalVariants` | Modal content animation |
| `backdropVariants` | Modal backdrop animation |
| `staggerContainer` | Parent for staggered children |

### CSS Animations

For simple cases, use CSS animation classes:

```tsx
<div className="animate-fadeIn">Fades in</div>
<div className="animate-shimmer">Shimmer effect</div>
<div className="animate-glow-pulse">Pulsing glow</div>
<div className="animate-float">Floating effect</div>
```

---

## 3. Using `cn()` for Conditional Classes

```tsx
import { cn } from '@/lib/design-system';

<button
  className={cn(
    'px-4 py-2 rounded-lg',
    isActive && 'bg-cyan-bright text-dark-bg',
    !isActive && 'bg-transparent text-text-secondary',
    className
  )}
/>
```

---

## 4. Using UI Patterns

Pre-built class combinations for common components:

```tsx
import { cn, patterns } from '@/lib/design-system';

// Card
<div className={cn(patterns.card, 'p-6')}>...</div>

// Card with glow
<div className={cn(patterns.cardGlow, 'p-6')}>...</div>

// Buttons
<button className={patterns.buttonPrimary}>Primary</button>
<button className={patterns.buttonSecondary}>Secondary</button>

// Badges
<span className={patterns.badgeCyan}>New</span>
<span className={patterns.badgePurple}>Pro</span>

// Input
<input className={patterns.input} />

// Text gradients
<span className={patterns.textGradientCyan}>Gradient Text</span>
```

---

## 5. VSCode Snippets

Type these prefixes to get code snippets:

| Prefix | Description |
|--------|-------------|
| `imp-ds` | Import from design system |
| `imp-motion` | Import Framer Motion + animations |
| `m-fade` | Motion div with fadeIn |
| `m-stagger` | Stagger container with children |
| `m-modal` | Complete modal with backdrop |
| `ds-card` | Card component |
| `ds-btn` | Primary button |
| `cn` | cn() utility call |

---

## 6. Migration from Hard-coded Values

### Run the Migration Script

```bash
# Preview changes (dry run)
npx tsx scripts/migrate-design-tokens.ts --dry-run

# Apply changes
npx tsx scripts/migrate-design-tokens.ts

# Migrate specific path
npx tsx scripts/migrate-design-tokens.ts --path components/
```

### What Gets Migrated

```tsx
// Before
className="bg-[#00d9ff] text-[#94a3b8] border-[#1e293b]"

// After
className="bg-[var(--color-cyan-bright)] text-[var(--color-text-secondary)] border-[var(--color-border-subtle)]"
```

---

## 7. ESLint Rules

Add to your `eslint.config.js`:

```js
import designSystemPlugin from './eslint-plugins/design-system.js';

export default [
  {
    plugins: { 'design-system': designSystemPlugin },
    rules: {
      'design-system/no-hardcoded-colors': 'warn',
      'design-system/no-arbitrary-spacing': 'off',
      'design-system/prefer-design-patterns': 'off',
    }
  }
];
```

### Available Rules

| Rule | Description |
|------|-------------|
| `no-hardcoded-colors` | Flags `[#hex]` values in className |
| `no-arbitrary-spacing` | Flags `p-[10px]` style values |
| `prefer-design-patterns` | Suggests using patterns.card, etc. |

---

## 8. Best Practices

### ✅ Do

```tsx
// Use Tailwind theme classes
<div className="bg-cyan-bright text-text-primary" />

// Use cn() for conditionals
<div className={cn('base-class', condition && 'conditional')} />

// Use patterns for consistency
<div className={cn(patterns.card, 'p-6')} />

// Use animation variants
<motion.div variants={fadeIn} initial="initial" animate="animate" />

// Use tokens for dynamic values
style={{ backgroundColor: colors.belt[userData.belt] }}
```

### ❌ Don't

```tsx
// Hard-coded hex colors
<div className="bg-[#00d9ff]" />  // ❌

// Inline animation definitions
<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} />  // ❌

// Arbitrary spacing values
<div className="p-[13px]" />  // ❌

// Inconsistent class patterns
<div className="rounded-2xl border border-slate-800/50 bg-gradient-to-br..." />  // ❌ Use patterns.card
```

---

## 9. Adding New Tokens

1. Add CSS variable to `app/globals.css` in the `@theme inline` block
2. Add TypeScript type to `lib/design-system/tokens.ts`
3. Update `eslint-plugins/design-system.js` color mappings
4. Update `scripts/migrate-design-tokens.ts` if needed

---

## Questions?

Check the source files for detailed documentation and examples.
