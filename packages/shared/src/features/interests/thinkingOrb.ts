import type { MarkSample } from './logoMark';
import { markOutlines, MARK_HEIGHT, MARK_WIDTH, pointAtU } from './logoMark';

/**
 * The thinking indicator's motion engine.
 *
 * The mark is not animated as a picture here — it is the *attractor* of a small
 * particle system. A few dozen dots are sampled around the logo's outline, and
 * each state below is a force field over those dots: where a dot sits this
 * frame, how far into the page it is, and how hot it is. The logo is whatever
 * the field currently resolves to, which is why nothing loops in the way a
 * keyframe animation loops — the fields are driven by smooth noise and by
 * travelling waves, so the mark is continuously assembling rather than
 * replaying.
 *
 * Depth is carried by dot size and alpha alone: no blur, no shadows, no
 * filters, so it renders the same everywhere and costs nothing.
 *
 * Rendering lives in components/AgentThinkingOrb.tsx.
 */

/** Everything is computed in mark units — the logo's own 35 × 20 space. */
export const CENTRE_X = MARK_WIDTH / 2;
export const CENTRE_Y = MARK_HEIGHT / 2;

/** Room around the mark for dots to travel into, and no more: every unit of it
 *  is height the mark itself does not get. */
export const MARK_PADDING = 3;
export const VIEW_WIDTH = MARK_WIDTH + MARK_PADDING * 2;
export const VIEW_HEIGHT = MARK_HEIGHT + MARK_PADDING * 2;

const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;
const frac = (value: number): number => value - Math.floor(value);
const clamp01 = (value: number): number => Math.min(1, Math.max(0, value));
const smooth = (t: number): number => t * t * (3 - 2 * t);

/** Deterministic hash in [0, 1) — the same dot behaves the same on every run. */
const hash = (seed: number): number =>
  frac(Math.sin(seed * 127.1 + 3.7) * 43758.5453);

/** Smooth value noise: organic drift that never repeats and never jumps. */
export const noise = (x: number): number => {
  const i = Math.floor(x);
  const f = smooth(x - i);

  return lerp(hash(i), hash(i + 1), f);
};

/** Shortest signed distance between two positions on a 0–1 loop. */
const loopDelta = (a: number, b: number): number => {
  const d = frac(a - b + 0.5) - 0.5;

  return d;
};

export type Placement = {
  x: number;
  y: number;
  /** −1 behind the plane of the mark, +1 in front of it. */
  z: number;
  /** 0–1: how much this dot is currently being worked on. */
  glow: number;
};

export type ThinkingOrbState =
  | 'working'
  | 'thinking'
  | 'searching'
  | 'weaving'
  | 'assembling';

type Mode = {
  label: string;
  /** How strongly the solid mark shows through under the dots, 0–1. */
  solid: (t: number) => number;
  place: (sample: MarkSample, index: number, t: number) => Placement;
  /** Optional pass drawn under the dots, in mark units. */
  overlay?: (ctx: CanvasRenderingContext2D, t: number, ink: string) => void;
};

/*
 * working — three beads of attention, one per stroke, running the outlines at
 * their own pace. Dots lift out of the plane and swell as a bead passes, so the
 * mark reads as being actively traversed rather than merely lit.
 */
const working: Mode = {
  label: 'Working',
  solid: () => 0.3,
  place: ({ u, home, out, outline }, index, t) => {
    const bead = frac(t * 0.34 + outline * 0.37);
    const heat = Math.exp(-((loopDelta(u, bead) / 0.07) ** 2));
    const lift = heat * 1.8;

    return {
      x: home[0] + out[0] * lift,
      y: home[1] + out[1] * lift,
      z: heat * 1.15 - 0.2 + 0.2 * Math.sin(t * 1.7 + index * 0.9),
      glow: heat,
    };
  },
};

/*
 * thinking — the mark holds its shape loosely. Every dot circles its own home
 * on its own radius, and the whole field tightens and loosens on smooth noise,
 * so the logo drifts in and out of focus without ever landing on a beat.
 */
const thinking: Mode = {
  label: 'Thinking',
  solid: (t) => 0.1 + 0.24 * noise(t * 0.31),
  place: ({ home }, index, t) => {
    const looseness = 1 - noise(t * 0.31);
    const spread = 0.45 + looseness * 2.9;
    const angle =
      t * (0.65 + hash(index) * 0.7) + hash(index + 11) * Math.PI * 2;

    return {
      x: home[0] + Math.cos(angle) * spread,
      y: home[1] + Math.sin(angle) * spread * 0.72,
      z: Math.sin(angle + hash(index + 3) * 6.28),
      glow: 0.2 + looseness * 0.45,
    };
  },
};

