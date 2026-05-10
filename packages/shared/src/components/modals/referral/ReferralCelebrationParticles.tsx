import type { ReactElement } from 'react';
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseVx: number;
  baseVy: number;
  baseSize: number;
  baseAlpha: number;
  size: number;
  baseColor: string;
  partyColor: string;
  alpha: number;
  rotation: number;
  rotationSpeed: number;
  energy: number;
}

export interface ReferralCelebrationParticlesHandle {
  celebrate: () => void;
}

const BASE_COLORS = [
  'rgb(206, 61, 245)',
  'rgb(151, 87, 215)',
  'rgb(91, 192, 235)',
  'rgb(255, 255, 255)',
];

const PARTY_COLORS = [
  'rgb(255, 78, 196)',
  'rgb(255, 209, 71)',
  'rgb(102, 224, 130)',
  'rgb(91, 192, 235)',
  'rgb(206, 61, 245)',
  'rgb(255, 145, 77)',
];

const AMBIENT_COUNT = 50;
const ENERGY_DECAY = 0.985;
const SPEED_BOOST = 5;
const JITTER_STRENGTH = 0.6;

const random = (min: number, max: number): number =>
  min + Math.random() * (max - min);

const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const createAmbientParticle = (width: number, height: number): Particle => {
  const baseVx = random(-0.25, 0.25);
  const baseVy = random(-0.55, -0.15);
  const baseSize = random(2, 3.6);
  const baseAlpha = random(0.5, 0.8);
  return {
    x: Math.random() * width,
    y: Math.random() * height,
    vx: baseVx,
    vy: baseVy,
    baseVx,
    baseVy,
    baseSize,
    baseAlpha,
    size: baseSize,
    baseColor: pick(BASE_COLORS),
    partyColor: pick(PARTY_COLORS),
    alpha: baseAlpha,
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: 0,
    energy: 0,
  };
};

const drawParticle = (ctx: CanvasRenderingContext2D, p: Particle): void => {
  ctx.globalAlpha = Math.min(1, Math.max(0, p.alpha));
  ctx.fillStyle = p.energy > 0.15 ? p.partyColor : p.baseColor;
  if (p.energy > 0.25) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
    ctx.restore();
    return;
  }
  ctx.beginPath();
  ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
  ctx.fill();
};

export const ReferralCelebrationParticles = forwardRef<
  ReferralCelebrationParticlesHandle
>((_, ref): ReactElement => {
  const anchorRef = useRef<HTMLSpanElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number | null>(null);
  const sizeRef = useRef({ width: 0, height: 0 });
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);

  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const dpr = window.devicePixelRatio || 1;
    const width = window.innerWidth;
    const height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    const ctx = canvas.getContext('2d');
    ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
    sizeRef.current = { width, height };
  }, []);

  const tick = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) {
      return;
    }
    const { width, height } = sizeRef.current;
    ctx.clearRect(0, 0, width, height);

    particlesRef.current.forEach((p) => {
      const next = p;

      const speedMultiplier = 1 + next.energy * SPEED_BOOST;
      next.vx = next.baseVx * speedMultiplier;
      next.vy = next.baseVy * speedMultiplier;

      if (next.energy > 0) {
        next.vx += random(-JITTER_STRENGTH, JITTER_STRENGTH) * next.energy;
        next.vy += random(-JITTER_STRENGTH, JITTER_STRENGTH) * next.energy;
        next.rotation += next.rotationSpeed;
        next.energy *= ENERGY_DECAY;
      }

      next.x += next.vx;
      next.y += next.vy;

      next.size = next.baseSize * (1 + next.energy * 0.6);
      next.alpha = Math.min(1, next.baseAlpha + next.energy * 0.3);

      if (next.y < -10) {
        next.x = Math.random() * width;
        next.y = height + 10;
      } else if (next.y > height + 20) {
        next.x = Math.random() * width;
        next.y = -10;
      }
      if (next.x < -10) {
        next.x = width + 10;
      } else if (next.x > width + 10) {
        next.x = -10;
      }

      drawParticle(ctx, next);
    });

    rafRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    const overlay = anchorRef.current?.closest<HTMLElement>(
      '.ReactModal__Overlay',
    );
    if (!overlay) {
      setPortalTarget(document.body);
      return undefined;
    }
    const wrapper = document.createElement('div');
    wrapper.dataset.particlesPortal = 'true';
    overlay.prepend(wrapper);
    setPortalTarget(wrapper);
    return () => {
      wrapper.remove();
    };
  }, []);

  useEffect(() => {
    if (!portalTarget) {
      return undefined;
    }
    resize();
    const { width, height } = sizeRef.current;
    particlesRef.current = Array.from({ length: AMBIENT_COUNT }, () =>
      createAmbientParticle(width, height),
    );
    rafRef.current = requestAnimationFrame(tick);
    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('resize', resize);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [portalTarget, resize, tick]);

  useImperativeHandle(
    ref,
    () => ({
      celebrate: () => {
        particlesRef.current.forEach((p) => {
          const next = p;
          next.energy = 1;
          next.partyColor = pick(PARTY_COLORS);
          next.rotationSpeed = random(-0.4, 0.4);
        });
      },
    }),
    [],
  );

  const canvas = (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[1]"
    />
  );

  return (
    <>
      <span ref={anchorRef} aria-hidden className="hidden" />
      {portalTarget ? createPortal(canvas, portalTarget) : null}
    </>
  );
});

ReferralCelebrationParticles.displayName = 'ReferralCelebrationParticles';
