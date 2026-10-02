import { useSyncExternalStore } from 'react';
import { scroll } from './constants';

export interface ShellScrollState {
  p: number;
  snapping: boolean;
}

// One reader of the window scroll for the whole shell: the top block and
// the bottom cluster move on the same state. 0 is shown and at rest, 1 is
// hidden and compact, and nothing in between: the pieces never track the
// finger, they play their own 220ms once the reading direction is clear.
// (iOS 26 minimises its tab bar the same way, and Material's hide-on-
// scroll slides as a whole; a value scrubbed from scroll events jumps on
// Safari, whose events arrive in bursts.) Direction decides, not
// position: reading down past the tolerance hides, a short scroll up
// reveals, and the dead zone at the top always shows.
const rest: ShellScrollState = { p: 0, snapping: true };
const away: ShellScrollState = { p: 1, snapping: true };
let state = rest;
let lastY = 0;
let armed = 0;
const listeners = new Set<() => void>();

const emit = (next: ShellScrollState) => {
  if (state === next) {
    return;
  }
  state = next;
  listeners.forEach((listener) => listener());
};

const onScroll = () => {
  const y = window.scrollY;
  const delta = y - lastY;
  lastY = y;

  if (y <= scroll.deadZone) {
    armed = 0;
    emit(rest);
    return;
  }

  armed = Math.sign(armed) === Math.sign(delta) ? armed + delta : delta;
  if (armed > scroll.hideTolerance) {
    emit(away);
  } else if (armed < -scroll.revealTolerance) {
    emit(rest);
  }
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
  armed = 0;
  lastY = globalThis.window?.scrollY ?? 0;
  emit(rest);
};

export const useShellScroll = (): ShellScrollState =>
  useSyncExternalStore(
    subscribe,
    () => state,
    () => rest,
  );
