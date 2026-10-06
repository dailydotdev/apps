import { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useIsPhone } from '../../hooks/useViewSize';
import { motion, swipe } from './constants';
import type { RowItem } from './ShellRow';
import { setPagerPosition } from './segmentPagerStore';

// How far the page gives past the first and last segment.
const edgeElasticity = 0.05;
// A touch that starts this close to a screen edge is the browser's own
// back and forward swipe.
export const edgeGutter = 24;

type SwipeResult = -1 | 0 | 1;

// Which neighbour a finished horizontal drag chose: far enough inside the
// cone, or a quick flick over a shorter distance.
export const resolveSwipe = (
  dx: number,
  dy: number,
  durationMs: number,
): SwipeResult => {
  const absX = Math.abs(dx);
  const absY = Math.abs(dy);
  const inCone = absX > swipe.coneRatio * absY;
  const isFar = absX > swipe.commitDistance;
  const isFlick =
    absX / Math.max(durationMs, 1) > swipe.velocity &&
    absX > swipe.velocityDistance;

  if (!inCone || !(isFar || isFlick)) {
    return 0;
  }

  return dx < 0 ? 1 : -1;
};

export const scrollsSideways = (target: EventTarget | null): boolean => {
  let node = target instanceof Element ? target : null;

  while (node && node !== document.body) {
    if (
      node.matches(
        'input, textarea, select, pre, [contenteditable="true"], [role="dialog"], [role="slider"], nav, header, [data-no-pager]',
      )
    ) {
      return true;
    }
    const { overflowX } = getComputedStyle(node);
    if (
      (overflowX === 'auto' || overflowX === 'scroll') &&
      node.scrollWidth > node.clientWidth
    ) {
      return true;
    }
    node = node.parentElement;
  }

  return false;
};

// Segments answer the thumb: once a touch locks sideways the page follows
// it, and a release past the threshold opens the neighbouring segment the
// way a tap on it would. An abandoned drag springs back.
export const useSegmentPager = (items: RowItem[], enabled = true): void => {
  const router = useRouter();
  const isPhone = useIsPhone();
  const latest = useRef({ items, router });
  latest.current = { items, router };
  const count = items.length;

  useEffect(() => {
    const surface = document.querySelector('main');
    if (!enabled || !isPhone || count < 2 || !surface) {
      return undefined;
    }

    const reducesMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    let startX = 0;
    let startY = 0;
    let startTime = 0;
    let axis: 'x' | 'y' | undefined;
    let tracking = false;

    const move = (dx: number, animated: boolean) => {
      if (reducesMotion) {
        return;
      }
      surface.style.transition = animated
        ? `transform ${motion.snap}ms ${motion.interaction}`
        : 'none';
      surface.style.transform = dx ? `translateX(${dx}px)` : '';
    };

    const onStart = (event: TouchEvent) => {
      const touch = event.touches[0];
      tracking =
        event.touches.length === 1 &&
        document.body.style.position !== 'fixed' &&
        touch.clientX > edgeGutter &&
        touch.clientX < window.innerWidth - edgeGutter &&
        !scrollsSideways(event.target);
      axis = undefined;
      startX = touch.clientX;
      startY = touch.clientY;
      startTime = event.timeStamp;
    };

    const onMove = (event: TouchEvent) => {
      if (!tracking) {
        return;
      }
      const dx = event.touches[0].clientX - startX;
      const dy = event.touches[0].clientY - startY;

      if (!axis) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) < swipe.lockDistance) {
          return;
        }
        axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
        if (axis === 'y') {
          tracking = false;
          return;
        }
      }

      if (event.cancelable) {
        event.preventDefault();
      }
      const index = latest.current.items.findIndex((item) => item.active);
      const hasNeighbour =
        dx < 0 ? index < latest.current.items.length - 1 : index > 0;
      move(hasNeighbour ? dx : dx * edgeElasticity, false);
      setPagerPosition(
        index + (hasNeighbour ? -dx / (surface.clientWidth || 1) : 0),
      );
    };

    const onEnd = (event: TouchEvent) => {
      if (!tracking || axis !== 'x') {
        tracking = false;
        return;
      }
      tracking = false;
      const touch = event.changedTouches[0];
      const direction = resolveSwipe(
        touch.clientX - startX,
        touch.clientY - startY,
        event.timeStamp - startTime,
      );
      const { items: current, router: currentRouter } = latest.current;
      const index = current.findIndex((item) => item.active);
      const next = current[index + direction];
      move(0, true);
      setPagerPosition(direction && next ? index + direction : index);
      window.setTimeout(() => setPagerPosition(null), motion.snap);

      if (!direction || !next) {
        return;
      }
      next.onClick?.();
      if (next.href) {
        currentRouter.replace(next.href);
      }
    };

    surface.addEventListener('touchstart', onStart, { passive: true });
    surface.addEventListener('touchmove', onMove, { passive: false });
    surface.addEventListener('touchend', onEnd);
    surface.addEventListener('touchcancel', onEnd);

    return () => {
      surface.removeEventListener('touchstart', onStart);
      surface.removeEventListener('touchmove', onMove);
      surface.removeEventListener('touchend', onEnd);
      surface.removeEventListener('touchcancel', onEnd);
      surface.style.transform = '';
      surface.style.transition = '';
      setPagerPosition(null);
    };
  }, [enabled, isPhone, count]);
};
