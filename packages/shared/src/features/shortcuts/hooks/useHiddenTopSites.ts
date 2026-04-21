import { useCallback, useMemo } from 'react';
import usePersistentContext from '../../../hooks/usePersistentContext';

const HIDDEN_TOP_SITES_KEY = 'shortcuts_hidden_top_sites';

// Persists a per-browser list of most-visited URLs the user has dismissed.
// Mirrors Chrome's NTP behaviour: the browser keeps surfacing top sites from
// history, but we respect the user's one-off "remove this tile" decision.
// Stored in IndexedDB via `usePersistentContext` so it survives reloads and
// stays local to the device (top sites are inherently a per-browser signal).
export function useHiddenTopSites(): {
  hidden: string[];
  isHidden: (url: string) => boolean;
  hide: (url: string) => Promise<void>;
  unhide: (url: string) => Promise<void>;
  restore: () => Promise<void>;
} {
  const [value, setValue] = usePersistentContext<string[]>(
    HIDDEN_TOP_SITES_KEY,
    [],
    undefined,
    [],
  );
  const hidden = value ?? [];

  const hiddenSet = useMemo(() => new Set(hidden), [hidden]);

  const isHidden = useCallback((url: string) => hiddenSet.has(url), [hiddenSet]);

  const hide = useCallback(
    async (url: string) => {
      if (hiddenSet.has(url)) {
        return;
      }
      await setValue([...hidden, url]);
    },
    [hidden, hiddenSet, setValue],
  );

  const unhide = useCallback(
    async (url: string) => {
      if (!hiddenSet.has(url)) {
        return;
      }
      await setValue(hidden.filter((existing) => existing !== url));
    },
    [hidden, hiddenSet, setValue],
  );

  const restore = useCallback(async () => {
    await setValue([]);
  }, [setValue]);

  return { hidden, isHidden, hide, unhide, restore };
}
