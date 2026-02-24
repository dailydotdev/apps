import { useEffect, useRef, useState } from 'react';

export type StreakAnimationState = 'idle' | 'incrementing' | 'broken' | 'done';

interface UseStreakIncrementReturn {
  animationState: StreakAnimationState;
  previousStreak: number | undefined;
  resetAnimation: () => void;
}

const ANIMATION_DURATION_MS = 3200;

export const useStreakIncrement = (
  currentStreak: number | undefined,
): UseStreakIncrementReturn => {
  const prevStreakRef = useRef<number | undefined>(undefined);
  const [animationState, setAnimationState] =
    useState<StreakAnimationState>('idle');
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (currentStreak === undefined) {
      prevStreakRef.current = currentStreak;
      return;
    }

    if (prevStreakRef.current !== undefined) {
      let nextState: StreakAnimationState | null = null;

      if (currentStreak > prevStreakRef.current) {
        nextState = 'incrementing';
      } else if (currentStreak < prevStreakRef.current) {
        nextState = 'broken';
      }

      if (nextState) {
        setAnimationState(nextState);

        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }

        timerRef.current = setTimeout(() => {
          setAnimationState('done');
        }, ANIMATION_DURATION_MS);
      }
    }

    prevStreakRef.current = currentStreak;
  }, [currentStreak]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const resetAnimation = () => setAnimationState('idle');

  return { animationState, previousStreak: prevStreakRef.current, resetAnimation };
};
