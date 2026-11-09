import { useEffect, useSyncExternalStore } from 'react';

// Pages where a pop-up would get in the way (the daily.dev for Startups
// setup) pause the boot pop-ups, achievement unlocks included. Nothing is
// dropped: the pop-ups stay queued and open on the next page that does not
// pause them.
const pausers = new Set<symbol>();
const listeners = new Set<() => void>();

const notify = () => listeners.forEach((listener) => listener());

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const getIsPaused = (): boolean => pausers.size > 0;

export const useIsBootPopupsPaused = (): boolean =>
  useSyncExternalStore(subscribe, getIsPaused, () => false);

export const usePauseBootPopups = (shouldPause: boolean): void => {
  useEffect(() => {
    if (!shouldPause) {
      return undefined;
    }

    const pauser = Symbol('bootPopupsPauser');
    pausers.add(pauser);
    notify();

    return () => {
      pausers.delete(pauser);
      notify();
    };
  }, [shouldPause]);
};
