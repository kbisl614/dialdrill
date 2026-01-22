/**
 * DialDrill Design System - Design Tokens
 *
 * Single source of truth for all design tokens.
 * These values map to CSS variables in globals.css.
 *
 * Usage:
 *   import { colors, spacing, animation } from '@/lib/design-system/tokens'
 *
 *   // In className (Tailwind)
 *   className={`bg-[${colors.cyan.bright}]`}  // ❌ Don't do this
 *   className="bg-cyan-bright"                 // ✅ Use Tailwind theme
 *
 *   // In inline styles (dynamic values)
 *   style={{ backgroundColor: colors.cyan.bright }}
 */

// =============================================================================
// COLOR TOKENS
// =============================================================================

export const colors = {
  // Backgrounds
  background: {
    dark: '#080d1a',
    darker: '#050911',
    darkest: '#030712',     // Darkest background (8+ instances)
    card: 'rgba(15, 23, 42, 0.4)',
    cardSolid: '#0f172a',
    cardDark: '#1A1F2E',    // Dark card background (10+ instances)
    surface: 'rgba(15, 23, 42, 0.6)',
  },

  // Primary - Cyan (CTAs, primary actions)
  cyan: {
    bright: '#00d9ff',      // Primary CTA color
    brightAlt: '#06d9d7',   // Slightly warmer cyan
    brightAlt2: '#00ffea',  // Used in gradients (89+ instances)
    hover: '#05c4c2',       // Hover state
    muted: '#0f9b99',       // Secondary/accent
    dark: '#0d7a78',        // Darker variant
    glow: 'rgba(0, 217, 255, 0.4)',
    glowMuted: 'rgba(0, 217, 255, 0.2)',
  },

  // Secondary - Purple/Magenta (highlights, badges)
  purple: {
    DEFAULT: '#a855f7',
    dark: '#9333ea',
    magenta: '#9d4edd',     // Purple-magenta variant (24+ instances)
    light: '#d8b4fe',       // Light purple (12+ instances)
    glow: 'rgba(168, 85, 247, 0.4)',
    glowMuted: 'rgba(168, 85, 247, 0.2)',
  },

  magenta: {
    DEFAULT: '#d946ef',
  },

  // Text
  text: {
    primary: '#ffffff',
    secondary: '#94a3b8',   // slate-400
    muted: '#64748b',       // slate-500
    disabled: '#475569',    // slate-600
  },

  // Borders
  border: {
    subtle: '#1e293b',      // slate-800
    medium: '#334155',      // slate-700
    strong: '#475569',      // slate-600
    card: 'rgba(30, 41, 59, 0.5)',
  },

  // Semantic colors
  success: {
    DEFAULT: '#22c55e',
    muted: 'rgba(34, 197, 94, 0.2)',
  },

  warning: {
    DEFAULT: '#f59e0b',
    muted: 'rgba(245, 158, 11, 0.2)',
  },

  error: {
    DEFAULT: '#ef4444',
    muted: 'rgba(239, 68, 68, 0.2)',
  },

  // Belt colors (gamification)
  belt: {
    white: '#f8fafc',
    yellow: '#facc15',
    orange: '#f97316',
    green: '#22c55e',
    blue: '#3b82f6',
    purple: '#a855f7',
    brown: '#92400e',
    red: '#ef4444',
    black: '#1e293b',
  },
} as const;

// =============================================================================
// SPACING TOKENS (T-shirt sizing)
// =============================================================================

export const spacing = {
  /** 4px */  xs: '0.25rem',
  /** 8px */  sm: '0.5rem',
  /** 12px */ md: '0.75rem',
  /** 16px */ lg: '1rem',
  /** 24px */ xl: '1.5rem',
  /** 32px */ '2xl': '2rem',
  /** 48px */ '3xl': '3rem',
  /** 64px */ '4xl': '4rem',
  /** 96px */ '5xl': '6rem',
} as const;

// Numeric values for calculations
export const spacingPx = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
  '4xl': 64,
  '5xl': 96,
} as const;

// =============================================================================
// TYPOGRAPHY TOKENS
// =============================================================================

export const typography = {
  fontFamily: {
    sans: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    mono: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
  },

  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }],      // 12px
    sm: ['0.875rem', { lineHeight: '1.25rem' }],  // 14px
    base: ['1rem', { lineHeight: '1.5rem' }],     // 16px
    lg: ['1.125rem', { lineHeight: '1.75rem' }],  // 18px
    xl: ['1.25rem', { lineHeight: '1.75rem' }],   // 20px
    '2xl': ['1.5rem', { lineHeight: '2rem' }],    // 24px
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }], // 36px
    '5xl': ['3rem', { lineHeight: '1' }],         // 48px
    '6xl': ['3.75rem', { lineHeight: '1' }],      // 60px
  },

  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
} as const;

