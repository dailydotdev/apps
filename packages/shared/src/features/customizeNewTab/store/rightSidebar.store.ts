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

// `true` while a brand-new user is on their auto-opened first-session
// new tab and hasn't dismissed the customizer yet. Set by
// `useCustomizeNewTab` when it mounts in first-session mode and reset
// on close / unmount. Other shared chrome reads this to step out of the
// way during onboarding — currently `FeedbackWidget` short-circuits
// while it's true so the corner stays focused on the customizer panel
// instead of competing with a Feedback pill. From the second session
// onward (after the user has dismissed once) the atom stays `false`
// and feedback shows by default.
export const customizerFirstSessionAtom = atom<boolean>(false);

export const useCustomizerFirstSession = (): boolean =>
  useAtomValue(customizerFirstSessionAtom);

export const useSetCustomizerFirstSession = (): ((value: boolean) => void) =>
  useSetAtom(customizerFirstSessionAtom);
