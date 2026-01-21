'use client';

import { ReactNode, useState, useRef } from 'react';

interface TiltCardProps {
  children: ReactNode;
  tiltAmount?: number;
  glowColor?: string;
  spotlightSize?: number;
  borderColor?: string;
  backgroundColor?: string;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}

export default function TiltCard({
  children,
  tiltAmount = 15,
  glowColor = 'rgba(0, 217, 255, 0.3)',
  spotlightSize = 200,
  borderColor = '#00d9ff',
  backgroundColor = 'rgba(15, 23, 42, 0.6)',
  disabled = false,
  onClick,
  className = '',
}: TiltCardProps) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled || !cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -tiltAmount;
    const rotateY = ((x - centerX) / centerX) * tiltAmount;

    setTilt({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  return (
    <div
      ref={cardRef}
      onClick={disabled ? undefined : onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative transition-transform duration-300 ${className}`}
      style={{
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        borderColor,
        backgroundColor,
        cursor: disabled ? 'not-allowed' : onClick ? 'pointer' : 'default',
      }}
    >
      {children}
      <div
        className="absolute inset-0 opacity-0 transition-opacity duration-300 pointer-events-none rounded-xl"
        style={{
          background: `radial-gradient(${spotlightSize}px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), ${glowColor}, transparent)`,
          opacity: tilt.x !== 0 || tilt.y !== 0 ? 0.8 : 0,
        }}
      />
    </div>
  );
}