/*
 * searching — a meridian sweeps the mark. Ahead of it the dots hover unsettled;
 * the line pushes them forward as it passes and they drop into place behind it.
 * The one state where something is drawn that is not the logo.
 */
const SCAN_SPEED = 0.24;
const scanAt = (t: number): number =>
  -MARK_PADDING + frac(t * SCAN_SPEED) * (VIEW_WIDTH + MARK_PADDING);

const searching: Mode = {
  label: 'Searching',
  solid: () => 0.2,
  place: ({ home, out }, index, t) => {
    const gap = home[0] - scanAt(t);
    const band = Math.exp(-((gap / 3) ** 2));
    // Only what the scan has not reached yet is still loose.
    const unsettled = gap > 0 ? 1 : 0;
    const hover = unsettled * (0.9 + 0.6 * Math.sin(t * 2.1 + index * 1.3));

    return {
      x: home[0] + out[0] * (hover * 0.5 + band * 1.1),
      y: home[1] + out[1] * hover,
      z: band * 1.3 - 0.15,
      glow: band,
    };
  },
  // Raked to the mark's own diagonal. The line width is set by the renderer so
  // it stays a hairline at every size.
  overlay: (ctx, t, ink) => {
    const x = scanAt(t);
    ctx.strokeStyle = ink;
    ctx.globalAlpha = 0.26;
    ctx.beginPath();
    ctx.moveTo(x + 3, -MARK_PADDING);
    ctx.lineTo(x - 3, MARK_HEIGHT + MARK_PADDING);
    ctx.stroke();
    ctx.globalAlpha = 1;
  },
};

/*
 * weaving — nothing sits still: every dot travels around its own stroke, and
 * neighbouring strokes run in opposite directions. The mark is drawn entirely
 * by traffic, which is the closest this set gets to reading as "computing".
 */
const weaving: Mode = {
  label: 'Weaving',
  solid: () => 0.14,
  place: ({ u, outline }, index, t) => {
    const direction = outline === 1 ? -1 : 1;
    const travelled = u + t * 0.1 * direction;
    const [x, y] = pointAtU(markOutlines[outline], travelled);
    const wave = Math.sin(travelled * Math.PI * 6 + t * 1.4);

    return { x, y, z: wave, glow: 0.22 + 0.4 * clamp01(wave) };
  },
};

/*
 * assembling — the field scatters and is pulled back. The dispersal is a
 * scatter, not a sphere: the logo is the only shape this system ever makes.
 * The solid mark fades with it, so the whole thing dissolves and re-forms.
 */
const CYCLE = 0.16;
const FORM_END = 0.36;
const HOLD_END = 0.78;

const formAt = (t: number): number => {
  const cycle = frac(t * CYCLE);

  if (cycle < FORM_END) {
    return smooth(cycle / FORM_END);
  }
  if (cycle < HOLD_END) {
    return 1;
  }

  return 1 - smooth((cycle - HOLD_END) / (1 - HOLD_END));
};

const assembling: Mode = {
  label: 'Assembling',
  solid: (t) => 0.05 + 0.24 * formAt(t),
  place: ({ home }, index, t) => {
    const form = formAt(t);
    const angle = hash(index) * Math.PI * 2;
    const radius = 3.5 + hash(index + 5) * 7;

    return {
      x: lerp(CENTRE_X + Math.cos(angle) * radius * 1.5, home[0], form),
      y: lerp(CENTRE_Y + Math.sin(angle) * radius, home[1], form),
      z:
        lerp(hash(index + 9) * 2 - 1, 0, form) +
        0.18 * Math.sin(t * 1.5 + index),
      glow: 0.18 + 0.55 * (1 - form),
    };
  },
};

export const thinkingModes: Record<ThinkingOrbState, Mode> = {
  working,
  thinking,
  searching,
  weaving,
  assembling,
};

/**
 * Dot count and radius are tuned per size rather than scaled from one figure: a
 * field that is airy at 96px is a smear at 20px, and vice versa. Both curves are
 * sub-linear, and they are deliberately pitched so the gap between dots always
 * stays wider than a dot — the moment they touch, the field stops reading as
 * dots and starts reading as a badly drawn outline.
 */
export const dotCount = (size: number): number =>
  Math.round(Math.min(72, 26 + (size - 20) * 0.52));

export const dotRadius = (size: number): number => 0.8 * (size / 20) ** 0.62;

/**
 * The solid mark carries the brand at small sizes, where a dot field alone is
 * just texture; by 96px the dots describe the shape on their own and it can drop
 * away almost entirely.
 */
export const solidBoost = (size: number): number =>
  0.2 * clamp01((36 - size) / 18);

/** Fake parallax: a small screen shift with depth, enough to feel dimensional
 *  without pulling dots off the shape they are describing. */
export const PARALLAX = 0.4;
