import type { RefObject } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { usePrefersReducedMotion } from '../../../../hooks/usePrefersReducedMotion';

// Snap padding can leave a rail a few pixels off either end.
const EDGE_SLACK = 32;
const AUTO_ADVANCE_MS = 5000;

export interface SquadRail {
  ref: RefObject<HTMLDivElement>;
  onScroll: () => void;
  /** Slides a page of whole items. */
  scroll: (direction: 1 | -1) => void;
  isAtStart: boolean;
  isAtEnd: boolean;
}

// A snap rail that knows whether it can still move each way, so the arrows
// only show where there is somewhere to go.
export const useSquadRail = (): SquadRail => {
  const ref = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ isAtStart: true, isAtEnd: false });

  const onScroll = useCallback(() => {
    const node = ref.current;

    if (!node) {
      return;
    }

    setEdges({
      isAtStart: node.scrollLeft <= EDGE_SLACK,
      isAtEnd:
        node.scrollLeft + node.clientWidth >= node.scrollWidth - EDGE_SLACK,
    });
  }, []);

  useEffect(onScroll, [onScroll]);

  const scroll = useCallback((direction: 1 | -1) => {
    const node = ref.current;
    const first = node?.firstElementChild as HTMLElement | null;

    if (!node || !first) {
      return;
    }

    const style = getComputedStyle(node);
    const gap = parseFloat(style.columnGap) || 0;
    const step = first.offsetWidth + gap;
    const inner =
      node.clientWidth -
      parseFloat(style.paddingLeft) -
      parseFloat(style.paddingRight);
    const perPage = Math.max(1, Math.floor((inner + gap) / step));

    node.scrollBy({ left: direction * perPage * step, behavior: 'smooth' });
  }, []);

  return { ref, onScroll, scroll, ...edges };
};

// Slides the rail every five seconds, back to the start after the last item.
// It holds while the pointer or focus is on the section, stops for good once
// the reader swipes, scrolls or uses the arrows, and never runs with reduced
// motion or in a hidden tab.
export const useRailAutoAdvance = (
  rail: SquadRail,
  section: RefObject<HTMLElement>,
): { stop: () => void } => {
  const isHeld = useRef(false);
  const isStopped = useRef(false);
  const prefersReducedMotion = usePrefersReducedMotion();
  const { ref: railRef, scroll } = rail;
  const stop = useCallback(() => {
    isStopped.current = true;
  }, []);

  useEffect(() => {
    const node = section.current;
    const scroller = railRef.current;

    if (!node || !scroller || prefersReducedMotion) {
      return undefined;
    }

    const hold = () => {
      isHeld.current = true;
    };
    const release = () => {
      isHeld.current = false;
    };
    const onFocusOut = (event: FocusEvent) => {
      if (!node.contains(event.relatedTarget as Node | null)) {
        release();
      }
    };

    node.addEventListener('mouseenter', hold);
    node.addEventListener('mouseleave', release);
    node.addEventListener('focusin', hold);
    node.addEventListener('focusout', onFocusOut);
    scroller.addEventListener('pointerdown', stop);
    scroller.addEventListener('wheel', stop, { passive: true });
    scroller.addEventListener('touchstart', stop, { passive: true });

    const timer = window.setInterval(() => {
      if (isStopped.current || isHeld.current || document.hidden) {
        return;
      }

      const isAtEnd =
        scroller.scrollLeft + scroller.clientWidth >=
        scroller.scrollWidth - EDGE_SLACK;

      if (isAtEnd) {
        scroller.scrollTo({ left: 0, behavior: 'smooth' });
        return;
      }

      scroll(1);
    }, AUTO_ADVANCE_MS);

    return () => {
      window.clearInterval(timer);
      node.removeEventListener('mouseenter', hold);
      node.removeEventListener('mouseleave', release);
      node.removeEventListener('focusin', hold);
      node.removeEventListener('focusout', onFocusOut);
      scroller.removeEventListener('pointerdown', stop);
      scroller.removeEventListener('wheel', stop);
      scroller.removeEventListener('touchstart', stop);
    };
  }, [section, railRef, scroll, stop, prefersReducedMotion]);

  return { stop };
};
