import { markPaths, MARK_HEIGHT, MARK_WIDTH } from '../../svg/logoGeometry';

/**
 * The daily.dev mark as points rather than as a drawing.
 *
 * The thinking indicator breaks the logo into a few hundred grains and flies
 * them out onto a sphere, so what it needs from the mark is its *interior* as
 * points, not its outline as path data. The geometry itself comes from
 * `svg/logoGeometry`, which the logo draws from too.
 */

export type Grain = {
  x: number;
  y: number;
  /** Which of the three strokes this grain fell inside. */
  ring: number;
};

let probe: CanvasRenderingContext2D | undefined;
let shapes: Path2D[] | undefined;
const byStep = new Map<string, Grain[]>();

/**
 * One point per cell of a square grid laid over the mark, keeping only the
 * cells that land inside one of the three strokes.
 *
 * Ordered around the centre rather than scanned in rows, so that grains
 * sitting near each other set off towards neighbouring places on the sphere
 * and the crowd does not turn itself inside out on the way.
 *
 * Built on first use and cached per step: it needs a canvas to ask the paths
 * what is inside them, and a few hundred point-in-path tests is not something
 * to repeat every frame.
 */
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
