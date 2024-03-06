import { useCallback, useState } from 'react';
import type Router from 'next/router';
import { useRouter } from 'next/router';
import useDebounce from '../useDebounce';
import { useFeature } from '../../components/GrowthBookProvider';
import { feature } from '../../lib/featureManagement';

interface UseOnboardingAnimation {
  isAnimating: boolean;
  postOnboardingRedirect: (param: Parameters<typeof Router.replace>[0]) => void;
  finishedOnboarding: boolean;
  onFinishedOnboarding: () => void;
}

interface UseOnboardingAnimationProps {
  animationMs?: number;
}

const DEFAULT_ANIMATION_MS = 2750;

export const useOnboardingAnimation = ({
  animationMs = DEFAULT_ANIMATION_MS,
}: UseOnboardingAnimationProps = {}): UseOnboardingAnimation => {
  const router = useRouter();
  const onboardingAnimation = useFeature(feature.onboardingAnimation);
  const [finishedOnboarding, setFinishedOnboarding] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animate] = useDebounce(() => setIsAnimating(true), 1);
  const [delayedRedirect] = useDebounce(router.replace, animationMs);

  const onFinishedOnboarding = useCallback(() => {
    setFinishedOnboarding(true);

    if (onboardingAnimation) {
      animate();
    }
  }, [animate, onboardingAnimation]);

  return {
    postOnboardingRedirect: onboardingAnimation
      ? delayedRedirect
      : router.replace,
    isAnimating,
    finishedOnboarding,
    onFinishedOnboarding,
  };
};
