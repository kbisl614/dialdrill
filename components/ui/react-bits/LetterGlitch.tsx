'use client';

import { useState, useEffect } from 'react';

interface LetterGlitchProps {
  text: string;
  glitchColors?: string[];
  speed?: number;
  trigger?: 'hover' | 'always';
  intensity?: 'low' | 'medium' | 'high';
  className?: string;
}

export default function LetterGlitch({
  text,
  glitchColors = ['#00d9ff', '#00ffea', '#a855f7'],
  speed = 40,
  trigger = 'hover',
  intensity = 'medium',
  className = '',
}: LetterGlitchProps) {
  const [isGlitching, setIsGlitching] = useState(trigger === 'always');
  const [glitchText, setGlitchText] = useState(text);
  const [randomColor, setRandomColor] = useState(glitchColors[0]);

  useEffect(() => {
    if (trigger !== 'always' || !isGlitching) return;

    const interval = setInterval(() => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
      const newText = text
        .split('')
        .map((char) => {
          if (char === ' ') return char;
          if (Math.random() > (intensity === 'high' ? 0.7 : intensity === 'medium' ? 0.5 : 0.3)) {
            return chars[Math.floor(Math.random() * chars.length)];
          }
          return char;
        })
        .join('');
      setGlitchText(newText);
      // Update random color in interval callback (not during render)
      setRandomColor(glitchColors[Math.floor(Math.random() * glitchColors.length)]);
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed, intensity, trigger, isGlitching, glitchColors]);

  // Update color when glitching starts (via callback, not effect)
  const handleMouseEnter = () => {
    if (trigger === 'hover') {
      setRandomColor(glitchColors[Math.floor(Math.random() * glitchColors.length)]);
      setIsGlitching(true);
    }
  };

  const glitchStyle = isGlitching
    ? {
        textShadow: glitchColors.map((color, i) => `${i * 2}px ${i * 2}px 0 ${color}`).join(', '),
        color: randomColor,
      }
    : {};

  return (
    <span
      className={className}
      style={glitchStyle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => trigger === 'hover' && setIsGlitching(false)}
    >
      {isGlitching ? glitchText : text}
    </span>
  );
}

