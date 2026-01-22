/**
 * DialDrill Design System - Animation Variants
 *
 * Standardized Framer Motion animation variants.
 * Use these instead of defining animations inline.
 *
 * Usage:
 *   import { fadeIn, slideUp, staggerContainer } from '@/lib/design-system/animations'
 *
 *   <motion.div variants={fadeIn} initial="initial" animate="animate" />
 *
 *   // With stagger container
 *   <motion.ul variants={staggerContainer} initial="initial" animate="animate">
 *     <motion.li variants={fadeIn}>Item 1</motion.li>
 *     <motion.li variants={fadeIn}>Item 2</motion.li>
 *   </motion.ul>
 */

import type { Variants, Transition, TargetAndTransition } from 'framer-motion';
import { animation } from './tokens';

// =============================================================================
// TRANSITION PRESETS
// =============================================================================

export const transitions = {
  /** Fast, snappy transition */
  fast: {
    duration: animation.duration.fast / 1000,
    ease: [0, 0, 0.2, 1],
  },

  /** Normal, smooth transition */
  normal: {
    duration: animation.duration.normal / 1000,
    ease: [0.4, 0, 0.2, 1],
  },

  /** Medium duration transition */
  medium: {
    duration: animation.duration.medium / 1000,
    ease: [0.4, 0, 0.2, 1],
  },

  /** Slow, elegant transition */
  slow: {
    duration: animation.duration.slow / 1000,
    ease: [0.4, 0, 0.2, 1],
  },

  /** Medium-slow transition */
  mediumSlow: {
    duration: animation.duration.mediumSlow / 1000,
    ease: [0.4, 0, 0.2, 1],
  },

  /** Bouncy spring */
  spring: {
    type: 'spring' as const,
    stiffness: 300,
    damping: 30,
  },

  /** Gentle spring for numbers/counters */
  gentleSpring: {
    type: 'spring' as const,
    stiffness: 80,
    damping: 25,
  },

  /** Bouncy spring for playful elements */
  bouncySpring: {
    type: 'spring' as const,
    stiffness: 400,
    damping: 10,
  },
} as const satisfies Record<string, Transition>;

// =============================================================================
// FADE VARIANTS
// =============================================================================

/** Simple fade in/out */
export const fade: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

/** Fade in from below */
export const fadeIn: Variants = {
  initial: {
    opacity: 0,
    y: 10,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: transitions.normal,
  },
  exit: {
    opacity: 0,
    y: 10,
    transition: transitions.fast,
  },
};

/** Fade in from above */
export const fadeInDown: Variants = {
  initial: {
    opacity: 0,
    y: -10,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: transitions.normal,
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: transitions.fast,
  },
};

/** Fade in from left */
export const fadeInLeft: Variants = {
  initial: {
    opacity: 0,
    x: -20,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: transitions.normal,
  },
  exit: {
    opacity: 0,
    x: -20,
    transition: transitions.fast,
  },
};

/** Fade in from right */
export const fadeInRight: Variants = {
  initial: {
    opacity: 0,
    x: 20,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: transitions.normal,
  },
  exit: {
    opacity: 0,
    x: 20,
    transition: transitions.fast,
  },
};

// =============================================================================
// SLIDE VARIANTS
// =============================================================================

/** Slide up into view */
export const slideUp: Variants = {
  initial: {
    y: 20,
    opacity: 0,
  },
  animate: {
    y: 0,
    opacity: 1,
    transition: transitions.normal,
  },
  exit: {
    y: 20,
    opacity: 0,
    transition: transitions.fast,
  },
};

/** Slide down into view */
export const slideDown: Variants = {
  initial: {
    y: -20,
    opacity: 0,
  },
  animate: {
    y: 0,
    opacity: 1,
    transition: transitions.normal,
  },
  exit: {
    y: -20,
    opacity: 0,
    transition: transitions.fast,
  },
};

/** Slide in from left */
export const slideInLeft: Variants = {
  initial: {
    x: -40,
    opacity: 0,
  },
  animate: {
    x: 0,
    opacity: 1,
    transition: transitions.normal,
  },
  exit: {
    x: -40,
    opacity: 0,
    transition: transitions.fast,
  },
};

/** Slide in from right */
export const slideInRight: Variants = {
  initial: {
    x: 40,
    opacity: 0,
  },
  animate: {
    x: 0,
    opacity: 1,
    transition: transitions.normal,
  },
  exit: {
    x: 40,
    opacity: 0,
    transition: transitions.fast,
  },
};

// =============================================================================
// SCALE VARIANTS
// =============================================================================

/** Scale up from smaller */
export const scaleIn: Variants = {
  initial: {
    scale: 0.95,
    opacity: 0,
  },
  animate: {
    scale: 1,
    opacity: 1,
    transition: transitions.spring,
  },
  exit: {
    scale: 0.95,
    opacity: 0,
    transition: transitions.fast,
  },
};

