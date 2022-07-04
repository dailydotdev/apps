import { useEffect, useMemo, useRef, useState } from 'react';
import { isNullOrUndefined } from '../lib/func';
import useDebounce from './useDebounce';

interface UseTimedAnimation {
  timer: number;
  isAnimating: boolean;
  endAnimation: () => void;
  startAnimation: (duration: number) => void;
}

interface UseTimedAnimationProps {
  autoEndAnimation: boolean;
  outAnimationDuration?: number;
  onAnimationEnd?: () => void;
}

const PROGRESS_INTERVAL = 10;
const OUT_ANIMATION_DURATION = 140;
const MANUAL_DISMISS_ANIMATION_ID = 1;

export const useTimedAnimation = ({
  autoEndAnimation = true,
  outAnimationDuration = OUT_ANIMATION_DURATION,
  onAnimationEnd,
}: UseTimedAnimationProps): UseTimedAnimation => {
  const [timer, setTimer] = useState(0);
  const interval = useRef<number>();
  const [animationEnd] = useDebounce(onAnimationEnd, outAnimationDuration);

  const clearInterval = () => {
    if (!interval?.current) {
      return;
    }

    window.clearInterval(interval.current);
    interval.current = null;
  };

  const endAnimation = () => {
    if (!interval.current) {
      return;
    }

    setTimer(0);
  };

  const startAnimation = (duration: number) => {
    if (isNullOrUndefined(duration) || duration <= 0) {
      return;
    }

    setTimer(duration);
    clearInterval();

    if (!autoEndAnimation) {
      interval.current = MANUAL_DISMISS_ANIMATION_ID;
      return;
    }

    interval.current = window.setInterval(
      () =>
        setTimer((current) =>
          PROGRESS_INTERVAL >= current ? 0 : current - PROGRESS_INTERVAL,
        ),
      PROGRESS_INTERVAL,
    );
  };

  useEffect(() => {
    // when the timer ends we need to do cleanups
    // we delay the callback execution so we can let the slide out animation finish
    if (timer <= 0 && interval?.current) {
      clearInterval();
      animationEnd();
    }
  }, [timer]);

  return useMemo(
    () => ({
      timer,
      isAnimating: timer > 0,
      endAnimation,
      startAnimation,
    }),
    [timer],
  );
};
