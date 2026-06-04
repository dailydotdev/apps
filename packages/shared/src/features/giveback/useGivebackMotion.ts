import type { RefObject } from 'react';
import { useEffect, useRef, useState } from 'react';

export const usePrefersReducedMotion = (): boolean => {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return undefined;
    }
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(query.matches);
    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches);

    if (typeof query.addEventListener === 'function') {
      query.addEventListener('change', onChange);
      return () => query.removeEventListener('change', onChange);
    }
    // Fallback for older MediaQueryList implementations (and some test envs).
    if (typeof query.addListener === 'function') {
      query.addListener(onChange);
      return () => query.removeListener(onChange);
    }
    return undefined;
  }, []);

  return reduced;
};

interface UseInViewResult<T extends Element> {
  ref: RefObject<T>;
  inView: boolean;
}

// Reveals once and stays revealed. Falls back to visible when
// IntersectionObserver is unavailable, and a safety timeout guarantees content
// is never left hidden in environments where observer callbacks are throttled.
export const useInView = <T extends Element>(
  fallbackMs = 1400,
): UseInViewResult<T> => {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return undefined;
    }

    if (
      typeof IntersectionObserver === 'undefined' ||
      typeof window === 'undefined'
    ) {
      setInView(true);
      return undefined;
    }

    const reveal = () => setInView(true);

    const rect = element.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      reveal();
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          reveal();
          observer.disconnect();
        }
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.15 },
    );
    observer.observe(element);

    const fallback = window.setTimeout(reveal, fallbackMs);

    return () => {
      observer.disconnect();
      window.clearTimeout(fallback);
    };
  }, [fallbackMs]);

  return { ref, inView };
};

// Counts up to `target` once `active` is true. Reduced motion or a falsy target
// resolves immediately to the final value.
export const useCountUp = (
  target: number,
  active: boolean,
  durationMs = 1100,
): number => {
  const reducedMotion = usePrefersReducedMotion();
  const [value, setValue] = useState(0);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!active) {
      return undefined;
    }
    if (
      reducedMotion ||
      target <= 0 ||
      typeof window === 'undefined' ||
      typeof window.requestAnimationFrame !== 'function'
    ) {
      setValue(target);
      return undefined;
    }

    const start = performance.now();
    const step = (now: number) => {
      const progress = Math.min(1, (now - start) / durationMs);
      const eased = 1 - (1 - progress) ** 3;
      setValue(Math.round(target * eased));
      if (progress < 1) {
        frameRef.current = window.requestAnimationFrame(step);
      }
    };
    frameRef.current = window.requestAnimationFrame(step);

    return () => {
      if (frameRef.current) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, [active, target, durationMs, reducedMotion]);

  return value;
};
