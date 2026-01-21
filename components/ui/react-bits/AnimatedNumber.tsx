'use client';

import { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  className?: string;
  formatOptions?: Intl.NumberFormatOptions;
  springConfig?: { stiffness: number; damping: number };
}

export default function AnimatedNumber({
  value,
  duration = 2000,
  className = '',
  formatOptions = { useGrouping: true },
  springConfig = { stiffness: 80, damping: 25 },
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const spring = useSpring(0, springConfig);
  const display = useTransform(spring, (current) => Math.round(current));

  useEffect(() => {
    spring.set(value);
    const unsubscribe = display.on('change', (latest) => {
      setDisplayValue(latest);
    });
    return () => unsubscribe();
  }, [value, spring, display]);

  return (
    <motion.span className={className}>
      {displayValue.toLocaleString(undefined, formatOptions)}
    </motion.span>
  );
}

