'use client';

import { ReactNode, useRef, useEffect, useState } from 'react';

interface SpotlightProps {
  children: ReactNode;
  size?: number;
  color?: string;
  className?: string;
}

export default function Spotlight({
  children,
  size = 300,
  color = 'rgba(0, 217, 255, 0.3)',
  className = '',
}: SpotlightProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePos({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, []);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {children}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(${size}px circle at ${mousePos.x}px ${mousePos.y}px, ${color}, transparent)`,
        }}
      />
    </div>
  );
}

