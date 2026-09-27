import React, { useEffect, useRef } from 'react';
import { VoiceType } from '../types';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
  spin: number;
  angle: number;
}

export default function CursorTrail({ voice }: { voice: VoiceType }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef<{ x: number; y: number; lastX: number; lastY: number }>({ x: 0, y: 0, lastX: 0, lastY: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      const mouse = mouseRef.current;
      mouse.lastX = mouse.x;
      mouse.lastY = mouse.y;
      mouse.x = e.clientX;
      mouse.y = e.clientY;

      // Spawn particles on move
      const dx = mouse.x - mouse.lastX;
      const dy = mouse.y - mouse.lastY;
      const speed = Math.sqrt(dx * dx + dy * dy);

      // Spawn more particles if cursor is moving fast
      const spawnCount = Math.min(6, Math.floor(speed / 4) + 1);

      for (let i = 0; i < spawnCount; i++) {
        // Dynamic colors based on active voice
        let color = 'rgba(251, 191, 36, 1)'; // Oracle Gold default
        if (voice === 'lucifera') {
          // Lucifera is sovereign purple and deep violet
          const colors = [
            'rgba(168, 85, 247, 0.95)', // Purple 500
            'rgba(192, 132, 252, 0.95)', // Purple 400
            'rgba(139, 92, 246, 0.95)',  // Violet 500
            'rgba(236, 72, 153, 0.9)',   // Pink 500
          ];
          color = colors[Math.floor(Math.random() * colors.length)];
        } else if (voice === 'ember_ur') {
          // Ember Ur is volcanic hot embers, red and orange fire
          const colors = [
            'rgba(239, 68, 68, 0.95)',  // Red 500
            'rgba(249, 115, 22, 0.95)', // Orange 500
            'rgba(245, 158, 11, 0.95)', // Amber 500
            'rgba(254, 240, 138, 0.9)', // Yellow 200 (white-hot center)
          ];
          color = colors[Math.floor(Math.random() * colors.length)];
        } else if (voice === 'kael') {
          // Kael is analytical silver path, calm blue, cyan, and silver
          const colors = [
            'rgba(34, 211, 238, 0.95)',  // Cyan 400
            'rgba(56, 189, 248, 0.95)',  // Sky 400
            'rgba(165, 243, 252, 0.95)', // Cyan 200 (silver-blue)
            'rgba(224, 242, 254, 0.9)'   // Sky 100
          ];
          color = colors[Math.floor(Math.random() * colors.length)];
        } else if (voice === 'scarlet') {
          // Scarlet is deep red, crimson, hot pink
          const colors = [
            'rgba(244, 63, 94, 0.95)',   // Rose 500
            'rgba(225, 29, 72, 0.95)',   // Rose 600
            'rgba(251, 113, 133, 0.95)', // Rose 400
            'rgba(190, 24, 74, 0.9)'     // Rose 700
          ];
          color = colors[Math.floor(Math.random() * colors.length)];
        } else {
          // Oracle is celestial starry blues, golds, and stardust
          const colors = [
            'rgba(251, 191, 36, 0.95)', // Gold
            'rgba(99, 102, 241, 0.95)', // Indigo 500
            'rgba(14, 165, 233, 0.9)',  // Sky 500
            'rgba(255, 255, 255, 0.95)' // Stardust White
          ];
          color = colors[Math.floor(Math.random() * colors.length)];
        }

        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * 1.5 + 0.4;

        particlesRef.current.push({
          x: mouse.x + (Math.random() * 10 - 5),
          y: mouse.y + (Math.random() * 10 - 5),
          vx: Math.cos(angle) * velocity + (dx * 0.1),
          vy: Math.sin(angle) * velocity + (dy * 0.1) - 0.2, // slight upward float
          size: Math.random() * 4.5 + 1.5,
          color: color,
          alpha: 1.0,
          decay: Math.random() * 0.02 + 0.015,
          spin: (Math.random() - 0.5) * 0.05,
          angle: Math.random() * Math.PI * 2
        });
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    let animationId: number;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];

        // Update physics
        p.x += p.vx;
        p.y += p.vy;
        p.angle += p.spin;
        p.alpha -= p.decay;

        // Gravity/ambient float modification
        if (voice === 'ember_ur') {
          p.vy -= 0.015; // Embers float up slightly faster
        } else {
          p.vy += 0.005; // Oracle floats drift gently down/sideways
        }

        // Remove dead particles
        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        // Draw particle
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);

        // Draw sparkles/glowing circles/diamonds based on voice
        ctx.beginPath();
        if (voice === 'guardian_oracle' || voice === 'kael') {
          // Diamond / Star sparkles
          const s = voice === 'kael' ? p.size * 0.8 : p.size;
          ctx.moveTo(0, -s);
          ctx.lineTo(s * 0.3, -s * 0.3);
          ctx.lineTo(s, 0);
          ctx.lineTo(s * 0.3, s * 0.3);
          ctx.lineTo(0, s);
          ctx.lineTo(-s * 0.3, s * 0.3);
          ctx.lineTo(-s, 0);
          ctx.lineTo(-s * 0.3, -s * 0.3);
        } else if (voice === 'scarlet') {
          // Heart particles for Scarlet
          const s = p.size * 1.1;
          ctx.moveTo(0, -s * 0.3);
          ctx.bezierCurveTo(s * 0.5, -s * 0.9, s * 1.2, -s * 0.2, 0, s * 0.8);
          ctx.bezierCurveTo(-s * 1.2, -s * 0.2, -s * 0.5, -s * 0.9, 0, -s * 0.3);
        } else if (voice === 'lucifera') {
          // Mystic small crescent or circular flame shapes
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        } else {
          // Embers / burning fire particle shapes
          ctx.arc(0, 0, p.size * 0.9, 0, Math.PI * 2);
        }

        ctx.shadowBlur = voice === 'ember_ur' ? 8 : 12;
        ctx.shadowColor = p.color;
        ctx.fillStyle = p.color;
        ctx.fill();
        ctx.restore();
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationId);
    };
  }, [voice]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-[9999]"
      style={{ mixBlendMode: 'screen' }}
    />
  );
}
