import { atom, useAtom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

// Focus mode produces a minimalist new tab: a single hero column of ~5 posts,
// no shortcuts, no widgets, and a short personalised greeting. Scrolling past
// a small threshold smoothly reveals the full UI again. Persisted locally so
// the choice survives reloads without a server round-trip.
export const focusModeAtom = atomWithStorage<boolean>(
  'newtab:focus-mode',
  false,
);

// Tracks whether the user has scrolled past the focus-mode reveal threshold.
// When true, the rest of the UI fades in and the feed grows back to its
// normal multi-column layout. Kept in memory only — resets per session.
export const focusModeRevealedAtom = atom<boolean>(false);

export const useFocusMode = (): {
  isEnabled: boolean;
  setEnabled: (value: boolean) => void;
  isRevealed: boolean;
  setRevealed: (value: boolean) => void;
} => {
  const [isEnabled, setEnabled] = useAtom(focusModeAtom);
  const [isRevealed, setRevealed] = useAtom(focusModeRevealedAtom);

  return { isEnabled, setEnabled, isRevealed, setRevealed };
};
