import type { ReactElement } from 'react';
import React, { useEffect, useRef } from 'react';
import type { ThinkingOrbState } from '../thinkingOrb';
import {
  dotCount,
  dotRadius,
  MARK_PADDING,
  PARALLAX,
  solidBoost,
  thinkingModes,
  VIEW_HEIGHT,
  VIEW_WIDTH,
} from '../thinkingOrb';
import { markPaths, sampleMark } from '../logoMark';
import { usePrefersReducedMotion } from '../../giveback/useGivebackMotion';

/**
 * The agent's thinking indicator: the daily.dev mark rendered as a live particle
 * field rather than as an animated drawing.
 *
 * A few dozen dots are sampled around the logo's outline and moved every frame
 * by the force field for the current state (see thinkingOrb.ts); the mark itself
 * is painted faintly underneath as the shape they are resolving toward. Depth
 * comes from dot size and alpha only — plain 2D canvas arcs, no filters, no
 * shadows — so it costs almost nothing and looks identical in every browser.
 *
 * The clock is `performance.now()`, shared by every instance, so several orbs on
 * one page move as one system. Instances stop drawing while offscreen or while
 * the tab is hidden, and reduced motion gets a single static frame.
 */
export const AgentThinkingOrb = ({
  state = 'working',
  size = 20,
  speed = 1,
  className,
}: {
  state?: ThinkingOrbState;
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
    const mode = thinkingModes[state];
    const samples = sampleMark(dotCount(size));
    const paths = markPaths.map((d) => new Path2D(d));
    // Radius is chosen in pixels, then expressed in mark units, because the
    // whole context is scaled into the logo's coordinate space.
    const radius = dotRadius(size) / scale;
    const solid = solidBoost(size);

    let ink = window.getComputedStyle(canvas).color;
    let frames = 0;

    const frame = (t: number) => {
      // currentColor only changes when the theme does, so polling it beats
      // listening for it — and it keeps the orb correct inside any container.
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

      ctx.globalAlpha = Math.min(0.8, mode.solid(t) + solid);
      paths.forEach((path) => ctx.fill(path));
      ctx.globalAlpha = 1;

      // Overlays draw in mark units, so a hairline has to be asked for in them.
      ctx.lineWidth = 1 / scale;
      mode.overlay?.(ctx, t, ink);

      // Far to near: the near dots have to land on top of the far ones for the
      // depth to read at all.
      const dots = samples
        .map((sample, index) => mode.place(sample, index, t))
        .sort((a, b) => a.z - b.z);

      dots.forEach(({ x, y, z, glow }) => {
        const depth = (z + 1) / 2;
        ctx.globalAlpha = Math.min(1, 0.26 + depth * 0.4 + glow * 0.55);
        ctx.beginPath();
        ctx.arc(
          x + z * PARALLAX,
          y - z * PARALLAX * 0.5,
          radius * (0.55 + depth * 0.7 + glow * 0.6),
          0,
          Math.PI * 2,
        );
        ctx.fill();
      });

      ctx.globalAlpha = 1;
    };

    const now = () => (performance.now() / 1000) * speed;

    if (reducedMotion) {
      frame(1.6);
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
  }, [state, size, speed, width, reducedMotion]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className={className}
      style={{ width, height: size, display: 'block' }}
    />
  );
};
