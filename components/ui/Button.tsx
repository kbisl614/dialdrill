'use client';

import { motion, type HTMLMotionProps } from 'framer-motion';
import { type ReactNode } from 'react';
import { cn } from '@/lib/design-system';
import { buttonInteraction } from '@/lib/design-system/animations';
import { colors } from '@/lib/design-system/tokens';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'purple' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

/**
 * Standardized Button Component
 * 
 * Replaces all button patterns across the app with consistent styling.
 * Uses design system tokens for colors, spacing, and animations.
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const variantStyles = {
    primary: 'bg-gradient-to-r from-cyan-bright to-cyan-bright-alt-2 text-dark-bg font-semibold shadow-[0_0_40px_rgba(0,217,255,0.6)] hover:shadow-[0_0_60px_rgba(0,255,234,0.8)]',
    secondary: 'border border-white/20 bg-white/5 text-white hover:bg-white/10',
    purple: 'bg-gradient-to-r from-purple to-purple-dark text-white font-semibold shadow-[0_0_30px_rgba(168,85,247,0.5)] hover:shadow-[0_0_50px_rgba(168,85,247,0.8)]',
    ghost: 'text-white hover:bg-white/5',
  };

  const sizeStyles = {
    sm: 'px-4 py-2 text-sm rounded-full',
    md: 'px-6 py-3 text-base rounded-full',
    lg: 'px-8 py-4 text-lg rounded-full',
  };

  return (
    <motion.button
      whileHover={buttonInteraction.whileHover}
      whileTap={buttonInteraction.whileTap}
      disabled={disabled}
      className={cn(
        'transition-all font-semibold flex items-center justify-center gap-2',
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && 'w-full',
        disabled && 'opacity-50 cursor-not-allowed',
        disabled && 'hover:scale-100',
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
}

