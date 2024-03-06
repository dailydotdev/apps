import { useCallback, useState } from 'react';
import type Router from 'next/router';
import { useRouter } from 'next/router';
import useDebounce from '../useDebounce';

interface UseOnboardingAnimation {
  isAnimating: boolean;
  delayedRedirect: (param: Parameters<typeof Router.replace>[0]) => void;
  finishedOnboarding: boolean;
  onFinishedOnboarding: () => void;
}

interface UseOnboardingAnimationProps {
  animationMs?: number;
}

const DEFAULT_ANIMATION_MS = 2000;

export const useOnboardingAnimation = ({
  animationMs = DEFAULT_ANIMATION_MS,
}: UseOnboardingAnimationProps = {}): UseOnboardingAnimation => {
  const router = useRouter();
  const [finishedOnboarding, setFinishedOnboarding] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animate] = useDebounce(() => setIsAnimating(true), 1);
  const [delayedRedirect] = useDebounce(router.replace, animationMs);

  const onFinishedOnboarding = useCallback(() => {
    setFinishedOnboarding(true);
    animate();
  }, [animate]);

  return {
    delayedRedirect,
    isAnimating,
    finishedOnboarding,
    onFinishedOnboarding,
  };
};
