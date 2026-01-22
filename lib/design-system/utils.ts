/**
 * Design System Utilities
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind classes with clsx and tailwind-merge
 * Handles conditional classes and resolves conflicts
 *
 * @example
 * cn('px-4 py-2', isActive && 'bg-cyan-bright', className)
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Create a CSS variable reference
 *
 * @example
 * cssVar('cyan-bright') // 'var(--color-cyan-bright)'
 */
export function cssVar(name: string, fallback?: string): string {
  if (fallback) {
    return `var(--color-${name}, ${fallback})`;
  }
  return `var(--color-${name})`;
}

/**
 * Convert hex to rgba
 *
 * @example
 * hexToRgba('#00d9ff', 0.5) // 'rgba(0, 217, 255, 0.5)'
 */
export function hexToRgba(hex: string, alpha: number): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return hex;

  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Get a color with opacity
 * Works with our design token colors
 *
 * @example
 * withOpacity(colors.cyan.bright, 0.5) // 'rgba(0, 217, 255, 0.5)'
 */
export function withOpacity(color: string, opacity: number): string {
  // Handle rgba values
  if (color.startsWith('rgba')) {
    return color.replace(/[\d.]+\)$/, `${opacity})`);
  }

  // Handle rgb values
  if (color.startsWith('rgb(')) {
    return color.replace('rgb(', 'rgba(').replace(')', `, ${opacity})`);
  }

  // Handle hex values
  if (color.startsWith('#')) {
    return hexToRgba(color, opacity);
  }

  return color;
}
