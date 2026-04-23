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
