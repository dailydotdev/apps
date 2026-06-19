import { useSyncExternalStore } from 'react';

// Shared store so N feed cards share one scroll listener instead of N. Goes
// true on scroll, back to false a debounce after the last event.
const IDLE_DELAY_MS = 200;

let isScrolling = false;
let timeout: ReturnType<typeof setTimeout> | undefined;
const listeners = new Set<() => void>();

const emit = (): void => {
  listeners.forEach((listener) => listener());
};

const handleScroll = (): void => {
  if (!isScrolling) {
    isScrolling = true;
    emit();
  }
  if (timeout) {
    clearTimeout(timeout);
  }
  timeout = setTimeout(() => {
    isScrolling = false;
    emit();
  }, IDLE_DELAY_MS);
};

const subscribe = (listener: () => void): (() => void) => {
  if (listeners.size === 0) {
    // Capture phase so scrolls inside nested containers count too, not just the
    // window — scroll events don't bubble.
    document.addEventListener('scroll', handleScroll, {
      capture: true,
      passive: true,
    });
  }
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      document.removeEventListener('scroll', handleScroll, { capture: true });
      if (timeout) {
        clearTimeout(timeout);
      }
      isScrolling = false;
    }
  };
};

export const useIsScrolling = (): boolean =>
  useSyncExternalStore(
    subscribe,
    () => isScrolling,
    () => false,
  );
