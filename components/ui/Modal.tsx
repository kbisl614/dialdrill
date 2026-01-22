'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { type ReactNode } from 'react';
import { cn } from '@/lib/design-system';
import { backdropVariants, modalVariants } from '@/lib/design-system/animations';
import { zIndex } from '@/lib/design-system/tokens';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
  closeOnBackdropClick?: boolean;
}

/**
 * Standardized Modal Component
 * 
 * Replaces all modal patterns across the app with consistent styling and animations.
 * Uses design system tokens for z-index, animations, and styling.
 */
export default function Modal({
  isOpen,
  onClose,
  children,
  size = 'md',
  className = '',
  closeOnBackdropClick = true,
}: ModalProps) {
  const sizeStyles = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'max-w-full mx-4',
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            variants={backdropVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={closeOnBackdropClick ? onClose : undefined}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            style={{ zIndex: zIndex.modalBackdrop }}
          />

          {/* Modal Content */}
          <div
            className="fixed inset-0 flex items-center justify-center p-4 pointer-events-none"
            style={{ zIndex: zIndex.modal }}
          >
            <motion.div
              variants={modalVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
              className={cn(
                'w-full rounded-2xl border border-white/10 bg-[var(--color-darkest-bg)] shadow-2xl overflow-hidden pointer-events-auto',
                sizeStyles[size],
                className
              )}
            >
              {children}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

