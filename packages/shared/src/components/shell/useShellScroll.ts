import { useSyncExternalStore } from 'react';
import { scroll } from './constants';

export interface ShellScrollState {
  p: number;
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
const rest: ShellScrollState = { p: 0 };
const away: ShellScrollState = { p: 1 };
let state = rest;
let { deadZone } = scroll;
let edge = 0;
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
  // A sheet pins the body while it is open, which reads as a jump to the
  // top; the bars keep the state they had.
  if (document.body.style.position === 'fixed') {
    return;
  }
  const y = window.scrollY;
  const delta = y - lastY;
  lastY = y;

  if (y <= deadZone) {
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

// A thing's page keeps the block until its hero has gone and what docks
// into the block (the name, Follow, the segments) has had room to arrive.
export const setShellDeadZone = (px?: number): void => {
  deadZone = Math.max(scroll.deadZone, px ?? 0);
};

// Where the block's bottom edge rests on screen: its height plus whatever
// stands above it (the status bar in the wrappers, the phone ad strip).
export const setShellEdge = (px: number): void => {
  if (edge === px) {
    return;
  }
  edge = px;
  listeners.forEach((listener) => listener());
};

export const useShellEdge = (): number =>
  useSyncExternalStore(
    subscribe,
    () => edge,
    () => 0,
  );

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
