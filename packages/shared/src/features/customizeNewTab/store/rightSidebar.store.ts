import { atom, useAtomValue, useSetAtom } from 'jotai';

// Width, in px, of any persistent right-side sidebar currently pushing the
// main content (e.g. the "Customize new tab" panel). Components that are
// fixed-positioned (the header, the feedback button, scroll-to-top, etc.) can
// read this value to avoid being hidden under the sidebar, and layout
// providers can use it to recalculate breakpoints.
export const rightSidebarOffsetAtom = atom<number>(0);

export const useRightSidebarOffset = (): number =>
  useAtomValue(rightSidebarOffsetAtom);

export const useSetRightSidebarOffset = (): ((value: number) => void) =>
  useSetAtom(rightSidebarOffsetAtom);

// Flips to `true` on the frame after the customizer has settled into its
// initial open/closed state. Layout-dependent chrome (header, feed
// padding, scroll-to-top wrapper) reads this to skip CSS transitions on
// first paint — without it, a first-session auto-open would visibly
// animate the header width / feed padding / panel slide all at once,
// creating a jarring layout-shift on a brand-new tab.
export const rightSidebarSettledAtom = atom<boolean>(false);

export const useRightSidebarSettled = (): boolean =>
  useAtomValue(rightSidebarSettledAtom);

export const useSetRightSidebarSettled = (): ((value: boolean) => void) =>
  useSetAtom(rightSidebarSettledAtom);
