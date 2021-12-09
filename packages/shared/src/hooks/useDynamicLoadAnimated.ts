import { useEffect, useState, useRef, useMemo } from 'react';

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
  const animationRef = useRef<number>();

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

    if (animationRef.current) {
      clearTimeout(animationRef.current);
    }

    animationRef.current = window.setTimeout(
      () => setIsLoaded(false),
      outDuration,
    );
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
