import { useCallback, useEffect, useRef, useState } from 'react';
import { isNullOrUndefined } from '../lib/func';

interface UseTimedAnimation {
  timer: number;
  isAnimating: boolean;
  endAnimation: () => void;
}

interface UseTimedAnimationProps {
  autoEndAnimation: boolean;
  animationDuration: number;
  outAnimationDuration?: number;
  onAnimationEnd?: () => void;
  onAnimationStop?: () => void;
}

const PROGRESS_INTERVAL = 10;
const OUT_ANIMATION_DURATION = 140;

export const useTimedAnimation = ({
  autoEndAnimation = true,
  animationDuration,
  outAnimationDuration = OUT_ANIMATION_DURATION,
  onAnimationEnd,
  onAnimationStop,
}: UseTimedAnimationProps): UseTimedAnimation => {
  const timeout = useRef<number>();
  const [timer, setTimer] = useState(0);
  const interval = useRef<number>();

  const clearInterval = () => {
    if (!interval?.current) {
      return;
    }

    window.clearInterval(interval.current);
    interval.current = null;
  };
  const endAnimation = useCallback(() => {
    if (!isNullOrUndefined(animationDuration)) {
      return;
    }

    setTimer(0);
    onAnimationStop();
  }, [animationDuration]);

  useEffect(() => {
    // when the timer ends we need to do cleanups
    // we delay the callback execution so we can let the slide out animation finish
    if (
      !isNullOrUndefined(animationDuration) &&
      timer === 0 &&
      interval?.current
    ) {
      clearInterval();
      window.clearTimeout(timeout.current);
      timeout.current = window.setTimeout(onAnimationEnd, outAnimationDuration);
    }
  }, [timer, animationDuration]);

  useEffect(() => {
    if (isNullOrUndefined(animationDuration)) {
      return;
    }

    clearInterval();
    setTimer(animationDuration);

    if (!autoEndAnimation) {
      return;
    }

    if (animationDuration <= 0) {
      return;
    }

    interval.current = window.setInterval(
      () =>
        setTimer((current) =>
          PROGRESS_INTERVAL >= current ? 0 : current - PROGRESS_INTERVAL,
        ),
      PROGRESS_INTERVAL,
    );
  }, [animationDuration]);

  useEffect(
    () => () => {
      window.clearTimeout(timeout.current);
    },
    [],
  );

  return { timer, isAnimating: timer > 0, endAnimation };
};
