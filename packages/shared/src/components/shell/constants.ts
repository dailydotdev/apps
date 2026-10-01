// The numbers of the phone shell, from the Mobile UX review in Storybook
// (stories/mobile-ux/spec.ts, chapter 10). Components read them from here
// so no file carries its own copy.

export const swipe = {
  lockDistance: 10,
  commitDistance: 56,
  coneRatio: 2,
  velocity: 0.3,
  velocityDistance: 32,
};

export const motion = {
  interaction: 'cubic-bezier(0.2, 0, 0, 1)',
  travel: 'cubic-bezier(0.32, 0.72, 0, 1)',
  feedback: 150,
  enter: 300,
  exit: 200,
  snap: 220,
  scrub: 140,
  press: 0.96,
};

export const scroll = {
  travel: 64,
  deadZone: 96,
  hideTolerance: 24,
  revealTolerance: 8,
  stop: 300,
  shrinkDistance: 96,
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
};

export const topButton = {
  size: 38,
  radius: 14,
  inset: 16,
  gap: 8,
};

export const lerp = (from: number, to: number, p: number): number =>
  from + (to - from) * p;

export const clamp = (value: number): number => Math.min(1, Math.max(0, value));
