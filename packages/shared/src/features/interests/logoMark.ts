/**
 * The daily.dev mark as geometry rather than as a drawing.
 *
 * The thinking indicator breaks the logo into a few hundred grains and flies
 * them out onto a sphere, so what it needs from the mark is its *interior* as
 * points, not its outline as path data.
 *
 * Path geometry is copied verbatim from svg/LogoIcon.tsx.
 */
export const MARK_WIDTH = 35;
export const MARK_HEIGHT = 20;

export const leftChevron =
  'M16.28 6.18864L13.4275 9.04718L9.62342 5.23514L4.86849 10L8.67256 13.8121L6.77152 17.6228L0.590647 11.429C-0.196882 10.6398 -0.196882 9.36026 0.590647 8.57108L8.1978 0.948006C8.98533 0.158828 10.2625 0.158497 11.05 0.947675L16.28 6.18864Z';
export const slash =
  'M23.4118 0.947675C24.1993 0.158497 25.4765 0.158828 26.264 0.948006L27.6903 2.37727L11.05 19.0524C10.2625 19.8415 8.98533 19.8412 8.1978 19.052L6.77152 17.6228L23.4118 0.947675Z';
export const rightTail =
  'M29.5925 9.99823L25.7884 6.1862L27.6895 2.37549L33.8703 8.5693C34.6579 9.35848 34.6579 10.638 33.8703 11.4272L26.2629 19.0506C25.4753 19.8398 24.1985 19.8398 23.411 19.0506C22.6234 18.2614 22.6234 16.9819 23.411 16.1927L29.5925 9.99823Z';

export const markPaths = [leftChevron, slash, rightTail];

/** The tail carries fillOpacity 0.64 in the real mark; the indicator keeps it. */
export const markRingAlpha = [1, 1, 0.64];

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
