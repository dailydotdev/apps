import { atom, useAtomValue, useSetAtom } from 'jotai';
import { useCallback } from 'react';

// Lightweight pub/sub channel for "please open the Customize new-tab
// sidebar" requests. The sidebar's open state lives inside `useCustomizeNewTab`
// and we don't want to lift it into a global atom (the hook still owns
// auto-open + dismiss bookkeeping). Instead, anyone — the profile dropdown,
// keyboard shortcuts, etc. — can bump this counter and the hook's effect
// will react with a single `setIsOpen(true)`.
//
// Using a counter (vs. a boolean) means repeated requests still trigger an
// open, which is the right behavior if the user closes the panel and asks
// for it again from the same surface in the same session.
export const customizerOpenRequestAtom = atom<number>(0);

export const useCustomizerOpenRequest = (): number =>
  useAtomValue(customizerOpenRequestAtom);

export const useRequestCustomizerOpen = (): (() => void) => {
  const setRequest = useSetAtom(customizerOpenRequestAtom);
  return useCallback(() => {
    setRequest((current) => current + 1);
  }, [setRequest]);
};
