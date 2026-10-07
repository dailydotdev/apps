// The numbers of the phone shell. Components read them from here so no file
// carries its own copy.

export const swipe = {
  lockDistance: 10,
  commitDistance: 56,
  coneRatio: 2,
  velocity: 0.3,
  velocityDistance: 32,
};

// A release settles on a light spring (320/24): one small overshoot, then
// still. Sampled into linear() so it runs as a plain CSS transition.
export const settle = {
  duration: 400,
  easing:
    'linear(0, 0.015, 0.054, 0.112, 0.183, 0.262, 0.345, 0.429, 0.511, 0.589, 0.663, 0.73, 0.791, 0.844, 0.891, 0.931, 0.964, 0.991, 1.013, 1.029, 1.042, 1.05, 1.055, 1.058, 1.058, 1.057, 1.054, 1.051, 1.046, 1.042, 1.037, 1.032, 1.027, 1.023, 1.018, 1.015, 1.011, 1.008, 1.006, 1.003, 1.002, 1)',
};

export const motion = {
  interaction: 'cubic-bezier(0.2, 0, 0, 1)',
  feedback: 150,
  enter: 300,
  exit: 200,
  snap: 220,
};

export const scroll = {
  deadZone: 96,
  hideTolerance: 24,
  revealTolerance: 8,
};

export const cluster = {
  rest: 56,
  compact: 44,
  radiusRest: 22,
  radiusCompact: 18,
  inset: 20,
  insetCompact: 40,
  padding: 4,
  gap: 8,
  lift: 8,
  // A held finger has to travel this far before the indicator follows it.
  dragStart: 6,
  // The whole bar lifts this much while a finger is on it.
  pressScale: 1.04,
  // The bar leans up to 10px past its ends at 15% of the overshoot.
  pullRate: 0.15,
  pullMax: 10,
  // Lifting the finger this far above or below the bar cancels the choice.
  cancelDistance: 24,
  // The lens under a finger: the pill lifts to 1.08 and follows on a stiff
  // spring, squashing along its motion (volume kept) by up to 18%.
  lensScale: 1.08,
  spring: { stiffness: 420, damping: 32 },
  squashPerPxPerMs: 0.18,
  squashMax: 0.18,
};

export const topButton = {
  size: 38,
  inset: 16,
  gap: 8,
};

// The block's height before it has measured itself, by what the page
// shows in it: the page row (with Bookmarks' row or search's field under
// it), a root's row (with the row of segments or chips Home and Squads
// keep), and Explore's row with its field and chips. The layout holds this
// from the server paint so nothing under the block moves when it measures.
export const blockRest = {
  page: '3.25rem',
  pageWithRow: '6rem',
  pageWithField: '6.5rem',
  root: '3rem',
  rootWithRow: '5.75rem',
  explore: '9rem',
};

export const lerp = (from: number, to: number, p: number): number =>
  from + (to - from) * p;

export const clamp = (value: number): number => Math.min(1, Math.max(0, value));
