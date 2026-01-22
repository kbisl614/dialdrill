/**
 * DialDrill Design System
 *
 * Centralized design tokens, animations, and utilities.
 *
 * @example
 * ```tsx
 * import { colors, spacing, fadeIn, staggerContainer } from '@/lib/design-system'
 *
 * // Colors for dynamic styles
 * <div style={{ backgroundColor: colors.cyan.bright }} />
 *
 * // Animation variants
 * <motion.div variants={fadeIn} initial="initial" animate="animate" />
 * ```
 */

// Design tokens
export {
  colors,
  spacing,
  spacingPx,
  typography,
  animation,
  shadows,
  borderRadius,
  zIndex,
  breakpoints,
  breakpointsPx,
  type ColorToken,
  type SpacingToken,
  type AnimationDuration,
  type AnimationEasing,
  type ShadowToken,
  type BorderRadiusToken,
  type ZIndexToken,
  type BreakpointToken,
} from './tokens';

// Animation variants
export {
  // Transitions
  transitions,
  // Fade
  fade,
  fadeIn,
  fadeInDown,
  fadeInLeft,
  fadeInRight,
  // Slide
  slideUp,
  slideDown,
  slideInLeft,
  slideInRight,
  // Scale
  scaleIn,
  popIn,
  bounce,
  // Modal/Overlay
  backdropVariants,
  modalVariants,
  drawerRightVariants,
  drawerBottomVariants,
  // Stagger
  staggerContainer,
  staggerContainerFast,
  staggerContainerSlow,
  // Text
  characterReveal,
  blurIn,
  // Interaction
  hoverScale,
  tapScale,
  buttonInteraction,
  cardHover,
  glowPulse,
  // Loading
  shimmer,
  pulse,
  spin,
  // Utilities
  withDelay,
  createStaggerContainer,
  combineVariants,
} from './animations';

// Utility functions
export { cn } from './utils';
export { tw } from './tailwind-helpers';
