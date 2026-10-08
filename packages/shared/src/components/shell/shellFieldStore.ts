import { useEffect, useSyncExternalStore } from 'react';

export interface ShellFieldState {
  mounted: boolean;
  focused: boolean;
}

// The field floats above the bottom bar, so the bar has to know when a page
// carries one: it gives the field its slot once the reader scrolls, and
// leaves while the keyboard is up.
const none: ShellFieldState = { mounted: false, focused: false };
let state = none;
let count = 0;
const listeners = new Set<() => void>();

const emit = (next: ShellFieldState) => {
  if (state.mounted === next.mounted && state.focused === next.focused) {
    return;
  }
  state = next;
  listeners.forEach((listener) => listener());
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const setShellFieldFocused = (focused: boolean): void =>
  emit({ mounted: state.mounted, focused: state.mounted && focused });

export const useRegisterShellField = (enabled: boolean): void => {
  useEffect(() => {
    if (!enabled) {
      return undefined;
    }
    count += 1;
    emit({ mounted: true, focused: state.focused });
    return () => {
      count -= 1;
      if (count === 0) {
        emit(none);
      }
    };
  }, [enabled]);
};

export const useShellField = (): ShellFieldState =>
  useSyncExternalStore(
    subscribe,
    () => state,
    () => none,
  );
