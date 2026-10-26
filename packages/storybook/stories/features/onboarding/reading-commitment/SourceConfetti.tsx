import type { ReactElement } from 'react';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

// Real source logos from daily.dev, so the burst reads as "your feed".
const LOGOS = [
  'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/devto',
  'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/hn',
  'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/react_js',
  'https://media.daily.dev/image/upload/t_logo,f_auto/v1628412854/logos/freecodecamp',
  'https://media.daily.dev/image/upload/s--75ndqrkr--/f_auto,t_logo/v1702882094/logos/fireship.jpg',
  'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/aws',
  'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/react_native',
  'https://media.daily.dev/image/upload/s--3luD3Wei--/f_auto/v1714800008/logos/duckdb',
  'https://media.daily.dev/image/upload/s--65EDghou--/f_auto/v1724339118/logos/neontech',
  'https://media.daily.dev/image/upload/s---oEn9czC--/f_auto/v1716187892/logos/socketdev',
  'https://media.daily.dev/image/upload/s--2Z0xk_Ia--/f_auto,q_auto/v1780213485/logos/jetbrains-dotnet?_a=BAMAMiWQ0',
  'https://media.daily.dev/image/upload/s--8Aro536C--/f_auto,q_auto/v1773839403/logos/golang_digest?_a=BAMAMiiu0',
];

/** Air drag, per second: the blast slows a little but never stops on screen. */
const DRAG = 0.3;
/** Seconds the burst runs; by then every piece is past the screen edge. */
const LIFE = 5;
/** Where a still holds the burst: a ring of logos around the goal. */
const FROZEN_AT = 0.5;

// Seeded, so every run and every still is the same blast.
const random = (() => {
  let seed = 11;
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
})();

const COUNT = 28;

const PIECES = Array.from({ length: COUNT }, (_, index) => {
  // Every direction, evenly spread with a little jitter so it isn't a clock.
  const angle = (index / COUNT) * Math.PI * 2 + (random() - 0.5) * 0.35;
  const speed = 230 + random() * 200;
  return {
    id: index,
    logo: LOGOS[index % LOGOS.length],
    size: 1.3 + random() * 1,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    spin: (random() - 0.5) * 720,
    // A wobble phase, not a full flip: a logo seen edge-on reads as a line.
    flip: random() * Math.PI * 2,
    // Some fly "toward" the viewer and grow; others stay flat.
    growth: random() * 0.9,
    delay: random() * 0.1,
  };
});

type Piece = (typeof PIECES)[number];

// Distance covered under linear drag, in closed form: no stepping needed.
const travel = (velocity: number, time: number): number =>
  (velocity * (1 - Math.exp(-DRAG * time))) / DRAG;

const styleAt = (
  piece: Piece,
  time: number,
): { transform: string; opacity: string } => {
  const age = Math.max(0, time - piece.delay);
  const scale = Math.min(1, age / 0.08) * (1 + piece.growth * 0.5 * age);

  return {
    transform: `translate(-50%, -50%) translate(${travel(
      piece.vx,
      age,
    )}px, ${travel(piece.vy, age)}px) rotate(${
      piece.spin * 0.4 * age
    }deg) rotateY(${Math.sin(age * 2.5 + piece.flip) * 35}deg) scale(${scale})`,
    opacity: age > 0 ? '1' : '0',
  };
};

/**
 * Source logos blasting out of the goal ring in every direction, off past
 * the screen's edges. Drawn on a screen-sized layer, so nothing it flings
 * stretches the page. `isFrozen` holds it mid-blast, for stills.
 */
export const SourceConfetti = ({
  isFrozen,
}: {
  isFrozen?: boolean;
}): ReactElement => {
  const anchor = useRef<HTMLSpanElement>(null);
  const pieces = useRef<Array<HTMLImageElement | null>>([]);
  const [origin, setOrigin] = useState<{ left: number; top: number }>();

  // The layer covers the screen; the burst starts where the anchor sits.
  useLayoutEffect(() => {
    const rect = anchor.current?.getBoundingClientRect();
    if (rect) {
      setOrigin({ left: rect.left, top: rect.top });
    }
  }, []);

  useEffect(() => {
    if (!origin) {
      return undefined;
    }
    const paint = (time: number) =>
      PIECES.forEach((piece, index) => {
        const element = pieces.current[index];
        if (element) {
          Object.assign(element.style, styleAt(piece, time));
        }
      });

    if (isFrozen) {
      paint(FROZEN_AT);
      return undefined;
    }
    if (globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      return undefined;
    }

    let start: number | undefined;
    let frame = 0;
    const tick = (now: number) => {
      start ??= now;
      const time = (now - start) / 1000;
      paint(time);
      if (time < LIFE) {
        frame = window.requestAnimationFrame(tick);
      }
    };
    frame = window.requestAnimationFrame(tick);

    return () => window.cancelAnimationFrame(frame);
  }, [isFrozen, origin]);

  // Portaled to the body: an animating transform or filter on any parent
  // would otherwise turn this screen-sized layer into one the parent's size.
  const layer = (
    <span
      aria-hidden
      className="pointer-events-none fixed inset-0 z-2 overflow-hidden"
      style={{ perspective: '40rem' }}
    >
      {origin &&
        PIECES.map(({ id, logo, size }, index) => (
          <img
            key={id}
            ref={(element) => {
              pieces.current[index] = element;
            }}
            src={logo}
            alt=""
            className="absolute max-w-none rounded-full border-2 border-background-default bg-background-default shadow-2"
            style={{
              left: origin.left,
              top: origin.top,
              width: `${size}rem`,
              height: `${size}rem`,
              opacity: 0,
              willChange: 'transform',
            }}
          />
        ))}
    </span>
  );

  return (
    <span ref={anchor} aria-hidden className="absolute left-1/2 top-1/2">
      {origin && createPortal(layer, document.body)}
    </span>
  );
};
