import type { RefObject } from 'react';
import { useEffect, useRef, useState } from 'react';

const usePrefersReducedMotion = (): boolean => {
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
    if (
      typeof IntersectionObserver === 'undefined' ||
      typeof window === 'undefined'
    ) {
      setInView(true);
      return undefined;
    }

    let revealed = false;
    let rafId: number | undefined;
    let observer: IntersectionObserver | undefined;

    const reveal = () => {
      if (revealed) {
        return;
      }
      revealed = true;
      setInView(true);
    };

    // The observed element can mount after this effect first runs (e.g. it sits
    // behind a loading skeleton until data lands), so poll for it across frames
    // instead of bailing once when `ref.current` is still null.
    const observe = () => {
      if (revealed) {
        return;
      }
      const element = ref.current;
      if (!element) {
        rafId = window.requestAnimationFrame(observe);
        return;
      }

      const rect = element.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        reveal();
        return;
      }

      observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            reveal();
            observer?.disconnect();
          }
        },
        { rootMargin: '0px 0px -10% 0px', threshold: 0.15 },
      );
      observer.observe(element);
    };

    observe();

    // Safety net so content is never left hidden where observer callbacks are
    // throttled or the element never intersects.
    const fallback = window.setTimeout(reveal, fallbackMs);

    return () => {
      if (rafId) {
        window.cancelAnimationFrame(rafId);
      }
      observer?.disconnect();
      window.clearTimeout(fallback);
    };
  }, [fallbackMs]);

  return { ref, inView };
};

// Counts to `target` once `active` is true, animating from the value it's
// currently showing. The first reveal fills from 0; later target changes roll
// from the previous number to the new one (so the meter visibly ticks up when
// fresh data lands). Reduced motion or no rAF resolves immediately to the
// target.
export const useCountUp = (
  target: number,
  active: boolean,
  durationMs = 1100,
): number => {
  const reducedMotion = usePrefersReducedMotion();
  const [value, setValue] = useState(0);
  const valueRef = useRef(0);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!active) {
      return undefined;
    }
    if (
      reducedMotion ||
      typeof window === 'undefined' ||
      typeof window.requestAnimationFrame !== 'function'
    ) {
      valueRef.current = target;
      setValue(target);
      return undefined;
    }

    const from = valueRef.current;
    const delta = target - from;
    if (delta === 0) {
      return undefined;
    }

    const start = performance.now();
    const step = (now: number) => {
      const progress = Math.min(1, (now - start) / durationMs);
      const eased = 1 - (1 - progress) ** 3;
      const next = Math.round(from + delta * eased);
      valueRef.current = next;
      setValue(next);
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
