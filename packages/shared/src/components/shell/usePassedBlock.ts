import type { RefObject } from 'react';
import { useEffect, useState } from 'react';
import { scroll } from './constants';
import { setShellDeadZone, useShellEdge } from './useShellScroll';

// True once the element has scrolled up behind the top block: a thing's
// name or its hero, so the block can take over what just left the screen.
export const usePassedBlock = (
  ref: RefObject<HTMLElement>,
  enabled = true,
): boolean => {
  const [passed, setPassed] = useState(false);
  const blockBottom = useShellEdge();

  useEffect(() => {
    const element = ref.current;
    if (!enabled || !element || typeof IntersectionObserver === 'undefined') {
      setPassed(false);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) =>
        setPassed(
          !entry.isIntersecting && entry.boundingClientRect.top < blockBottom,
        ),
      { rootMargin: `-${blockBottom}px 0px 0px 0px` },
    );
    observer.observe(element);

    return () => observer.disconnect();
  }, [ref, enabled, blockBottom]);

  return passed;
};

// On a thing's page the block stays through the hero and a little past it,
// so the name, Follow and the segments are seen arriving in it on the way
// down instead of only on a scroll back up.
export const useHeroDeadZone = (
  ref: RefObject<HTMLElement>,
  enabled = true,
): void => {
  useEffect(() => {
    const element = ref.current;
    if (!enabled || !element) {
      return undefined;
    }

    const measure = () =>
      setShellDeadZone(
        element.getBoundingClientRect().bottom +
          window.scrollY +
          scroll.heroDeadZone,
      );
    measure();
    const observer =
      typeof ResizeObserver === 'undefined'
        ? undefined
        : new ResizeObserver(measure);
    observer?.observe(element);

    return () => {
      observer?.disconnect();
      setShellDeadZone();
    };
  }, [ref, enabled]);
};
