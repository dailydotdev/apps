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

export interface CardConfig {
  id: string;
  component: React.ComponentType<{
    data: unknown;
    isActive: boolean;
    subcard?: number;
    isTouchDevice?: boolean;
  }>;
  subcards?: number; // Number of subcards (0 or undefined = no subcards)
}

/**
 * Hook for managing card navigation with swipe support and subcards
 * Subcards allow transitioning through multiple views within a single card
 */
export function useCardNavigation(cards: CardConfig[]) {
  const [currentCard, setCurrentCard] = useState(0);
  const [currentSubcard, setCurrentSubcard] = useState(0);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  const [isAnimating, setIsAnimating] = useState(false);

  const totalCards = cards.length;

  const goNext = useCallback(() => {
    if (isAnimating) {
      return;
    }

    const currentCardConfig = cards[currentCard];
    const maxSubcard = currentCardConfig?.subcards || 0;

    // If there are more subcards, go to next subcard
    if (currentSubcard < maxSubcard) {
      setIsAnimating(true);
      setDirection('next');
      setCurrentSubcard(currentSubcard + 1);
      setTimeout(() => setIsAnimating(false), 500);
      return;
    }

    // Otherwise, go to next card (reset subcard to 0)
    if (currentCard < totalCards - 1) {
      setIsAnimating(true);
      setDirection('next');
      setCurrentCard(currentCard + 1);
      setCurrentSubcard(0);
      setTimeout(() => setIsAnimating(false), 500);
    }
  }, [cards, currentCard, currentSubcard, isAnimating, totalCards]);

  const goPrev = useCallback(() => {
    if (isAnimating) {
      return;
    }

    // If there are previous subcards, go to previous subcard
    if (currentSubcard > 0) {
      setIsAnimating(true);
      setDirection('prev');
      setCurrentSubcard(currentSubcard - 1);
      setTimeout(() => setIsAnimating(false), 500);
      return;
    }

    // Otherwise, go to previous card (at its last subcard)
    if (currentCard > 0) {
      setIsAnimating(true);
      setDirection('prev');
      const prevCardIndex = currentCard - 1;
      const prevCardConfig = cards[prevCardIndex];
      const prevCardMaxSubcard = prevCardConfig?.subcards || 0;
      setCurrentCard(prevCardIndex);
      setCurrentSubcard(prevCardMaxSubcard);
      setTimeout(() => setIsAnimating(false), 500);
    }
  }, [cards, currentCard, currentSubcard, isAnimating]);

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
    currentSubcard,
    direction,
    isAnimating,
    goNext,
    goPrev,
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
