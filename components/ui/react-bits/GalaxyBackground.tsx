'use client';

import { useEffect, useRef, useState } from 'react';

interface GalaxyBackgroundProps {
  starCount?: number;
  nebulaIntensity?: number;
  className?: string;
}

interface Star {
  x: number;
  y: number;
  radius: number;
  opacity: number;
  twinkleSpeed: number;
  twinkleOffset: number;
}

export default function GalaxyBackground({
  starCount = 200,
  nebulaIntensity = 0.15,
  className = '',
}: GalaxyBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const starsRef = useRef<Star[]>([]);
  const animationFrameRef = useRef<number | undefined>(undefined);

  // Initialize stars
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const updateDimensions = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setDimensions({ width, height });
      canvas.width = width;
      canvas.height = height;

      // Regenerate stars for new dimensions
      starsRef.current = Array.from({ length: starCount }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.6 + 0.2,
        twinkleSpeed: Math.random() * 0.02 + 0.005,
        twinkleOffset: Math.random() * Math.PI * 2,
      }));
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [starCount]);

  // Draw galaxy background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || dimensions.width === 0 || dimensions.height === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      // Clear canvas
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);

      // Create gradient for nebula effect (brand colors)
      const centerX = dimensions.width / 2;
      const centerY = dimensions.height / 3; // Slightly above center for hero area

      // Purple nebula (left)
      const purpleGradient = ctx.createRadialGradient(
        centerX * 0.3,
        centerY,
        0,
        centerX * 0.3,
        centerY,
        dimensions.width * 0.6
      );
      purpleGradient.addColorStop(0, `rgba(168, 85, 247, ${nebulaIntensity * 0.3})`);
      purpleGradient.addColorStop(0.5, `rgba(147, 51, 234, ${nebulaIntensity * 0.2})`);
      purpleGradient.addColorStop(1, 'rgba(168, 85, 247, 0)');
      ctx.fillStyle = purpleGradient;
      ctx.fillRect(0, 0, dimensions.width, dimensions.height);

      // Cyan nebula (center-right)
      const cyanGradient = ctx.createRadialGradient(
        centerX * 1.2,
        centerY * 1.1,
        0,
        centerX * 1.2,
        centerY * 1.1,
        dimensions.width * 0.5
      );
      cyanGradient.addColorStop(0, `rgba(0, 217, 255, ${nebulaIntensity * 0.25})`);
      cyanGradient.addColorStop(0.5, `rgba(0, 255, 234, ${nebulaIntensity * 0.15})`);
      cyanGradient.addColorStop(1, 'rgba(0, 217, 255, 0)');
      ctx.fillStyle = cyanGradient;
      ctx.fillRect(0, 0, dimensions.width, dimensions.height);

      // Draw twinkling stars
      const time = Date.now() * 0.001;
      starsRef.current.forEach((star) => {
        // Twinkling effect
        const twinkle = Math.sin(time * star.twinkleSpeed + star.twinkleOffset) * 0.3 + 0.7;
        const currentOpacity = star.opacity * twinkle;

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${currentOpacity * 0.6})`;
        ctx.fill();

        // Add glow for brighter stars
        if (star.radius > 1) {
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.radius * 2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(0, 217, 255, ${currentOpacity * 0.1})`;
          ctx.fill();
        }
      });
    };

    const animate = () => {
      draw();
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [dimensions, nebulaIntensity]);

  return (
    <>
      <canvas
        ref={canvasRef}
        className={`fixed inset-0 pointer-events-none ${className}`}
        style={{ zIndex: 0 }}
      />
      {/* Subtle dark overlay to ensure text readability - protects hero area */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: 1,
          background: 'radial-gradient(ellipse 120% 60% at 50% 35%, rgba(8, 13, 26, 0.5) 0%, rgba(8, 13, 26, 0.3) 40%, transparent 70%)',
        }}
      />
    </>
  );
}

