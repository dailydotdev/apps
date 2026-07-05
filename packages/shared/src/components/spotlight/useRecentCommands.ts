import { useCallback, useEffect, useState } from 'react';
import { storageWrapper } from '../../lib/storageWrapper';
import {
  RECENT_MAX_ENTRIES,
  RECENT_STORAGE_KEY,
  type RecentCommandEntry,
} from './types';

const safeParse = (raw: string | null): RecentCommandEntry[] => {
  if (!raw) {
    return [];
  }
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed
      .filter(
        (entry): entry is RecentCommandEntry =>
          !!entry &&
          typeof entry === 'object' &&
          typeof (entry as RecentCommandEntry).commandId === 'string' &&
          typeof (entry as RecentCommandEntry).lastUsedAt === 'number',
      )
      .slice(0, RECENT_MAX_ENTRIES);
  } catch {
    return [];
  }
};

export interface UseRecentCommands {
  recent: RecentCommandEntry[];
  /** Refreshes from storage; useful when the palette opens (cross-tab sync). */
  refresh: () => void;
  /** Push a command id to the front (last-write-wins across tabs). */
  push: (commandId: string) => void;
  /** Remove a single command id (e.g. when it's gated out). */
  forget: (commandId: string) => void;
}

/**
 * SSR-safe Recents store. Reads from `localStorage` via `storageWrapper`
 * (which falls back to in-memory when storage is unavailable). Last-write-wins
 * across tabs — the 8-entry list does not warrant `BroadcastChannel`.
 */
export const useRecentCommands = (): UseRecentCommands => {
  const [recent, setRecent] = useState<RecentCommandEntry[]>([]);

  const refresh = useCallback(() => {
    if (typeof window === 'undefined') {
      return;
    }
    setRecent(safeParse(storageWrapper.getItem(RECENT_STORAGE_KEY)));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const persist = useCallback((next: RecentCommandEntry[]) => {
    setRecent(next);
    if (typeof window === 'undefined') {
      return;
    }
    storageWrapper.setItem(RECENT_STORAGE_KEY, JSON.stringify(next));
  }, []);

  const push = useCallback(
    (commandId: string) => {
      const current = safeParse(storageWrapper.getItem(RECENT_STORAGE_KEY));
      const filtered = current.filter((entry) => entry.commandId !== commandId);
      const next: RecentCommandEntry[] = [
        { commandId, lastUsedAt: Date.now() },
        ...filtered,
      ].slice(0, RECENT_MAX_ENTRIES);
      persist(next);
    },
    [persist],
  );

  const forget = useCallback(
    (commandId: string) => {
      const current = safeParse(storageWrapper.getItem(RECENT_STORAGE_KEY));
      const next = current.filter((entry) => entry.commandId !== commandId);
      persist(next);
    },
    [persist],
  );

  return { recent, refresh, push, forget };
};
