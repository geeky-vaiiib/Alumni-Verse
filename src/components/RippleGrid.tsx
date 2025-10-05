/**
 * RippleGrid Component
 * Animated background with ripple effect for landing page
 */

import React, { useEffect, useRef } from 'react';

interface RippleGridProps {
  className?: string;
}

export const RippleGrid: React.FC<RippleGridProps> = ({ className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Grid settings
    const gridSize = 50;
    const ripples: Array<{ x: number; y: number; radius: number; maxRadius: number; speed: number }> = [];

    // Create initial ripples
    for (let i = 0; i < 3; i++) {
      ripples.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: 0,
        maxRadius: 200 + Math.random() * 200,
        speed: 0.5 + Math.random() * 1.5,
      });
    }

    // Animation loop
    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw grid
      ctx.strokeStyle = 'rgba(139, 92, 246, 0.1)';
      ctx.lineWidth = 1;

      for (let x = 0; x < canvas.width; x += gridSize) {
        for (let y = 0; y < canvas.height; y += gridSize) {
          // Calculate distance from all ripples
          let totalEffect = 0;
          ripples.forEach(ripple => {
            const dx = x - ripple.x;
            const dy = y - ripple.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const effect = Math.max(0, 1 - Math.abs(distance - ripple.radius) / 50);
            totalEffect += effect;
          });

          // Apply effect to grid point
          const offset = Math.sin(totalEffect * Math.PI) * 10;
          
          ctx.beginPath();
          ctx.arc(x, y + offset, 2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(139, 92, 246, ${0.2 + totalEffect * 0.3})`;
          ctx.fill();
        }
      }

      // Update ripples
      ripples.forEach((ripple, index) => {
        ripple.radius += ripple.speed;
        
        // Reset ripple when it reaches max radius
        if (ripple.radius > ripple.maxRadius) {
          ripples[index] = {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: 0,
            maxRadius: 200 + Math.random() * 200,
            speed: 0.5 + Math.random() * 1.5,
          };
        }

        // Draw ripple
        ctx.strokeStyle = `rgba(139, 92, 246, ${0.3 * (1 - ripple.radius / ripple.maxRadius)})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
        ctx.stroke();
      });

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none ${className}`}
      style={{ background: '#000000' }}
    />
  );
};

export default RippleGrid;
