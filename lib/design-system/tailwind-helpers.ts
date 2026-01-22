/**
 * Tailwind CSS Helper Utilities
 *
 * Type-safe utilities for generating Tailwind classes
 * that match our design tokens.
 */

import { colors, spacing, borderRadius, shadows } from './tokens';

type SpacingKey = keyof typeof spacing;
type BorderRadiusKey = keyof typeof borderRadius;

/**
 * Type-safe Tailwind class builder
 *
 * @example
 * tw.bg('cyan-bright')     // 'bg-cyan-bright'
 * tw.text('text-primary')  // 'text-text-primary'
 * tw.p('lg')               // 'p-4'
 * tw.gap('md')             // 'gap-3'
 */
export const tw = {
  // Background colors
  bg: (color: string) => `bg-${color}` as const,

  // Text colors
  text: (color: string) => `text-${color}` as const,

  // Border colors
  border: (color: string) => `border-${color}` as const,

  // Padding (maps to Tailwind spacing)
  p: (size: SpacingKey) => {
    const map: Record<SpacingKey, string> = {
      xs: 'p-1',
      sm: 'p-2',
      md: 'p-3',
      lg: 'p-4',
      xl: 'p-6',
      '2xl': 'p-8',
      '3xl': 'p-12',
      '4xl': 'p-16',
      '5xl': 'p-24',
    };
    return map[size];
  },

  px: (size: SpacingKey) => {
    const map: Record<SpacingKey, string> = {
      xs: 'px-1',
      sm: 'px-2',
      md: 'px-3',
      lg: 'px-4',
      xl: 'px-6',
      '2xl': 'px-8',
      '3xl': 'px-12',
      '4xl': 'px-16',
      '5xl': 'px-24',
    };
    return map[size];
  },

  py: (size: SpacingKey) => {
    const map: Record<SpacingKey, string> = {
      xs: 'py-1',
      sm: 'py-2',
      md: 'py-3',
      lg: 'py-4',
      xl: 'py-6',
      '2xl': 'py-8',
      '3xl': 'py-12',
      '4xl': 'py-16',
      '5xl': 'py-24',
    };
    return map[size];
  },

  // Margin
  m: (size: SpacingKey) => {
    const map: Record<SpacingKey, string> = {
      xs: 'm-1',
      sm: 'm-2',
      md: 'm-3',
      lg: 'm-4',
      xl: 'm-6',
      '2xl': 'm-8',
      '3xl': 'm-12',
      '4xl': 'm-16',
      '5xl': 'm-24',
    };
    return map[size];
  },

  // Gap
  gap: (size: SpacingKey) => {
    const map: Record<SpacingKey, string> = {
      xs: 'gap-1',
      sm: 'gap-2',
      md: 'gap-3',
      lg: 'gap-4',
      xl: 'gap-6',
      '2xl': 'gap-8',
      '3xl': 'gap-12',
      '4xl': 'gap-16',
      '5xl': 'gap-24',
    };
    return map[size];
  },

  // Border radius
  rounded: (size: BorderRadiusKey) => {
    const map: Record<BorderRadiusKey, string> = {
      none: 'rounded-none',
      sm: 'rounded-sm',
      DEFAULT: 'rounded',
      md: 'rounded-md',
      lg: 'rounded-lg',
      xl: 'rounded-xl',
      '2xl': 'rounded-2xl',
      full: 'rounded-full',
    };
    return map[size];
  },
} as const;

/**
 * Common Tailwind class patterns for DialDrill
 */
export const patterns = {
  // Card base styles - matches actual usage
  card: 'rounded-2xl border border-border-subtle/50 bg-gradient-to-br from-card-bg to-[rgba(5,9,17,0.8)] shadow-[0_20px_60px_rgba(0,0,0,0.7)] backdrop-blur-xl hover:border-cyan-bright/30 transition-all duration-300',

  // Card with glow - matches actual usage
  cardGlow: 'rounded-3xl border border-border-subtle/50 bg-gradient-to-br from-card-bg to-[rgba(5,9,17,0.8)] shadow-[0_20px_60px_rgba(0,0,0,0.7),0_0_40px_rgba(0,217,255,0.08)] backdrop-blur-xl hover:shadow-[0_25px_70px_rgba(0,0,0,0.8),0_0_50px_rgba(0,217,255,0.12)] transition-all duration-500 hover:border-cyan-bright/30',

  // Primary button (cyan gradient) - matches actual usage
  buttonPrimary: 'bg-gradient-to-r from-cyan-bright to-cyan-bright-alt-2 text-dark-bg font-semibold rounded-full px-6 py-3 shadow-[0_0_40px_rgba(0,217,255,0.6)] hover:shadow-[0_0_60px_rgba(0,255,234,0.8)] transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100',

  // Secondary button (purple gradient)
  buttonPurple: 'bg-gradient-to-r from-purple to-purple-dark text-white font-semibold rounded-full px-8 py-4 shadow-[0_0_30px_rgba(168,85,247,0.5)] hover:shadow-[0_0_50px_rgba(168,85,247,0.8)] transition-all hover:scale-105 active:scale-[0.98]',

  // Secondary button (outline)
  buttonSecondary: 'border border-white/20 bg-white/5 text-white rounded-xl px-6 py-3 hover:bg-white/10 transition-colors',

  // Ghost button
  buttonGhost: 'bg-transparent text-text-secondary hover:text-text-primary transition-colors',

  // Input field
  input: 'bg-darker-bg border border-border-subtle rounded-xl px-4 py-3 text-text-primary placeholder:text-text-muted focus:border-cyan-bright/50 focus:outline-none transition-colors',

  // Badge styles
  badgeCyan: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-cyan-bright/20 text-cyan-bright',
  badgePurple: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple/20 text-purple',
  badgeSuccess: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success/20 text-success',

  // Section container
  section: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',

  // Glass morphism
  glass: 'backdrop-blur-xl bg-white/5 border border-white/10',

  // Text gradient
  textGradientCyan: 'bg-gradient-to-r from-cyan-bright to-cyan-muted bg-clip-text text-transparent',
  textGradientPurple: 'bg-gradient-to-r from-purple to-magenta bg-clip-text text-transparent',

  // Focus ring
  focusRing: 'focus:outline-none focus:ring-2 focus:ring-cyan-bright/50 focus:ring-offset-2 focus:ring-offset-dark-bg',

  // Transition presets
  transitionFast: 'transition-all duration-150 ease-out',
  transitionNormal: 'transition-all duration-300 ease-out',
  transitionSlow: 'transition-all duration-500 ease-out',
} as const;

/**
 * Generate gradient background style
 */
export function gradientBg(
  from: string,
  to: string,
  direction: 'to-r' | 'to-l' | 'to-t' | 'to-b' | 'to-br' | 'to-bl' | 'to-tr' | 'to-tl' = 'to-br'
): string {
  return `bg-gradient-${direction} from-[${from}] to-[${to}]`;
}

/**
 * Generate box shadow with glow
 */
export function glowShadow(color: string, intensity: 'low' | 'medium' | 'high' = 'medium'): string {
  const intensityMap = {
    low: '0 0 20px',
    medium: '0 0 40px',
    high: '0 0 60px',
  };
  return `${intensityMap[intensity]} ${color}`;
}
