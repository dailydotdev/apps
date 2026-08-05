/**
 * The daily.dev mark as geometry rather than as a drawing.
 *
 * The thinking indicator paints the logo as a field of dots, which means it
 * needs the mark's outline as measurable points, not as path data. Everything
 * here turns the three brand paths into evenly spaced samples with an
 * arc-length parameter, so a renderer can ask "where is 40% of the way around
 * the slash" and get an answer without touching the DOM.
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

export type Point = [number, number];

type Segment = { cmd: 'M' | 'L' | 'C'; points: Point[] };

const pointsPerCommand: Record<string, number> = { M: 1, L: 1, C: 3 };

const parse = (d: string): Segment[] => {
  const segments: Segment[] = [];

  Array.from(d.matchAll(/([a-zA-Z])([^a-zA-Z]*)/g)).forEach(
    ([, cmd, rawArgs]) => {
      if (cmd === 'Z') {
        return;
      }

      const arity = pointsPerCommand[cmd];
      if (!arity) {
        throw new Error(`logoMark: unsupported path command "${cmd}"`);
      }

      const numbers = rawArgs
        .trim()
        .split(/[\s,]+/)
        .filter(Boolean)
        .map(Number);
      const stride = arity * 2;
      if (!numbers.length || numbers.length % stride) {
        throw new Error(`logoMark: malformed "${cmd}" arguments "${rawArgs}"`);
      }

      for (let i = 0; i < numbers.length; i += stride) {
        const points: Point[] = [];
        for (let j = 0; j < stride; j += 2) {
          points.push([numbers[i + j], numbers[i + j + 1]]);
        }
        segments.push({ cmd: cmd as Segment['cmd'], points });
      }
    },
  );

  return segments;
};

const lerpPoint = (a: Point, b: Point, t: number): Point => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
];

const distance = (a: Point, b: Point): number =>
  Math.hypot(b[0] - a[0], b[1] - a[1]);

const cubicAt = (hull: Point[], t: number): Point => {
  const [p0, p1, p2, p3] = hull;
  const a = lerpPoint(p0, p1, t);
  const b = lerpPoint(p1, p2, t);
  const c = lerpPoint(p2, p3, t);

  return lerpPoint(lerpPoint(a, b, t), lerpPoint(b, c, t), t);
};

// Flatten to a closed polyline. The step is fine enough that treating each
// chord as straight costs less than a tenth of a user unit.
const FLATTEN_STEP = 0.3;

const flatten = (d: string): Point[] => {
  const points: Point[] = [];
  let cursor: Point = [0, 0];

  parse(d).forEach(({ cmd, points: args }) => {
    if (cmd === 'M') {
      [cursor] = args;
      points.push(cursor);
      return;
    }

    if (cmd === 'L') {
      const [end] = args;
      const steps = Math.max(
        1,
        Math.ceil(distance(cursor, end) / FLATTEN_STEP),
      );
      for (let i = 1; i <= steps; i += 1) {
        points.push(lerpPoint(cursor, end, i / steps));
      }
      cursor = end;
      return;
    }

    const hull = [cursor, ...args];
    const hullLength =
      distance(hull[0], hull[1]) +
      distance(hull[1], hull[2]) +
      distance(hull[2], hull[3]);
    const steps = Math.max(2, Math.ceil(hullLength / FLATTEN_STEP));
    for (let i = 1; i <= steps; i += 1) {
      points.push(cubicAt(hull, i / steps));
    }
    [, , cursor] = args;
  });

  // Z closes the shape, so the walk has to come back to where it started.
  points.push(points[0]);

  return points;
};

export type Outline = {
  points: Point[];
  /** Cumulative length at each point, so `u` maps to a position in one search. */
  offsets: number[];
  length: number;
};

const measure = (points: Point[]): Outline => {
  const offsets = [0];
  for (let i = 1; i < points.length; i += 1) {
    offsets.push(offsets[i - 1] + distance(points[i - 1], points[i]));
  }

  return { points, offsets, length: offsets[offsets.length - 1] };
};

export const markOutlines: Outline[] = markPaths.map((d) =>
  measure(flatten(d)),
);

export const markPerimeter = markOutlines.reduce(
  (total, outline) => total + outline.length,
  0,
);

/** Position at `u` (0–1) around a closed outline, wrapping past either end. */
export const pointAtU = (outline: Outline, u: number): Point => {
  const target = (u - Math.floor(u)) * outline.length;

  let low = 0;
  let high = outline.offsets.length - 1;
  while (high - low > 1) {
    const mid = Math.floor((low + high) / 2);
    if (outline.offsets[mid] > target) {
      high = mid;
    } else {
      low = mid;
    }
  }

  const span = outline.offsets[high] - outline.offsets[low] || 1;

  return lerpPoint(
    outline.points[low],
    outline.points[high],
    (target - outline.offsets[low]) / span,
  );
};

export type MarkSample = {
  /** Which of the three strokes this sample belongs to. */
  outline: number;
  /** Where it sits around that stroke, 0–1. */
  u: number;
  home: Point;
  /** Unit vector pointing away from the centre of the mark. */
  out: Point;
};

const centre: Point = [MARK_WIDTH / 2, MARK_HEIGHT / 2];

/**
 * `count` samples spread evenly around the whole mark by arc length, so every
 * stroke gets dots in proportion to how much outline it actually has.
 */
export const sampleMark = (count: number): MarkSample[] => {
  const step = markPerimeter / count;
  const samples: MarkSample[] = [];
  let carry = 0;

  markOutlines.forEach((outline, index) => {
    const taken = Math.max(1, Math.round((outline.length - carry) / step));
    carry = taken * step - outline.length;

    for (let i = 0; i < taken; i += 1) {
      const u = (i + 0.5) / taken;
      const home = pointAtU(outline, u);
      const dx = home[0] - centre[0];
      const dy = home[1] - centre[1];
      const length = Math.hypot(dx, dy) || 1;

      samples.push({
        outline: index,
        u,
        home,
        out: [dx / length, dy / length],
      });
    }
  });

  return samples;
};
