import type { RefObject } from 'react';
import { useEffect, useState } from 'react';
import { scroll } from './constants';
import { setShellDeadZone, useShellEdge } from './useShellScroll';

// True once the element has scrolled up behind the top block: a thing's
// name or its hero, so the block can take over what just left the screen.
// Measured on every scroll and layout change rather than by an
// IntersectionObserver: the observer only speaks again when the element
// crosses the edge, so a wrong first answer while the page settled (seen
// in the iOS app) left a squad's block solid over its cover until a scroll.
export const usePassedBlock = (
  ref: RefObject<HTMLElement>,
  enabled = true,
): boolean => {
  const [passed, setPassed] = useState(false);
  const blockBottom = useShellEdge();

  useEffect(() => {
    const element = ref.current;
    if (!enabled || !element) {
      setPassed(false);
      return undefined;
    }

    let frame = 0;
    const measure = () => {
      frame = 0;
      setPassed(element.getBoundingClientRect().bottom <= blockBottom);
    };
    const schedule = () => {
      if (!frame) {
        frame = window.requestAnimationFrame(measure);
      }
    };
    measure();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    const observer =
      typeof ResizeObserver === 'undefined'
        ? undefined
        : new ResizeObserver(schedule);
    observer?.observe(document.body);

    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      observer?.disconnect();
      if (frame) {
        window.cancelAnimationFrame(frame);
      }
    };
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
