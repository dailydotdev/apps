import { useCallback, useState } from 'react';
import type Router from 'next/router';
import { useRouter } from 'next/router';
import useDebounce from './useDebounce';

interface UseProgressAnimation {
  isAnimating: boolean;
  delayedRedirect: (param: Parameters<typeof Router.replace>[0]) => void;
  finished: boolean;
  onFinished: () => void;
}

interface UseProgressAnimationProps {
  animationMs?: number;
}

const DEFAULT_ANIMATION_MS = 2750;

export const useProgressAnimation = ({
  animationMs = DEFAULT_ANIMATION_MS,
}: UseProgressAnimationProps = {}): UseProgressAnimation => {
  const router = useRouter();
  const [finished, setFinished] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animate] = useDebounce(() => setIsAnimating(true), 1);
  const [delayedRedirect] = useDebounce(router.replace, animationMs);

  const onFinished = useCallback(() => {
    setFinished(true);

    animate();
  }, [animate]);

  return {
    delayedRedirect,
    isAnimating,
    finished,
    onFinished,
  };
};
