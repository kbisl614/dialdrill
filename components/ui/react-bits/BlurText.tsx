'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface BlurTextProps {
  text: string;
  delay?: number;
  animateBy?: 'words' | 'chars';
  className?: string;
}

export default function BlurText({ text, delay = 0, animateBy = 'words', className = '' }: BlurTextProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  if (animateBy === 'words') {
    const words = text.split(' ');
    return (
      <span className={className}>
        {words.map((word, i) => (
          <motion.span
            key={i}
            initial={{ filter: 'blur(10px)', opacity: 0 }}
            animate={isVisible ? { filter: 'blur(0px)', opacity: 1 } : { filter: 'blur(10px)', opacity: 0 }}
            transition={{ duration: 0.5, delay: i * 0.05 }}
            className="inline-block"
          >
            {word}
            {i < words.length - 1 && '\u00A0'}
          </motion.span>
        ))}
      </span>
    );
  }

  const chars = text.split('');
  return (
    <span className={className}>
      {chars.map((char, i) => (
        <motion.span
          key={i}
          initial={{ filter: 'blur(10px)', opacity: 0 }}
          animate={isVisible ? { filter: 'blur(0px)', opacity: 1 } : { filter: 'blur(10px)', opacity: 0 }}
          transition={{ duration: 0.3, delay: i * 0.02 }}
          className="inline-block"
        >
          {char}
        </motion.span>
      ))}
    </span>
  );
}

