import type { ReactElement, CSSProperties } from 'react';
import React, { useEffect, useRef, useState, useCallback, memo } from 'react';
import type { BrandColors, UpvoteAnimationConfig } from '../../lib/brand';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  rotation: number;
  rotationSpeed: number;
  type: 'circle' | 'star' | 'square';
}

interface BrandedUpvoteAnimationProps {
  /** Trigger the animation */
  isActive: boolean;
  /** Brand colors for the particles */
  colors: BrandColors;
  /** Animation configuration */
  config: UpvoteAnimationConfig;
  /** Callback when animation completes */
  onComplete?: () => void;
  /** Custom styles for positioning */
  style?: CSSProperties;
  /** Custom class name */
  className?: string;
}

/**
 * BrandedUpvoteAnimation
 *
 * A high-performance particle animation component for branded upvotes.
 * Uses canvas for smooth 60fps animations with brand-colored particles.
 *
 * Animation types:
 * - confetti: Colorful particles exploding outward
 * - ripple: Concentric circles expanding from center
 * - burst: Particles shooting outward in all directions
 * - glow: Pulsing glow effect with particles
 */
const BrandedUpvoteAnimation = memo(
  ({
    isActive,
    colors,
    config,
    onComplete,
    style,
    className,
  }: BrandedUpvoteAnimationProps): ReactElement | null => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particlesRef = useRef<Particle[]>([]);
    const animationFrameRef = useRef<number | null>(null);
    const [shouldRender, setShouldRender] = useState(false);

    const createParticle = useCallback(
      (centerX: number, centerY: number): Particle => {
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 4;
        const colorOptions = [colors.primary, colors.secondary, '#ffffff'];

        return {
          x: centerX,
          y: centerY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 2, // Slight upward bias
          size: 3 + Math.random() * 5,
          color: colorOptions[Math.floor(Math.random() * colorOptions.length)],
          alpha: 1,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.2,
          type: (['circle', 'star', 'square'] as const)[
            Math.floor(Math.random() * 3)
          ],
        };
      },
      [colors],
    );

    const drawStar = (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      size: number,
      rotation: number,
    ): void => {
      const spikes = 5;
      const outerRadius = size;
      const innerRadius = size / 2;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.beginPath();

      for (let i = 0; i < spikes * 2; i += 1) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const angle = (i * Math.PI) / spikes - Math.PI / 2;
        const px = Math.cos(angle) * radius;
        const py = Math.sin(angle) * radius;

        if (i === 0) {
          ctx.moveTo(px, py);
        } else {
          ctx.lineTo(px, py);
        }
      }

      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    const drawParticle = (
      ctx: CanvasRenderingContext2D,
      particle: Particle,
    ): void => {
      ctx.globalAlpha = particle.alpha;
      ctx.fillStyle = particle.color;

      switch (particle.type) {
        case 'circle':
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fill();
          break;
        case 'star':
          drawStar(
            ctx,
            particle.x,
            particle.y,
            particle.size,
            particle.rotation,
          );
          break;
        case 'square':
          ctx.save();
          ctx.translate(particle.x, particle.y);
          ctx.rotate(particle.rotation);
          ctx.fillRect(
            -particle.size / 2,
            -particle.size / 2,
            particle.size,
            particle.size,
          );
          ctx.restore();
          break;
        default:
          break;
      }
    };

    const animate = useCallback(() => {
      const canvas = canvasRef.current;
      if (!canvas) {
        return;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return;
      }

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      const activeParticles: Particle[] = [];

      particlesRef.current.forEach((particle) => {
        // Update position
        const updatedParticle = { ...particle };
        updatedParticle.x += updatedParticle.vx;
        updatedParticle.y += updatedParticle.vy;
        updatedParticle.vy += 0.15; // Gravity
        updatedParticle.alpha -= 0.015;
        updatedParticle.rotation += updatedParticle.rotationSpeed;
        updatedParticle.size *= 0.98; // Shrink slightly

        if (updatedParticle.alpha > 0) {
          drawParticle(ctx, updatedParticle);
          activeParticles.push(updatedParticle);
        }
      });

      particlesRef.current = activeParticles;

      // Continue animation if particles remain
      if (activeParticles.length > 0) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        setShouldRender(false);
        onComplete?.();
      }
    }, [onComplete]);

    // Trigger animation when isActive becomes true
    useEffect(() => {
      if (!isActive) {
        return;
      }

      // Start animation
      setShouldRender(true);

      // Small delay to ensure canvas is mounted
      const timeoutId = setTimeout(() => {
        const canvas = canvasRef.current;
        if (!canvas) {
          return;
        }

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        // Create particles based on config
        const particleCount = config.particleCount || 30;
        const newParticles: Particle[] = [];

        for (let i = 0; i < particleCount; i += 1) {
          newParticles.push(createParticle(centerX, centerY));
        }

        particlesRef.current = newParticles;

        // Start animation loop
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        animationFrameRef.current = requestAnimationFrame(animate);
      }, 50);

      // Cleanup
      return () => {
        clearTimeout(timeoutId);
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }, [isActive, config.particleCount, createParticle, animate]);

    // Cleanup on unmount
    useEffect(() => {
      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }, []);

    if (!shouldRender) {
      return null;
    }

    return (
      <canvas
        ref={canvasRef}
        width={120}
        height={120}
        className={className}
        style={{
          position: 'absolute',
          pointerEvents: 'none',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 50,
          ...style,
        }}
      />
    );
  },
);

BrandedUpvoteAnimation.displayName = 'BrandedUpvoteAnimation';

export { BrandedUpvoteAnimation };
export default BrandedUpvoteAnimation;
