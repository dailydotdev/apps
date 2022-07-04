import { useEffect, useState, useMemo } from 'react';
import useDebounce from './useDebounce';

interface UseDynamicLoadedAnimation {
  isAnimated: boolean;
  isLoaded: boolean;
  setLoaded: () => unknown;
  setHidden: () => unknown;
}

interface UseDynamicLoadedAnimationProps {
  outDuration?: number;
}

export const useDynamicLoadedAnimation = ({
  outDuration = 300,
}: UseDynamicLoadedAnimationProps = {}): UseDynamicLoadedAnimation => {
  const [isAnimated, setIsAnimated] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [removeLoaded] = useDebounce(() => setIsLoaded(false), outDuration);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    setIsAnimated(true);
  }, [isLoaded]);

  useEffect(() => {
    if (isAnimated) {
      return;
    }

    removeLoaded();
  }, [isAnimated]);

  return useMemo(
    () => ({
      isLoaded,
      isAnimated,
      setLoaded: () => setIsLoaded(true),
      setHidden: () => setIsAnimated(false),
    }),
    [isLoaded, isAnimated, setIsLoaded, setIsAnimated],
  );
};
