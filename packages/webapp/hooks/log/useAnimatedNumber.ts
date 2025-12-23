import { useState, useEffect } from 'react';

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
  const { duration = 1000, delay = 0, enabled = true } = options;
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