// =============================================================================
// ANIMATION TOKENS
// =============================================================================

export const animation = {
  // Durations
  duration: {
    instant: 0,
    fast: 150,
    normal: 300,
    medium: 600,            // Used 18+ times
    slow: 500,
    mediumSlow: 800,        // Used 12+ times
    slower: 700,
    slowest: 1000,
  },

  // Duration strings for CSS/Tailwind
  durationMs: {
    instant: '0ms',
    fast: '150ms',
    normal: '300ms',
    medium: '600ms',
    slow: '500ms',
    mediumSlow: '800ms',
    slower: '700ms',
    slowest: '1000ms',
  },

  // Easing functions
  easing: {
    linear: 'linear',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeOutExpo: 'cubic-bezier(0.22, 1, 0.36, 1)',  // Used 3+ times
    // Custom bounce easing
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    // Spring-like
    spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  },

  // Spring configs for Framer Motion
  spring: {
    gentle: { stiffness: 120, damping: 14 },
    snappy: { stiffness: 300, damping: 30 },
    bouncy: { stiffness: 400, damping: 10 },
    stiff: { stiffness: 500, damping: 35 },
    slow: { stiffness: 80, damping: 25 },
  },

  // Stagger delays
  stagger: {
    fast: 0.02,
    normal: 0.05,
    slow: 0.1,
  },
} as const;

// =============================================================================
// SHADOW TOKENS
// =============================================================================

export const shadows = {
  // Card shadows
  card: '0 20px 60px rgba(0, 0, 0, 0.7), 0 0 40px rgba(6, 217, 215, 0.08)',
  cardHover: '0 25px 80px rgba(0, 0, 0, 0.8), 0 0 60px rgba(6, 217, 215, 0.15)',

  // Glow effects
  glowCyan: '0 0 100px rgba(6, 217, 215, 0.4)',
  glowCyanStrong: '0 0 30px rgba(0, 217, 255, 0.6), 0 0 60px rgba(0, 217, 255, 0.3)',
  glowPurple: '0 0 100px rgba(168, 85, 247, 0.4)',
  glowPurpleStrong: '0 0 30px rgba(168, 85, 247, 0.5), 0 0 60px rgba(168, 85, 247, 0.25)',

  // Button shadows
  button: '0 0 20px rgba(6, 217, 215, 0.4), 0 0 40px rgba(6, 217, 215, 0.2)',
  buttonHover: '0 0 30px rgba(6, 217, 215, 0.6), 0 0 60px rgba(6, 217, 215, 0.3)',
  buttonPurple: '0 0 20px rgba(168, 85, 247, 0.3), 0 0 40px rgba(168, 85, 247, 0.15)',
  buttonPurpleHover: '0 0 30px rgba(168, 85, 247, 0.5), 0 0 60px rgba(168, 85, 247, 0.25)',

  // Border glow
  borderGlowCyan: '0 0 0 1px rgba(0, 217, 255, 0.3), 0 0 20px rgba(0, 217, 255, 0.2)',
  borderGlowCyanHover: '0 0 0 2px rgba(0, 217, 255, 0.5), 0 0 40px rgba(0, 217, 255, 0.3)',
  borderGlowPurple: '0 0 0 1px rgba(168, 85, 247, 0.3), 0 0 20px rgba(168, 85, 247, 0.2)',
  borderGlowPurpleHover: '0 0 0 2px rgba(168, 85, 247, 0.5), 0 0 40px rgba(168, 85, 247, 0.3)',
} as const;

// =============================================================================
// BORDER RADIUS TOKENS
// =============================================================================

export const borderRadius = {
  none: '0',
  sm: '0.25rem',    // 4px
  DEFAULT: '0.375rem', // 6px
  md: '0.5rem',     // 8px
  lg: '0.75rem',    // 12px
  xl: '1rem',       // 16px
  '2xl': '1.5rem',  // 24px
  full: '9999px',
} as const;

// =============================================================================
// Z-INDEX SCALE
// =============================================================================

export const zIndex = {
  behind: -1,
  base: 0,
  dropdown: 10,
  sticky: 20,
  fixed: 30,
  modalBackdrop: 40,
  modal: 50,
  popover: 60,
  tooltip: 70,
  toast: 200,               // Updated from 80 to match actual usage
  max: 9999,
} as const;

// =============================================================================
// BREAKPOINTS
// =============================================================================

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

export const breakpointsPx = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type ColorToken = typeof colors;
export type SpacingToken = keyof typeof spacing;
export type AnimationDuration = keyof typeof animation.duration;
export type AnimationEasing = keyof typeof animation.easing;
export type ShadowToken = keyof typeof shadows;
export type BorderRadiusToken = keyof typeof borderRadius;
export type ZIndexToken = keyof typeof zIndex;
export type BreakpointToken = keyof typeof breakpoints;
