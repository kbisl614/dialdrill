'use client';

import { ReactNode } from 'react';

interface ShimmerButtonProps {
  children: ReactNode;
  onClick?: () => void;
  shimmerColor?: string;
  shimmerDuration?: string;
  background?: string;
  borderRadius?: string;
  className?: string;
  disabled?: boolean;
}

export default function ShimmerButton({
  children,
  onClick,
  shimmerColor = '#00ffea',
  shimmerDuration = '1.5s',
  background,
  borderRadius = '0.5rem',
  className = '',
  disabled = false,
}: ShimmerButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`relative overflow-hidden ${className}`}
      style={{
        background: background || 'linear-gradient(90deg, #00d9ff, #00ffea)',
        borderRadius,
      }}
    >
      <span         className="relative z-10">{children}</span>
      <span
        className="absolute inset-0 -translate-x-full"
        style={{
          background: `linear-gradient(90deg, transparent, ${shimmerColor}, transparent)`,
          animation: `shimmer ${shimmerDuration} infinite`,
        }}
      />
      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(200%);
          }
        }
        .animate-shimmer {
          animation: shimmer ${shimmerDuration} infinite;
        }
      `}</style>
    </button>
  );
}

