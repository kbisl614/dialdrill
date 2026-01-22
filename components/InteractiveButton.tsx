'use client';

import { motion } from 'framer-motion';
import { type ReactNode, type ButtonHTMLAttributes } from 'react';

interface InteractiveButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  haptic?: boolean;
}

export default function InteractiveButton({
  children,
  variant = 'primary',
  size = 'md',
  haptic = true,
  className = '',
  onClick,
  ...props
}: InteractiveButtonProps) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Trigger haptic feedback on supported devices
    if (haptic && 'vibrate' in navigator) {
      navigator.vibrate(10);
    }

    if (onClick) {
      onClick(e);
    }
  };

  const variantStyles = {
    primary: 'bg-gradient-to-r from-[var(--color-cyan-bright)] to-[#00ffea] text-[var(--color-dark-bg)] shadow-[0_0_40px_rgba(0,217,255,0.6)] hover:shadow-[0_0_60px_rgba(0,255,234,0.8)]',
    secondary: 'border border-white/20 bg-white/5 text-white hover:bg-white/10',
    ghost: 'text-white hover:bg-white/5'
  };

  const sizeStyles = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
      className={`rounded-full font-semibold transition-all ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={props.disabled}
      type={props.type}
      aria-label={props['aria-label']}
    >
      {children}
    </motion.button>
  );
}
