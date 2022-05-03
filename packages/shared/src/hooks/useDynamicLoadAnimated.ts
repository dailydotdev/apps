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
  const [isInitialised, setIsInitialised] = useState(false);
  const animationRef = useRef<number>();

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    setTimeout(() => {
      setIsAnimated(true);
    });
  }, [isLoaded]);

  useEffect(() => {
    if (isAnimated || !isInitialised) {
      return;
    }

    if (animationRef.current) {
      clearTimeout(animationRef.current);
    }

    animationRef.current = window.setTimeout(
      () => setIsLoaded(false),
      outDuration,
    );
  }, [isAnimated, isInitialised]);

  return useMemo(
    () => ({
      isLoaded,
      isAnimated,
      setLoaded: () => {
        setIsLoaded(true);
        setIsInitialised(true);
      },
      setHidden: () => setIsAnimated(false),
    }),
    [isLoaded, isAnimated, setIsLoaded, setIsAnimated],
  );
};
