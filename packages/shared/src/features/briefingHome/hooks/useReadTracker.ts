import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'briefing-home-read';

const loadInitial = (): Set<string> => {
  if (typeof window === 'undefined') {
    return new Set();
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return new Set();
    }
    const parsed = JSON.parse(raw);
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
};

export const useReadTracker = (): {
  readSet: Set<string>;
  markRead: (id: string) => void;
  reset: () => void;
} => {
  const [readSet, setReadSet] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    setReadSet(loadInitial());
  }, []);

  const persist = useCallback((next: Set<string>) => {
    if (typeof window === 'undefined') {
      return;
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
  }, []);

  const markRead = useCallback(
    (id: string) => {
      setReadSet((prev) => {
        if (prev.has(id)) {
          return prev;
        }
        const next = new Set(prev);
        next.add(id);
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const reset = useCallback(() => {
    const empty = new Set<string>();
    persist(empty);
    setReadSet(empty);
  }, [persist]);

  return { readSet, markRead, reset };
};
