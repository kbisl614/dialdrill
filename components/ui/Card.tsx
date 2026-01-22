'use client';

import { type ReactNode, type HTMLAttributes } from 'react';
import { cn } from '@/lib/design-system';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: 'default' | 'glow' | 'hover';
  padding?: 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * Standardized Card Component
 * 
 * Replaces all card patterns across the app with consistent styling.
 * Uses design system tokens for colors, borders, shadows, and spacing.
 */
export default function Card({
  children,
  variant = 'default',
  padding = 'md',
  className = '',
  ...props
}: CardProps) {
  const variantStyles = {
    default: 'rounded-2xl border border-border-subtle/50 bg-gradient-to-br from-card-bg to-[rgba(5,9,17,0.8)] shadow-[0_20px_60px_rgba(0,0,0,0.7)] backdrop-blur-xl hover:border-cyan-bright/30 transition-all duration-300',
    glow: 'rounded-3xl border border-border-subtle/50 bg-gradient-to-br from-card-bg to-[rgba(5,9,17,0.8)] shadow-[0_20px_60px_rgba(0,0,0,0.7),0_0_40px_rgba(0,217,255,0.08)] backdrop-blur-xl hover:shadow-[0_25px_70px_rgba(0,0,0,0.8),0_0_50px_rgba(0,217,255,0.12)] transition-all duration-500 hover:border-cyan-bright/30',
    hover: 'rounded-2xl border border-border-subtle/50 bg-gradient-to-br from-card-bg to-[rgba(5,9,17,0.8)] shadow-[0_20px_60px_rgba(0,0,0,0.7)] backdrop-blur-xl hover:shadow-[0_25px_70px_rgba(0,0,0,0.8),0_0_50px_rgba(0,217,255,0.15)] transition-all duration-300 hover:border-cyan-bright/30',
  };

  const paddingStyles = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-12',
  };

  return (
    <div
      className={cn(
        variantStyles[variant],
        paddingStyles[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

