'use client';

import { useEffect, useRef, useState } from 'react';

interface ChromaGridProps {
  colors?: string[];
  cellSize?: number;
  opacity?: number;
  interactive?: boolean;
  animationSpeed?: number;
  className?: string;
}

export default function ChromaGrid({
  colors = ['#00d9ff', '#a855f7', '#00ffea', '#9333ea'],
  cellSize = 80,
  opacity = 0.03,
  interactive = true,
  animationSpeed = 4,
  className = '',
}: ChromaGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener('resize', resize);

    let animationFrame: number;
    let time = 0;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const cols = Math.ceil(canvas.width / cellSize);
      const rows = Math.ceil(canvas.height / cellSize);

      for (let x = 0; x < cols; x++) {
        for (let y = 0; y < rows; y++) {
          const px = x * cellSize;
          const py = y * cellSize;

          let color = colors[0];
          if (interactive) {
            const dx = px - mousePos.x;
            const dy = py - mousePos.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const influence = Math.max(0, 1 - dist / 300);
            const colorIndex = Math.floor(((time * animationSpeed + dist) / 100) % colors.length);
            color = colors[colorIndex];
            ctx.globalAlpha = opacity * (1 + influence * 0.5);
          } else {
            const colorIndex = Math.floor(((time * animationSpeed + (x + y)) / 10) % colors.length);
            color = colors[colorIndex];
            ctx.globalAlpha = opacity;
          }

          ctx.fillStyle = color;
          ctx.fillRect(px, py, cellSize - 2, cellSize - 2);
        }
      }

      time += 0.1;
      animationFrame = requestAnimationFrame(draw);
    };

    draw();

    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    if (interactive) {
      window.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      window.removeEventListener('resize', resize);
      if (interactive) {
        window.removeEventListener('mousemove', handleMouseMove);
      }
      cancelAnimationFrame(animationFrame);
    };
  }, [colors, cellSize, opacity, interactive, animationSpeed, mousePos]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none ${className}`}
      style={{ zIndex: 0 }}
    />
  );
}

