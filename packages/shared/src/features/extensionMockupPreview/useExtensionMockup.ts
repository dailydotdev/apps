import { useSyncExternalStore } from 'react';

export type ExtensionMockupState = {
  signInStrip: boolean;
  reminderCard: boolean;
  cvCard: boolean;
  shortcutsCard: boolean;
};

export type ExtensionMockupKey = keyof ExtensionMockupState;

const STORAGE_KEY = 'extension-mockup-panel-state';

const defaultState: ExtensionMockupState = {
  signInStrip: false,
  reminderCard: true,
  cvCard: true,
  shortcutsCard: true,
};

const readFromStorage = (): ExtensionMockupState => {
  if (typeof window === 'undefined') {
    return defaultState;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return defaultState;
    }
    const parsed = JSON.parse(raw) as Partial<ExtensionMockupState>;
    return { ...defaultState, ...parsed };
  } catch {
    return defaultState;
  }
};

let state: ExtensionMockupState = readFromStorage();
const listeners = new Set<() => void>();

const emit = (next: ExtensionMockupState): void => {
  state = next;
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // localStorage may be unavailable (private mode, quota); ignore.
    }
  }
  listeners.forEach((listener) => listener());
};

export const setExtensionMockup = (
  patch: Partial<ExtensionMockupState>,
): void => {
  emit({ ...state, ...patch });
};

const subscribe = (listener: () => void): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const getSnapshot = (): ExtensionMockupState => state;
const getServerSnapshot = (): ExtensionMockupState => defaultState;

export const useExtensionMockup = (): ExtensionMockupState =>
  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
