import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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

  const endAnimation = useCallback(() => {
    if (!interval.current) {
      return;
    }

    setTimer(0);
  }, []);

  const startAnimation = useCallback(
    (duration: number) => {
      if (interval.current) {
        clearInterval();
      }

      setTimer(duration);

      if (isNullOrUndefined(duration) || duration <= 0) {
        return;
      }

      if (!autoEndAnimation) {
        interval.current = MANUAL_DISMISS_ANIMATION_ID;
      }

      interval.current = window.setInterval(
        () =>
          setTimer((current) =>
            PROGRESS_INTERVAL >= current ? 0 : current - PROGRESS_INTERVAL,
          ),
        PROGRESS_INTERVAL,
      );
    },
    [autoEndAnimation],
  );

  useEffect(() => {
    // when the timer ends we need to do cleanups
    // we delay the callback execution so we can let the slide out animation finish
    if (timer <= 0) {
      clearInterval();
      animationEnd();
    }
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timer]);

  useEffect(() => {
    return () => {
      window.clearInterval(interval.current);
      interval.current = null;
    };
  }, []);

  return useMemo(
    () => ({
      timer,
      isAnimating: timer > 0,
      endAnimation,
      startAnimation,
    }),
    [endAnimation, startAnimation, timer],
  );
};
