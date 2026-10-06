import { swipe } from './constants';

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