/** Scale up from zero (for badges, notifications) */
export const popIn: Variants = {
  initial: {
    scale: 0,
    opacity: 0,
  },
  animate: {
    scale: 1,
    opacity: 1,
    transition: transitions.bouncySpring,
  },
  exit: {
    scale: 0,
    opacity: 0,
    transition: transitions.fast,
  },
};

/** Bounce scale animation */
export const bounce: Variants = {
  initial: { scale: 0 },
  animate: {
    scale: [0, 1.2, 1],
    transition: {
      duration: 0.5,
      ease: [0.68, -0.55, 0.265, 1.55],
    },
  },
};

// =============================================================================
// MODAL/OVERLAY VARIANTS
// =============================================================================

/** Modal backdrop */
export const backdropVariants: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.2 },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.15 },
  },
};

/** Modal content */
export const modalVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.95,
    y: 10,
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: transitions.spring,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    transition: transitions.fast,
  },
};

/** Drawer from right */
export const drawerRightVariants: Variants = {
  initial: { x: '100%' },
  animate: {
    x: 0,
    transition: transitions.spring,
  },
  exit: {
    x: '100%',
    transition: transitions.normal,
  },
};

/** Drawer from bottom */
export const drawerBottomVariants: Variants = {
  initial: { y: '100%' },
  animate: {
    y: 0,
    transition: transitions.spring,
  },
  exit: {
    y: '100%',
    transition: transitions.normal,
  },
};

// =============================================================================
// STAGGER CONTAINERS
// =============================================================================

/** Container for staggered children */
export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: animation.stagger.normal,
      delayChildren: 0.1,
    },
  },
  exit: {
    transition: {
      staggerChildren: animation.stagger.fast,
      staggerDirection: -1,
    },
  },
};

/** Fast stagger container */
export const staggerContainerFast: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: animation.stagger.fast,
      delayChildren: 0.05,
    },
  },
};

/** Slow stagger container */
export const staggerContainerSlow: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: animation.stagger.slow,
      delayChildren: 0.2,
    },
  },
};

// =============================================================================
// TEXT ANIMATION VARIANTS
// =============================================================================

/** Character-by-character reveal */
export const characterReveal: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
  },
};

/** Blur text entrance (like BlurText component) */
export const blurIn: Variants = {
  initial: {
    opacity: 0,
    filter: 'blur(10px)',
  },
  animate: {
    opacity: 1,
    filter: 'blur(0px)',
    transition: {
      duration: 0.4,
    },
  },
};

// =============================================================================
// INTERACTION VARIANTS
// =============================================================================

/** Hover scale effect */
export const hoverScale: TargetAndTransition = {
  scale: 1.02,
  transition: transitions.fast,
};

/** Tap scale effect */
export const tapScale: TargetAndTransition = {
  scale: 0.98,
};

/** Button interaction */
export const buttonInteraction = {
  whileHover: hoverScale,
  whileTap: tapScale,
};

/** Card hover lift */
export const cardHover: TargetAndTransition = {
  y: -4,
  transition: transitions.normal,
};

/** Glow pulse on hover (use with style) */
export const glowPulse = {
  boxShadow: [
    '0 0 20px rgba(0, 217, 255, 0.4)',
    '0 0 40px rgba(0, 217, 255, 0.6)',
    '0 0 20px rgba(0, 217, 255, 0.4)',
  ],
  transition: {
    duration: 1.5,
    repeat: Infinity,
    ease: 'easeInOut',
  },
};

// =============================================================================
// LOADING STATES
// =============================================================================

/** Skeleton shimmer */
export const shimmer: Variants = {
  initial: { x: '-100%' },
  animate: {
    x: '100%',
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

/** Pulse animation */
export const pulse: Variants = {
  initial: { opacity: 1 },
  animate: {
    opacity: [1, 0.5, 1],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

/** Spinner rotation */
export const spin: Variants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Create a delayed version of any variant
 */
export function withDelay<T extends Variants>(variants: T, delay: number): T {
  const delayed = { ...variants };
  if (delayed.animate && typeof delayed.animate === 'object') {
    delayed.animate = {
      ...delayed.animate,
      transition: {
        ...(delayed.animate as any).transition,
        delay,
      },
    };
  }
  return delayed;
}

/**
 * Create stagger children with custom delay
 */
export function createStaggerContainer(staggerDelay: number, startDelay = 0): Variants {
  return {
    initial: {},
    animate: {
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: startDelay,
      },
    },
  };
}

/**
 * Combine multiple variants
 */
export function combineVariants(...variants: Variants[]): Variants {
  return variants.reduce((acc, variant) => {
    return {
      initial: { ...acc.initial, ...variant.initial },
      animate: { ...acc.animate, ...variant.animate },
      exit: { ...acc.exit, ...variant.exit },
    };
  }, {} as Variants);
}
