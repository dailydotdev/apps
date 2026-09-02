import { useRef } from 'react';
import { generateSearchId } from '../../lib/searchLog';

/**
 * Mints a fresh search id whenever `key` changes, and keeps it stable while it
 * doesn't. `key` must encode everything that makes a distinct search execution
 * (query, backend version, filters) so a re-run gets its own id.
 */
export const useSearchId = (key: string): string => {
  const current = useRef<{ key: string; id: string } | null>(null);

  if (!current.current || current.current.key !== key) {
    current.current = { key, id: generateSearchId() };
  }

  return current.current.id;
};
