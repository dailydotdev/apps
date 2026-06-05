import { useEffect, useReducer } from 'react';

// Lightweight, asset-free sound + haptics for the win moments. Tones are
// synthesized with the Web Audio API (a coin chime on a normal win, a short
// arpeggio on a milestone) so there are no audio files to ship. Everything is
// OFF by default and gated behind a single toggle, persisted to localStorage,
// and shared across components via a tiny module-level store.
const STORAGE_KEY = 'giveback:sound';

let enabled = false;
let initialized = false;
let audioContext: AudioContext | null = null;
const listeners = new Set<() => void>();

const ensureInitialized = (): void => {
  if (initialized || typeof window === 'undefined') {
    return;
  }
  initialized = true;
  try {
    enabled = window.localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    enabled = false;
  }
};

const notify = (): void => {
  listeners.forEach((listener) => listener());
};

const getAudioContext = (): AudioContext | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  const Ctor =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!Ctor) {
    return null;
  }
  if (!audioContext) {
    audioContext = new Ctor();
  }
  return audioContext;
};

const playTone = (
  ctx: AudioContext,
  frequency: number,
  startAt: number,
  duration: number,
  peak: number,
): void => {
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = 'triangle';
  oscillator.frequency.setValueAtTime(frequency, startAt);
  gain.gain.setValueAtTime(0.0001, startAt);
  gain.gain.exponentialRampToValueAtTime(peak, startAt + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
  oscillator.connect(gain).connect(ctx.destination);
  oscillator.start(startAt);
  oscillator.stop(startAt + duration);
};

const vibrate = (pattern: number | number[]): void => {
  if (
    typeof navigator !== 'undefined' &&
    typeof navigator.vibrate === 'function'
  ) {
    navigator.vibrate(pattern);
  }
};

const playNotes = (
  notes: { freq: number; offset: number; dur: number }[],
): void => {
  if (!enabled) {
    return;
  }
  const ctx = getAudioContext();
  if (!ctx) {
    return;
  }
  if (ctx.state === 'suspended' && typeof ctx.resume === 'function') {
    ctx.resume().catch(() => undefined);
  }
  const now = ctx.currentTime;
  notes.forEach(({ freq, offset, dur }) => {
    playTone(ctx, freq, now + offset, dur, 0.18);
  });
};

interface GivebackSound {
  enabled: boolean;
  toggle: () => void;
  playWin: () => void;
  playMilestone: () => void;
}

export const useGivebackSound = (): GivebackSound => {
  ensureInitialized();
  const [, forceRender] = useReducer((count: number) => count + 1, 0);

  useEffect(() => {
    listeners.add(forceRender);
    return () => {
      listeners.delete(forceRender);
    };
  }, []);

  const toggle = (): void => {
    ensureInitialized();
    enabled = !enabled;
    try {
      window.localStorage.setItem(STORAGE_KEY, enabled ? '1' : '0');
    } catch {
      // Storage can be unavailable (private mode); the toggle still works for
      // the session.
    }
    // Turning sound on counts as the user gesture that unlocks audio.
    if (enabled) {
      getAudioContext()
        ?.resume?.()
        .catch(() => undefined);
    }
    notify();
  };

  const playWin = (): void => {
    playNotes([
      { freq: 880, offset: 0, dur: 0.16 },
      { freq: 1318.5, offset: 0.08, dur: 0.22 },
    ]);
    vibrate(18);
  };

  const playMilestone = (): void => {
    playNotes([
      { freq: 659.25, offset: 0, dur: 0.16 },
      { freq: 880, offset: 0.09, dur: 0.16 },
      { freq: 1108.7, offset: 0.18, dur: 0.18 },
      { freq: 1318.5, offset: 0.27, dur: 0.32 },
    ]);
    vibrate([20, 40, 30]);
  };

  return { enabled, toggle, playWin, playMilestone };
};
