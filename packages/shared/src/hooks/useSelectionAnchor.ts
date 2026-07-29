import type { RefObject } from 'react';
import { useLayoutEffect, useState } from 'react';
import type { TextSelectionRect } from './useTextSelectionShare';
import { useEventListener } from './useEventListener';
import { useVisualViewport } from './utils/useVisualViewport';

// Breathing room between the selection and the bar.
const ANCHOR_GAP = 8;
// Below this distance from the top of the viewport there is no room above the
// selection, so the bar flips underneath it.
const FLIP_THRESHOLD = 64;
const VIEWPORT_MARGIN = 8;

export interface SelectionAnchor {
  left: number;
  top: number;
  flipsBelow: boolean;
  /** False until the bar has been measured; anchoring before that would jump. */
  isMeasured: boolean;
}

const readViewportOffset = () => ({
  left: globalThis?.window?.visualViewport?.offsetLeft ?? 0,
  top: globalThis?.window?.visualViewport?.offsetTop ?? 0,
});

/**
 * Places a fixed-position bar against a selection: centred above it, flipped
 * below when there is no room, and clamped so it never leaves the viewport.
 *
 * Clamping uses the *visual* viewport. Pinch-zoom pans the visual viewport
 * without moving the layout viewport a `fixed` element sits in, so a bar
 * anchored to layout coordinates drifts off screen on a zoomed phone.
 */
export const useSelectionAnchor = (
  rect: TextSelectionRect | null,
  barRef: RefObject<HTMLElement>,
): SelectionAnchor => {
  const [barWidth, setBarWidth] = useState<number | null>(null);
  const { width: viewportWidth } = useVisualViewport();
  const [viewportOffset, setViewportOffset] = useState(readViewportOffset);

  useLayoutEffect(() => {
    if (barRef.current) {
      setBarWidth(barRef.current.offsetWidth);
    }

    // Read the pan offset here too, not only on the next `scroll`. A reader who
    // pinch-zoomed and panned *before* selecting — the usual order on mobile —
    // would otherwise be clamped against a stale origin until they panned again.
    setViewportOffset(readViewportOffset());
  }, [barRef, rect]);

  useEventListener(
    rect ? globalThis?.window?.visualViewport : null,
    'scroll',
    () => setViewportOffset(readViewportOffset()),
  );

  if (!rect) {
    return { left: 0, top: 0, flipsBelow: false, isMeasured: false };
  }

  const availableWidth = viewportWidth || globalThis?.window?.innerWidth || 0;
  const half = (barWidth ?? 0) / 2;
  const minCenter = viewportOffset.left + VIEWPORT_MARGIN + half;
  const maxCenter =
    viewportOffset.left + availableWidth - VIEWPORT_MARGIN - half;
  const center = rect.left + (rect.right - rect.left) / 2;
  const flipsBelow = rect.top - viewportOffset.top < FLIP_THRESHOLD;

  return {
    left: Math.min(Math.max(center, minCenter), Math.max(minCenter, maxCenter)),
    top: flipsBelow ? rect.bottom + ANCHOR_GAP : rect.top - ANCHOR_GAP,
    flipsBelow,
    isMeasured: barWidth !== null,
  };
};
