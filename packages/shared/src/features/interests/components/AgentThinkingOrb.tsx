import type { ReactElement } from 'react';
import React, { useEffect, useRef } from 'react';
import {
  journey,
  markWeight,
  MARK_PADDING,
  placeGrains,
  SPEED,
  VIEW_HEIGHT,
  VIEW_WIDTH,
} from '../thinkingOrb';
import { markAlphas, markPaths } from '../../../svg/logoGeometry';
import { usePrefersReducedMotion } from '../../giveback/useGivebackMotion';

export const AgentThinkingOrb = ({
  size = 20,
  speed = 1,
  className,
}: {
  /** Rendered height in CSS pixels; width follows the mark's aspect. */
  size?: number;
  speed?: number;
  className?: string;
}): ReactElement => {
  const ref = useRef<HTMLCanvasElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const width = Math.round((size * VIEW_WIDTH) / VIEW_HEIGHT);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) {
      return undefined;
    }

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(size * dpr);

    const scale = size / VIEW_HEIGHT;
    const unit = dpr * scale;
    const paths = markPaths.map((d) => new Path2D(d));

    let ink = window.getComputedStyle(canvas).color;
    let frames = 0;

    const frame = (t: number) => {
      // currentColor only changes with the theme, and canvas cannot observe it,
      // so it is polled rather than listened for.
      if (frames % 24 === 0) {
        ink = window.getComputedStyle(canvas).color;
      }
      frames += 1;

      ctx.setTransform(
        unit,
        0,
        0,
        unit,
        unit * MARK_PADDING,
        unit * MARK_PADDING,
      );
      ctx.clearRect(-MARK_PADDING, -MARK_PADDING, VIEW_WIDTH, VIEW_HEIGHT);
      ctx.fillStyle = ink;

      const progress = journey(t);
      const weight = markWeight(progress);

      if (weight > 0) {
        paths.forEach((path, index) => {
          ctx.globalAlpha = weight * markAlphas[index];
          ctx.fill(path);
        });
      }

      placeGrains(t, size, scale).forEach(({ x, y, radius, alpha }) => {
        ctx.globalAlpha = Math.max(0, alpha);
        ctx.beginPath();
        ctx.arc(x, y, Math.max(0.04, radius), 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.globalAlpha = 1;
    };

    const now = () => (performance.now() / 1000) * SPEED * speed;

    if (reducedMotion) {
      // Zero is the resting pose: the mark exactly as it is drawn.
      frame(0);
      return undefined;
    }

    let request = 0;
    let running = false;

    const loop = () => {
      frame(now());
      if (running) {
        request = window.requestAnimationFrame(loop);
      }
    };

    const start = () => {
      if (running) {
        return;
      }
      running = true;
      request = window.requestAnimationFrame(loop);
    };

    const stop = () => {
      running = false;
      window.cancelAnimationFrame(request);
    };

    frame(now());

    let visible = true;
    const observer =
      typeof IntersectionObserver === 'undefined'
        ? undefined
        : new IntersectionObserver(([entry]) => {
            visible = entry.isIntersecting;
            if (visible && document.visibilityState !== 'hidden') {
              start();
            } else {
              stop();
            }
          });

    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        stop();
      } else if (visible) {
        start();
      }
    };

    if (observer) {
      observer.observe(canvas);
    } else {
      start();
    }
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      stop();
      observer?.disconnect();
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [size, speed, width, reducedMotion]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className={className}
      style={{ width, height: size, display: 'block' }}
    />
  );
};
