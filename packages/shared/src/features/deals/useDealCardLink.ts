import type { MouseEvent } from 'react';
import { useCallback, useRef } from 'react';
import type { Deal } from './types';
import { getDealPath } from './dealsFormat';

/** Past this much travel between press and release the gesture was a selection. */
const DRAG_SLOP_PX = 6;

export interface DealCardLink {
  href: string;
  onMouseDown: (event: MouseEvent<HTMLAnchorElement>) => void;
  onClick: (event: MouseEvent<HTMLAnchorElement>) => void;
}

/**
 * The title anchor is stretched over the whole card, so it is also the card's
 * click target. It stays a real link: modifier and middle clicks fall through
 * to the browser and open the deal page, and only a plain click is taken over
 * by the surface that has a modal to show.
 */
export const useDealCardLink = (
  deal: Deal,
  onOpen?: (deal: Deal) => void,
): DealCardLink => {
  const pressedAt = useRef<{ x: number; y: number }>();

  const onMouseDown = useCallback((event: MouseEvent<HTMLAnchorElement>) => {
    pressedAt.current = { x: event.clientX, y: event.clientY };
  }, []);

  const onClick = useCallback(
    (event: MouseEvent<HTMLAnchorElement>) => {
      const start = pressedAt.current;
      pressedAt.current = undefined;

      // A keyboard activation reports no pointer detail and no press to measure.
      if (event.detail > 0 && start) {
        const travel = Math.hypot(
          event.clientX - start.x,
          event.clientY - start.y,
        );

        if (travel > DRAG_SLOP_PX) {
          event.preventDefault();
          return;
        }
      }

      if (!onOpen || event.metaKey || event.ctrlKey || event.shiftKey) {
        return;
      }

      event.preventDefault();
      onOpen(deal);
    },
    [deal, onOpen],
  );

  return { href: getDealPath(deal), onMouseDown, onClick };
};
