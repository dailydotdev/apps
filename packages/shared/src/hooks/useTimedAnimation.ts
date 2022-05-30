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

const UNENDING_ANIMATION_ID = 1;
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
      timeout.current = window.setTimeout(onAnimationEnd, outAnimationDuration);
    }
  }, [timer, animationDuration, intervalId]);

  useEffect(() => {
    if (isNullOrUndefined(animationDuration)) {
      return;
    }

    window.clearInterval(intervalId);
    setTimer(animationDuration);

    if (!autoEndAnimation && !intervalId) {
      setIntervalId(UNENDING_ANIMATION_ID);
      return;
    }

    if (animationDuration <= 0) {
      return;
    }

    setIntervalId(
      window.setInterval(
        () =>
          setTimer((current) =>
            PROGRESS_INTERVAL >= current ? 0 : current - PROGRESS_INTERVAL,
          ),
        PROGRESS_INTERVAL,
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
