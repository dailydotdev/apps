import { hashSeed } from './cover';

// A generated cover is a dark field, a glow and one family of shapes, all
// chosen from the post id so the same post always paints the same cover and
// two posts from one source never paint the same one. Coordinates are in the
// 100 by 53 viewBox the cover's SVG uses.

export type CoverShape =
  | {
      kind: 'line';
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      width: number;
      opacity: number;
      rotate: number;
    }
  | {
      kind: 'ring';
      cx: number;
      cy: number;
      r: number;
      width: number;
      opacity: number;
    }
  | { kind: 'dot'; cx: number; cy: number; r: number; opacity: number }
  | {
      kind: 'block';
      x: number;
      y: number;
      width: number;
      height: number;
      opacity: number;
      rotate: number;
    };

export interface CoverPattern {
  family: 'hatch' | 'rings' | 'halftone' | 'blocks';
  glow: { cx: number; cy: number };
  shapes: CoverShape[];
}

export const COVER_WIDTH = 100;
export const COVER_HEIGHT = 53;

// A linear congruential generator: tiny, deterministic, and plenty for
// picking shape positions. Plain arithmetic, so the lint's no-bitwise holds.
const createRandom = (seed: number): (() => number) => {
  let state = seed % 4294967296 || 1;

  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;

    return state / 4294967296;
  };
};

const round = (value: number): number => Math.round(value * 100) / 100;

const families: CoverPattern['family'][] = [
  'hatch',
  'rings',
  'halftone',
  'blocks',
];

export const buildCoverPattern = (seed: string): CoverPattern => {
  const random = createRandom(hashSeed(seed) * 2654435761 || 1);
  const family = families[Math.floor(random() * families.length)];
  const shapes: CoverShape[] = [];

  if (family === 'hatch') {
    const rotate = round(-35 + random() * 70);
    const count = 14 + Math.floor(random() * 10);
    for (let i = 0; i < count; i += 1) {
      const x = -40 + i * (180 / count) + random() * 3;
      shapes.push({
        kind: 'line',
        x1: round(x),
        y1: -10,
        x2: round(x + 30),
        y2: 70,
        width: round(0.6 + random() * 1.6),
        opacity: round(0.18 + random() * 0.3),
        rotate,
      });
    }
  } else if (family === 'rings') {
    const cx = random() > 0.5 ? COVER_WIDTH : 0;
    const cy = random() > 0.5 ? COVER_HEIGHT : 0;
    const count = 6 + Math.floor(random() * 5);
    for (let i = 1; i <= count; i += 1) {
      shapes.push({
        kind: 'ring',
        cx,
        cy,
        r: round(i * (7 + random() * 5)),
        width: round(0.8 + random() * 2),
        opacity: round(0.12 + random() * 0.3),
      });
    }
  } else if (family === 'halftone') {
    const towardRight = random() > 0.5;
    const towardBottom = random() > 0.5;
    const step = 6 + random() * 3;
    for (let x = 3; x < COVER_WIDTH; x += step) {
      for (let y = 3; y < COVER_HEIGHT; y += step) {
        const dx = (towardRight ? COVER_WIDTH - x : x) / COVER_WIDTH;
        const dy = (towardBottom ? COVER_HEIGHT - y : y) / COVER_HEIGHT;
        const r = Math.max(0, 2.6 - Math.hypot(dx, dy) * 3.2);
        if (r > 0.15) {
          shapes.push({
            kind: 'dot',
            cx: round(x),
            cy: round(y),
            r: round(r),
            opacity: round(0.3 + random() * 0.25),
          });
        }
      }
    }
  } else {
    const count = 7 + Math.floor(random() * 7);
    for (let i = 0; i < count; i += 1) {
      const width = 6 + random() * 28;
      const height = 4 + random() * 16;
      shapes.push({
        kind: 'block',
        x: round(random() * COVER_WIDTH - width / 2),
        y: round(random() * COVER_HEIGHT - height / 2),
        width: round(width),
        height: round(height),
        opacity: round(0.1 + random() * 0.28),
        rotate: round(-12 + random() * 24),
      });
    }
  }

  return {
    family,
    glow: { cx: round(10 + random() * 80), cy: random() > 0.5 ? 110 : -10 },
    shapes,
  };
};
