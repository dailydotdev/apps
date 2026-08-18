import { markPaths, MARK_HEIGHT, MARK_WIDTH } from '../../svg/logoGeometry';

export type Grain = {
  x: number;
  y: number;
  // Which of the three strokes this grain fell inside.
  ring: number;
};

let probe: CanvasRenderingContext2D | undefined;
let shapes: Path2D[] | undefined;
const byStep = new Map<string, Grain[]>();

// Ordered around the centre rather than scanned in rows, so neighbouring grains
// set off towards neighbouring places on the sphere. Cached per step: sampling
// needs a canvas and hundreds of point-in-path tests cannot run every frame.
export const markGrains = (step: number): Grain[] => {
  const key = step.toFixed(3);
  const cached = byStep.get(key);
  if (cached) {
    return cached;
  }

  if (!probe) {
    probe = document.createElement('canvas').getContext('2d') ?? undefined;
    shapes = markPaths.map((d) => new Path2D(d));
  }

  if (!probe || !shapes) {
    throw new Error('logoMark: sampling the mark needs a 2d canvas context');
  }

  // Held locally because the narrowing above does not survive into a closure.
  const ctx = probe;
  const outlines = shapes;

  const grains: Grain[] = [];
  for (let y = step / 2; y < MARK_HEIGHT; y += step) {
    for (let x = step / 2; x < MARK_WIDTH; x += step) {
      const ring = outlines.findIndex((shape) =>
        ctx.isPointInPath(shape, x, y),
      );
      if (ring >= 0) {
        grains.push({ x, y, ring });
      }
    }
  }

  const centreX = MARK_WIDTH / 2;
  const centreY = MARK_HEIGHT / 2;
  grains.sort(
    (a, b) =>
      Math.atan2(a.y - centreY, a.x - centreX) -
      Math.atan2(b.y - centreY, b.x - centreX),
  );

  byStep.set(key, grains);

  return grains;
};
