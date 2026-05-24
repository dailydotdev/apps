import { useCallback, useMemo } from 'react';
import usePersistentContext from './usePersistentContext';

const READ_HIGHLIGHTS_KEY = 'read_highlights';
const READ_HIGHLIGHTS_MAX = 500;

export function useReadHighlights(): {
  isRead: (highlightId: string) => boolean;
  markAsRead: (highlightId: string) => Promise<void>;
} {
  const [value, setValue] = usePersistentContext<string[]>(
    READ_HIGHLIGHTS_KEY,
    [],
    undefined,
    [],
  );
  const readIds = useMemo(() => value ?? [], [value]);
  const readSet = useMemo(() => new Set(readIds), [readIds]);

  const isRead = useCallback(
    (highlightId: string) => readSet.has(highlightId),
    [readSet],
  );

  const markAsRead = useCallback(
    async (highlightId: string) => {
      if (readSet.has(highlightId)) {
        return;
      }

      await setValue([...readIds, highlightId].slice(-READ_HIGHLIGHTS_MAX));
    },
    [readIds, readSet, setValue],
  );

  return { isRead, markAsRead };
}
