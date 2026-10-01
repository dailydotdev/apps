import { useSyncExternalStore } from 'react';
import { clamp, scroll } from './constants';

export interface ShellScrollState {
  p: number;
  snapping: boolean;
}

// One reader of the window scroll for the whole shell: the top block and
// the bottom cluster move on the same progress. 0 is shown and at rest, 1
// is hidden and compact. Direction decides, not position: reading down
// past the tolerance hides, any short scroll up reveals, and nothing moves
// inside the dead zone at the top.
const rest: ShellScrollState = { p: 0, snapping: false };
let state = rest;
let lastY = 0;
let target = 0;
let armed = 0;
let stopTimer: ReturnType<typeof setTimeout> | undefined;
const listeners = new Set<() => void>();

const emit = (next: ShellScrollState) => {
  state = next;
  listeners.forEach((listener) => listener());
};

const settle = () => {
  if (target > 0 && target < 1) {
    target = target >= 0.5 ? 1 : 0;
    emit({ p: target, snapping: true });
  }
};

const onScroll = () => {
  const y = window.scrollY;
  const delta = y - lastY;
  lastY = y;

  if (y <= scroll.deadZone) {
    target = 0;
    armed = 0;
  } else {
    armed = Math.sign(armed) === Math.sign(delta) ? armed + delta : delta;
    const tolerance = delta > 0 ? scroll.hideTolerance : scroll.revealTolerance;
    if (Math.abs(armed) > tolerance) {
      target = clamp(target + delta / scroll.travel);
    }
  }

  if (state.p !== target || state.snapping) {
    emit({ p: target, snapping: false });
  }

  if (stopTimer) {
    clearTimeout(stopTimer);
  }
  stopTimer = setTimeout(settle, scroll.stop);
};

const subscribe = (listener: () => void) => {
  if (listeners.size === 0) {
    lastY = window.scrollY;
    window.addEventListener('scroll', onScroll, { passive: true });
  }
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      window.removeEventListener('scroll', onScroll);
    }
  };
};

export const revealShell = (): void => {
  target = 0;
  armed = 0;
  lastY = globalThis.window?.scrollY ?? 0;
  if (state.p !== 0) {
    emit({ p: 0, snapping: true });
  }
};

export const useShellScroll = (): ShellScrollState =>
  useSyncExternalStore(
    subscribe,
    () => state,
    () => rest,
  );
