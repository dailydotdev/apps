import { useCallback, useEffect, useRef, useState } from 'react';

// Matches the flash `useCopy` already uses for its own `copying` flag, so every
// copy control across a surface confirms for the same beat.
const COPY_FEEDBACK_MS = 1000;

export type MarkCopied = (key?: string) => void;

/**
 * Tracks *which* copy control last fired, so it can swap to a success
 * checkmark. `useCopy` exposes a `copying` flag already, but there is one per
 * hook instance — a surface with several copy controls sharing a hook would
 * light them all up at once.
 */
export const useCopyFeedback = (
  duration = COPY_FEEDBACK_MS,
): [string | null, MarkCopied] => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const timeout = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => () => clearTimeout(timeout.current), []);

  const markCopied = useCallback<MarkCopied>(
    (key = 'default') => {
      clearTimeout(timeout.current);
      setCopiedKey(key);
      timeout.current = setTimeout(() => setCopiedKey(null), duration);
    },
    [duration],
  );

  return [copiedKey, markCopied];
};
