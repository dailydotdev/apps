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
  onAnimationEnd?: () => void;
  onAnimationStop?: () => void;
}

const TEMPORARY_ID = 1;
const INTERVAL_COUNT = 10;
const IN_OUT_ANIMATION = 140;

export const useTimedAnimation = ({
  autoEndAnimation = true,
  animationDuration,
  onAnimationEnd,
  onAnimationStop,
}: UseTimedAnimationProps): UseTimedAnimation => {
  const timeout = useRef<number>();
  const [timer, setTimer] = useState(0);
  const [intervalId, setIntervalId] = useState<number>(null);

  const endAnimation = useCallback(() => {
    if (!isNullOrUndefined(animationDuration)) {
      return;
    }

    window.clearInterval(intervalId);
    onAnimationStop();
  }, [animationDuration, intervalId]);

  useEffect(() => {
    // when the timer ends we need to do cleanups
    // we delay the callback execution so we can let the slide out animation finish
    if (!isNullOrUndefined(animationDuration) && timer === 0 && intervalId) {
      window.clearInterval(intervalId);
      setIntervalId(null);
      window.clearTimeout(timeout.current);
      timeout.current = window.setTimeout(onAnimationEnd, IN_OUT_ANIMATION);
    }
  }, [timer, animationDuration, intervalId]);

  useEffect(() => {
    if (isNullOrUndefined(animationDuration)) {
      return;
    }

    window.clearInterval(intervalId);
    setTimer(animationDuration);

    if (!autoEndAnimation && !intervalId) {
      setIntervalId(TEMPORARY_ID);
      return;
    }

    if (animationDuration <= 0) {
      return;
    }

    setIntervalId(
      window.setInterval(
        () =>
          setTimer((current) =>
            INTERVAL_COUNT >= current ? 0 : current - INTERVAL_COUNT,
          ),
        INTERVAL_COUNT,
      ),
    );
  }, [animationDuration]);

  useEffect(
    () => () => {
      window.clearTimeout(timeout.current);
    },
    [],
  );

  return { timer, isAnimating: !!intervalId, endAnimation };
};
