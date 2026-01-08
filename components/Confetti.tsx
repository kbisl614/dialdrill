'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConfettiProps {
  show: boolean;
  onComplete?: () => void;
}

export default function Confetti({ show, onComplete }: ConfettiProps) {
  const [key, setKey] = useState(0);

  // Generate pieces once based on key - use pseudo-random but deterministic values
  const pieces = show ? Array.from({ length: 50 }, (_, i) => ({
    id: i + key * 100,
    x: ((i * 7) % 100),
    rotation: (i * 37) % 360,
    color: ['#00d9ff', '#00ffea', '#a855f7', '#d8b4fe', '#fbbf24'][i % 5],
    duration: 2 + ((i * 13) % 10) / 10
  })) : [];

  useEffect(() => {
    if (!show) return;

    // Defer key update to avoid setState in effect
    const rafId = requestAnimationFrame(() => {
      setKey(k => k + 1);
    });

    const timer = setTimeout(() => {
      if (onComplete) onComplete();
    }, 3000);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(timer);
    };
  }, [show, onComplete]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[100]">
      <AnimatePresence>
        {pieces.map((piece) => (
          <motion.div
            key={piece.id}
            initial={{
              top: '-10%',
              left: `${piece.x}%`,
              opacity: 1,
              rotate: 0
            }}
            animate={{
              top: '110%',
              opacity: 0,
              rotate: piece.rotation
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: piece.duration,
              ease: 'easeIn'
            }}
            className="absolute w-3 h-3 rounded-sm"
            style={{ backgroundColor: piece.color }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
