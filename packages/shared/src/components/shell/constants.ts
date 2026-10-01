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
  press: 0.96,
};
