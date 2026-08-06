import type { Grain } from './logoMark';
import { MARK_HEIGHT, MARK_WIDTH, markGrains, markRingAlpha } from './logoMark';

/**
 * The motion behind the agent's thinking indicator.
 *
 * The mark breaks into a few hundred grains, they fly out and take up station
 * on a slowly turning sphere, a wave travels through the surface while they
 * wait there, and then they come home and reassemble. Rendering lives in
 * components/AgentThinkingOrb.tsx; everything here is arithmetic.
 */

/** Room around the mark for the globe and for the wave that lifts off it. */
export const MARK_PADDING = 4;
export const VIEW_WIDTH = MARK_WIDTH + MARK_PADDING * 2;
export const VIEW_HEIGHT = MARK_HEIGHT + MARK_PADDING * 2;

const CENTRE_X = MARK_WIDTH / 2;
const CENTRE_Y = MARK_HEIGHT / 2;

/** One trip out to the globe and back, in seconds of indicator time. */
const CYCLE = 4.4;

/** Indicator time runs faster than the clock. Chosen by eye against the real size. */
export const SPEED = 1.25;

/*
 * The "Mist" weight: the finest of the densities we compared. Dot size is
 * asked for in device pixels so a grain looks the same however large the
 * indicator is drawn; everything else is in the mark's own units.
 */
const DOT_PX = 0.5;
const DENSITY = 1.8;
const GLOBE_RADIUS = 8.4;
/** How hard the far side of the sphere fades out. */
const DEPTH_FADE = 2.4;

/** Eye distance for the perspective divide. */
const FOV = 26;
/** Pole tipped towards the viewer, so you see over the top of the sphere. */
const TILT = 0.34;
const SPIN_RATE = 0.85;

const fract = (v: number): number => v - Math.floor(v);
const smooth = (v: number): number => v * v * (3 - 2 * v);
const lerp = (a: number, b: number, f: number): number => a + (b - a) * f;

/** Underdamped step: leaves 0, overshoots once, settles on 1. */
const settle = (p: number): number =>
  p <= 0 ? 0 : 1 - Math.exp(-7 * p) * Math.cos(6.5 * p);

/**
 * Twenty pixels cannot hold three hundred grains — they stop reading as dots
 * and turn to mush — so the grid coarsens as the indicator shrinks and each
 * grain keeps roughly the same weight on screen.
 */
export const gridStep = (size: number): number =>
  Math.min(3.2, Math.max(0.7, (0.8 + 32 / size) / DENSITY));

/**
 * Comfortably past half the cell diagonal. At exactly half, neighbouring
 * discs only kiss and the shape they make comes out scalloped.
 */
const restRadius = (step: number): number => step * 0.86;

/** 0 is the mark, 1 is the globe. */
export const journey = (t: number): number => {
  const c = fract(t / CYCLE);

  if (c < 0.2) {
    return smooth(c / 0.2);
  }

  if (c < 0.76) {
    return 1;
  }

  // The return lands on a spring, which carries it a little past the mark.
  return Math.max(-0.12, 1 - settle((c - 0.76) / 0.24));
};

/*
 * At rest the mark is its own vector path, not a mound of overlapping discs.
 * Discs wide enough to leave no holes also spill about a third of the mark's
 * area past its edge, which is exactly what makes a grain field look bloated
 * and scruffy sitting still. So the path carries the first moment and the
 * grains grow in behind it as it leaves — on a different curve, so that the
 * two together never add up to less than they started with.
 */
const DISSOLVE = 0.14;

/** Weight of the real logo underneath the grains. */
export const markWeight = (f: number): number =>
  1 - Math.min(1, Math.max(0, f) / DISSOLVE) ** 2;

const grainScale = (f: number): number =>
  Math.sqrt(Math.min(1, Math.max(0, f) / DISSOLVE));

/** Evenly spread over a sphere; successive indices land far apart. */
const GOLDEN = Math.PI * (3 - Math.sqrt(5));

/**
 * A narrow band of raised grain travelling from one pole to the other.
 *
 * The sphere itself never changes size — only the band moves — which is what
 * makes it read as something passing through rather than the whole thing
 * breathing.
 */
const pulse = (y: number, t: number): number => {
  const front = fract(t * 0.42) * 2.5 - 1.25;
  const gap = y - front;

  return 1 + Math.exp(-(gap * gap) / 0.045) * 0.44;
};

export type PlacedGrain = {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  /** Perspective scale, and so the sort key: smaller is further away. */
  depth: number;
};

/**
 * Where every grain is at time `t`, ready to paint back to front.
 *
 * `scale` is px per mark unit, which is the only thing that turns a dot size
 * asked for in device pixels into the units the rest of this works in.
 */
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
    const reach = GLOBE_RADIUS * pulse(lat, t);

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
      radius: lerp(rest, tip * depth, f) * grow,
      alpha:
        markRingAlpha[grain.ring] *
        lerp(1, Math.min(1, depth ** DEPTH_FADE), f),
      depth,
    };
  });

  // Far grains first, or a small far dot punches a hole in a near one.
  placed.sort((a, b) => a.depth - b.depth);

  return placed;
};
