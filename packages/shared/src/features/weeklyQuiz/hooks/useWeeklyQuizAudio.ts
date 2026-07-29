import { useCallback, useEffect, useRef } from 'react';
import usePersistentContext from '../../../hooks/usePersistentContext';

// Three-state volume control for the game's audio: full, quiet, or off.
export enum WeeklyQuizAudioLevel {
  Normal = 'normal',
  Less = 'less',
  Muted = 'muted',
}

const LEVEL_ORDER = [
  WeeklyQuizAudioLevel.Normal,
  WeeklyQuizAudioLevel.Less,
  WeeklyQuizAudioLevel.Muted,
];

// The 8-bit organ loop is bright, so "normal" sits well below full scale. The
// countdown beep gets its own (louder) curve so it cuts through the music.
const MUSIC_VOLUME: Record<WeeklyQuizAudioLevel, number> = {
  [WeeklyQuizAudioLevel.Normal]: 0.35,
  [WeeklyQuizAudioLevel.Less]: 0.12,
  [WeeklyQuizAudioLevel.Muted]: 0,
};
const SFX_VOLUME: Record<WeeklyQuizAudioLevel, number> = {
  [WeeklyQuizAudioLevel.Normal]: 0.7,
  [WeeklyQuizAudioLevel.Less]: 0.25,
  [WeeklyQuizAudioLevel.Muted]: 0,
};

// Served from each app's public/ dir.
const MUSIC_URL = '/audio/weekly-quiz-loop.mp3';
const COUNTDOWN_URL = '/audio/weekly-quiz-countdown.mp3';
const SWITCH_URL = '/audio/weekly-quiz-switch.mp3';
const ANSWER_URL = '/audio/weekly-quiz-answer.mp3';
const CORRECT_URL = '/audio/weekly-quiz-correct.mp3';

export interface UseWeeklyQuizAudio {
  level: WeeklyQuizAudioLevel;
  cycleLevel: () => void;
  startMusic: () => void;
  stopMusic: () => void;
  playCountdownTick: () => void;
  playSwitch: () => void;
  playAnswer: () => void;
  playCorrect: () => void;
}

// Owns the game's audio: a looping background track plus a one-shot countdown
// beep, both scaled by a persisted three-state volume. Call once (in the modal)
// and pass the controls down so a single audio element is shared across phases.
export const useWeeklyQuizAudio = (): UseWeeklyQuizAudio => {
  // Default to the quieter "Less" level so the game doesn't open at full volume.
  const [level, setLevel] = usePersistentContext<WeeklyQuizAudioLevel>(
    'weekly_quiz_audio_level',
    WeeklyQuizAudioLevel.Less,
    LEVEL_ORDER,
    WeeklyQuizAudioLevel.Less,
  );

  const musicRef = useRef<HTMLAudioElement | null>(null);
  // A pending "start on first user interaction" handler, when autoplay was
  // blocked. Kept so we can clean it up on unmount.
  const unlockRef = useRef<(() => void) | null>(null);
  // Whether the background music is *meant* to be playing right now (intro
  // only). Guards the volume effect and the unlock handler so a volume change
  // or a late first-interaction can't resurrect music we deliberately stopped
  // when the game started.
  const shouldPlayRef = useRef(false);
  // Keep the latest level readable inside stable callbacks.
  const levelRef = useRef(level);
  levelRef.current = level;

  // Preload the loop on mount so there's no lag when playback is allowed.
  useEffect(() => {
    if (typeof window === 'undefined' || musicRef.current) {
      return;
    }
    const audio = new Audio(MUSIC_URL);
    audio.loop = true;
    audio.preload = 'auto';
    musicRef.current = audio;
  }, []);

  // Reflect volume changes live, and pause when muted so we don't hold an
  // audible-but-silent stream running forever.
  useEffect(() => {
    const music = musicRef.current;
    if (!music) {
      return;
    }
    music.volume = MUSIC_VOLUME[level];
    if (level === WeeklyQuizAudioLevel.Muted) {
      music.pause();
    } else if (shouldPlayRef.current && music.paused) {
      music.play().catch(() => undefined);
    }
  }, [level]);

  // Stop and release audio when the game unmounts, and drop any pending
  // first-interaction unlock so nothing starts after the quiz closes.
  useEffect(() => {
    return () => {
      musicRef.current?.pause();
      musicRef.current = null;
      if (unlockRef.current) {
        window.removeEventListener('pointerdown', unlockRef.current);
        window.removeEventListener('keydown', unlockRef.current);
        unlockRef.current = null;
      }
    };
  }, []);

  const startMusic = useCallback(() => {
    if (typeof window === 'undefined') {
      return;
    }
    shouldPlayRef.current = true;
    if (!musicRef.current) {
      const audio = new Audio(MUSIC_URL);
      audio.loop = true;
      musicRef.current = audio;
    }
    musicRef.current.volume = MUSIC_VOLUME[levelRef.current];
    if (levelRef.current === WeeklyQuizAudioLevel.Muted) {
      return;
    }

    // Try to play now — works when startMusic follows a click (the app opens
    // the modal from one). If the browser blocks autoplay (e.g. Storybook, or
    // a delayed mount), start on the first user interaction instead.
    musicRef.current.play().catch(() => {
      if (unlockRef.current) {
        return;
      }
      const unlock = () => {
        unlockRef.current = null;
        // Bail if the game has since started (or muted) — don't resurrect the
        // lobby loop on a gameplay tap.
        if (
          shouldPlayRef.current &&
          musicRef.current &&
          levelRef.current !== WeeklyQuizAudioLevel.Muted
        ) {
          musicRef.current.play().catch(() => undefined);
        }
      };
      unlockRef.current = unlock;
      window.addEventListener('pointerdown', unlock, { once: true });
      window.addEventListener('keydown', unlock, { once: true });
    });
  }, []);

  const stopMusic = useCallback(() => {
    shouldPlayRef.current = false;
    musicRef.current?.pause();
    // Drop any pending autoplay-unlock so a later interaction can't start it.
    if (unlockRef.current) {
      window.removeEventListener('pointerdown', unlockRef.current);
      window.removeEventListener('keydown', unlockRef.current);
      unlockRef.current = null;
    }
  }, []);

  // Fire-and-forget one-shot sound effect, scaled by the current volume level.
  const playSfx = useCallback((url: string) => {
    if (typeof window === 'undefined') {
      return;
    }
    const volume = SFX_VOLUME[levelRef.current];
    if (volume === 0) {
      return;
    }
    const sfx = new Audio(url);
    sfx.volume = volume;
    sfx.play().catch(() => undefined);
  }, []);

  const playCountdownTick = useCallback(
    () => playSfx(COUNTDOWN_URL),
    [playSfx],
  );
  const playSwitch = useCallback(() => playSfx(SWITCH_URL), [playSfx]);
  const playAnswer = useCallback(() => playSfx(ANSWER_URL), [playSfx]);
  const playCorrect = useCallback(() => playSfx(CORRECT_URL), [playSfx]);

  const cycleLevel = useCallback(() => {
    const nextIndex =
      (LEVEL_ORDER.indexOf(levelRef.current) + 1) % LEVEL_ORDER.length;
    setLevel(LEVEL_ORDER[nextIndex]);
  }, [setLevel]);

  return {
    level,
    cycleLevel,
    startMusic,
    stopMusic,
    playCountdownTick,
    playSwitch,
    playAnswer,
    playCorrect,
  };
};
