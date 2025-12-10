import { useState, useEffect, useCallback } from 'react';

/**
 * Hook for animating numbers from 0 to target value
 */
export function useAnimatedNumber(
  targetValue: number,
  options: {
    duration?: number;
    delay?: number;
    enabled?: boolean;
  } = {},
): number {
  const { duration = 1800, delay = 0, enabled = true } = options;
  const [currentValue, setCurrentValue] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setCurrentValue(0);
      setStarted(false);
      return () => {
        // Cleanup when disabled
      };
    }

    const timeout = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(timeout);
  }, [delay, enabled]);

  useEffect(() => {
    if (!started || !enabled) {
      return () => {
        // Cleanup when not started or disabled
      };
    }

    const startTime = Date.now();
    let rafId: number;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic for satisfying deceleration
      const eased = 1 - (1 - progress) ** 3;
      setCurrentValue(Math.floor(eased * targetValue));

      if (progress < 1) {
        rafId = requestAnimationFrame(animate);
      }
    };

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [started, targetValue, duration, enabled]);

  return currentValue;
}

/**
 * Hook for managing card navigation with swipe and tap support
 */
export function useCardNavigation(totalCards: number) {
  const [currentCard, setCurrentCard] = useState(0);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  const [isAnimating, setIsAnimating] = useState(false);

  const goToCard = useCallback(
    (index: number, dir?: 'next' | 'prev') => {
      if (isAnimating || index < 0 || index >= totalCards) {
        return;
      }

      setIsAnimating(true);
      setDirection(dir || (index > currentCard ? 'next' : 'prev'));
      setCurrentCard(index);

      // Reset animation lock after transition
      setTimeout(() => setIsAnimating(false), 500);
    },
    [currentCard, isAnimating, totalCards],
  );

  const goNext = useCallback(() => {
    if (currentCard < totalCards - 1) {
      goToCard(currentCard + 1, 'next');
    }
  }, [currentCard, totalCards, goToCard]);

  const goPrev = useCallback(() => {
    if (currentCard > 0) {
      goToCard(currentCard - 1, 'prev');
    }
  }, [currentCard, goToCard]);

  // Tap to advance
  const handleTap = useCallback(
    (e: React.MouseEvent) => {
      // Don't advance if clicking on interactive elements
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.closest('button') ||
        target.closest('a')
      ) {
        return;
      }
      goNext();
    },
    [goNext],
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        goNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goPrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goNext, goPrev]);

  return {
    currentCard,
    direction,
    isAnimating,
    goToCard,
    goNext,
    goPrev,
    handleTap,
  };
}

/**
 * Hook for staggered animation delays
 */
export function useStaggeredAnimation(
  itemCount: number,
  baseDelay = 0,
  stagger = 100,
): number[] {
  return Array.from({ length: itemCount }, (_, i) => baseDelay + i * stagger);
}
