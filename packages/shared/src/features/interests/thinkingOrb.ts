import type { Grain } from './logoMark';
import { markGrains } from './logoMark';
import { markAlphas, MARK_HEIGHT, MARK_WIDTH } from '../../svg/logoGeometry';

export const MARK_PADDING = 4;
export const VIEW_WIDTH = MARK_WIDTH + MARK_PADDING * 2;
export const VIEW_HEIGHT = MARK_HEIGHT + MARK_PADDING * 2;

const CENTRE_X = MARK_WIDTH / 2;
const CENTRE_Y = MARK_HEIGHT / 2;

// Seconds of indicator time for one trip out to the globe and back.
const CYCLE = 4.4;

export const SPEED = 1.25;

// Device pixels, unlike everything else here, which is in the mark's own units.
const DOT_PX = 0.5;
const DENSITY = 1.8;
const GLOBE_RADIUS = 8.4;
const DEPTH_FADE = 2.4;

// Eye distance for the perspective divide, not an angle.
const FOV = 26;
const TILT = 0.34;
const SPIN_RATE = 0.85;

const fract = (v: number): number => v - Math.floor(v);
const smooth = (v: number): number => v * v * (3 - 2 * v);
const lerp = (a: number, b: number, f: number): number => a + (b - a) * f;

// Underdamped step: leaves 0, overshoots once, settles on 1.
const settle = (p: number): number =>
  p <= 0 ? 0 : 1 - Math.exp(-7 * p) * Math.cos(6.5 * p);

// Coarsens as the indicator shrinks so each grain keeps the same weight on
// screen: 20px cannot hold 300 grains without them turning to mush.
const gridStep = (size: number): number =>
  Math.min(3.2, Math.max(0.7, (0.8 + 32 / size) / DENSITY));

// Past half the cell diagonal: at exactly half, neighbouring discs only kiss
// and the shape they make comes out scalloped.
const restRadius = (step: number): number => step * 0.86;

// 0 is the mark, 1 is the globe.
export const journey = (t: number): number => {
  const c = fract(t / CYCLE);

  if (c < 0.2) {
    return smooth(c / 0.2);
  }

  if (c < 0.76) {
    return 1;
  }

  // The spring carries the return a little past the mark, hence the floor.
  return Math.max(-0.12, 1 - settle((c - 0.76) / 0.24));
};

// The vector path carries the first moment and the grains grow in behind it on
// a different curve, so the two never add up to less than they started with.
const DISSOLVE = 0.14;

export const markWeight = (f: number): number =>
  1 - Math.min(1, Math.max(0, f) / DISSOLVE) ** 2;

const grainScale = (f: number): number =>
  Math.sqrt(Math.min(1, Math.max(0, f) / DISSOLVE));

// Golden angle: successive indices land far apart, spreading evenly over a
// sphere.
const GOLDEN = Math.PI * (3 - Math.sqrt(5));

const hash = (i: number): number =>
  fract(Math.sin(i * 127.1 + 3.7) * 43758.5453);

// A share of a grain's own cycle, not seconds.
const SPARK_WINDOW = 0.16;
const SPARK_RATE = 0.35;

type Spark = {
  reach: number;
  size: number;
  alpha: number;
};

const spark = (index: number, t: number): Spark => {
  const own = fract(t * SPARK_RATE + hash(index));
  const jump =
    own < SPARK_WINDOW ? Math.sin((own / SPARK_WINDOW) * Math.PI) : 0;

  return {
    reach: 1 + jump * 0.34,
    size: 1 + jump * 0.8,
    // The resting field sits under full strength so a spark can brighten.
    alpha: 0.6 + jump * 0.4,
  };
};

type PlacedGrain = {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  depth: number;
};

// `scale` is px per mark unit, the only thing that converts DOT_PX into the
// mark's units.
export const placeGrains = (
  t: number,
  size: number,
  scale: number,
): PlacedGrain[] => {
  const step = gridStep(size);
  const grains: Grain[] = markGrains(step);
  const rest = restRadius(step);
  const tip = DOT_PX / scale;

  const f = journey(t);
  const grow = grainScale(f);

  const spin = t * SPIN_RATE;
  const cosSpin = Math.cos(spin);
  const sinSpin = Math.sin(spin);
  const cosTilt = Math.cos(TILT);
  const sinTilt = Math.sin(TILT);
  const count = grains.length;

  const placed = grains.map((grain, index) => {
    const lat = 1 - (index / Math.max(1, count - 1)) * 2;
    const ring = Math.sqrt(Math.max(0, 1 - lat * lat));
    const lon = index * GOLDEN;
    const thrown = spark(index, t);
    const reach = GLOBE_RADIUS * thrown.reach;

    const x = Math.cos(lon) * ring * reach;
    const y = lat * reach;
    const z = Math.sin(lon) * ring * reach;

    const spunX = x * cosSpin + z * sinSpin;
    const spunZ = z * cosSpin - x * sinSpin;
    const tiltedY = y * cosTilt - spunZ * sinTilt;
    const tiltedZ = y * sinTilt + spunZ * cosTilt;
    const depth = FOV / (FOV + tiltedZ);

    return {
      x: lerp(grain.x, CENTRE_X + spunX * depth, f),
      y: lerp(grain.y, CENTRE_Y + tiltedY * depth, f),
      radius: lerp(rest, tip * depth * thrown.size, f) * grow,
      alpha:
        markAlphas[grain.ring] *
        lerp(1, Math.min(1, depth ** DEPTH_FADE) * thrown.alpha, f),
      depth,
    };
  });

  // Far grains first, or a small far dot punches a hole in a near one.
  placed.sort((a, b) => a.depth - b.depth);

  return placed;
};
