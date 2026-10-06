import { useSyncExternalStore } from 'react';

// Where the pager is between two segments: the lit segment's index plus the
// fraction of the way to its neighbour (-1..1). The row of segments reads
// it to slide its highlight with the finger. Null while nothing is dragged.
let position: number | null = null;
const listeners = new Set<() => void>();

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const setPagerPosition = (next: number | null): void => {
  if (position === next) {
    return;
  }
  position = next;
  listeners.forEach((listener) => listener());
};

export const usePagerPosition = (): number | null =>
  useSyncExternalStore(
    subscribe,
    () => position,
    () => null,
  );
