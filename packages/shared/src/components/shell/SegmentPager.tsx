import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { useIsPhone } from '../../hooks/useViewSize';
import { motion, swipe } from './constants';
import type { RowItem } from './ShellRow';
import { setPagerPosition } from './segmentPagerStore';
import { edgeGutter, resolveSwipe, scrollsSideways } from './useSegmentPager';

interface SegmentPagerProps {
  items: RowItem[];
  // The pane a segment shows. The lit one is always mounted; its neighbours
  // mount beside it the moment a drag locks sideways and leave once the
  // track has settled.
  renderPane: (key: string) => ReactNode;
  enabled?: boolean;
  // Light panes stay mounted out of frame instead of mounting on the first
  // drag, so what they hold (a squad's widgets) is there from the start.
  keepMounted?: boolean;
  className?: string;
}

// How far the track gives past the first and last segment.
const edgeElasticity = 0.05;
// If the lit segment never changes after a commit (a navigation that
// failed), the track lets go of the neighbours on its own.
const releaseAfterMs = 800;

const useClientLayoutEffect =
  typeof window === 'undefined' ? useEffect : useLayoutEffect;

// Segments as connected pages: the neighbours' panes stand beside the lit
// one and the whole track follows the finger, as X and Instagram page their
// tabs. A release past the threshold settles on the neighbour and then
// opens it the way a tap on its segment would; the row's highlight slides
// with the track.
export function SegmentPager({
  items,
  renderPane,
  enabled = true,
  keepMounted = false,
  className,
}: SegmentPagerProps): ReactElement {
  const router = useRouter();
  const isPhone = useIsPhone();
  const active = Math.max(
    items.findIndex((item) => item.active),
    0,
  );
  const [spread, setSpread] = useState(false);
  const [settledOn, setSettledOn] = useState<number | null>(null);
  const surfaceRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const shift = useRef(0);
  const latest = useRef({ items, active, router });
  latest.current = { items, active, router };
  const pages = isPhone && enabled && items.length > 1;

  // The lit pane keeps its frame however many panes stand beside it: the
  // track is shifted by the lit pane's own offset plus the drag.
  const place = (dx: number, animated: boolean) => {
    const track = trackRef.current;
    const lit = track?.querySelector<HTMLElement>('[data-lit]');
    if (!track || !lit) {
      return;
    }
    shift.current = dx;
    track.style.transition = animated
      ? `transform ${motion.snap}ms ${motion.interaction}`
      : 'none';
    track.style.transform = `translateX(${dx - lit.offsetLeft}px)`;
  };
  const placeRef = useRef(place);
  placeRef.current = place;

  // Neighbours arriving or leaving move the lit pane within the track; the
  // shift is reapplied before the frame paints so nothing jumps.
  useClientLayoutEffect(() => {
    placeRef.current(shift.current, false);
  }, [spread, active]);

  // Once the segment the track settled on is the lit one, the neighbours
  // leave and the new pane stands alone in the frame.
  useEffect(() => {
    if (settledOn === null) {
      return undefined;
    }
    const release = () => {
      setSettledOn(null);
      setSpread(false);
      shift.current = 0;
      setPagerPosition(null);
    };
    if (settledOn === active) {
      release();
      return undefined;
    }
    const timer = window.setTimeout(release, releaseAfterMs);
    return () => window.clearTimeout(timer);
  }, [settledOn, active]);

  useEffect(() => {
    const surface = surfaceRef.current;
    if (!pages || !surface) {
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
    let committed = false;

    const width = () => surface.clientWidth || window.innerWidth;

    const onStart = (event: TouchEvent) => {
      if (committed) {
        return;
      }
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
        setSpread(true);
      }
      if (event.cancelable) {
        event.preventDefault();
      }
      if (reducesMotion) {
        return;
      }

      const { items: current, active: index } = latest.current;
      const next = index + (dx < 0 ? 1 : -1);
      const hasNeighbour = next >= 0 && next < current.length;
      const give = hasNeighbour ? dx : dx * edgeElasticity;
      placeRef.current(give, false);
      setPagerPosition(index + (hasNeighbour ? -give / width() : 0));
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
      const {
        items: current,
        active: index,
        router: currentRouter,
      } = latest.current;
      const next = current[index + direction];

      if (!direction || !next) {
        placeRef.current(0, true);
        setPagerPosition(index);
        window.setTimeout(() => {
          setSpread(false);
          setPagerPosition(null);
        }, motion.snap);
        return;
      }

      committed = true;
      placeRef.current(-direction * width(), true);
      setPagerPosition(index + direction);
      window.setTimeout(() => {
        committed = false;
        setSettledOn(index + direction);
        next.onClick?.();
        if (next.href) {
          currentRouter.replace(next.href, undefined, { scroll: false });
        }
      }, motion.snap);
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
      setPagerPosition(null);
    };
  }, [pages]);

  const inFrame = pages && spread ? [active - 1, active, active + 1] : [active];
  const panes = (keepMounted ? items.map((_, index) => index) : inFrame)
    .filter((index) => index >= 0 && index < items.length)
    .map((index) => ({ item: items[index], shown: inFrame.includes(index) }));

  return (
    <div ref={surfaceRef} className={className} style={{ overflow: 'clip' }}>
      <div ref={trackRef} className="flex w-full items-start">
        {panes.map(({ item, shown }) => (
          <div
            key={item.key}
            data-lit={items[active]?.key === item.key ? '' : undefined}
            className={shown ? 'w-full shrink-0' : 'hidden'}
          >
            {renderPane(item.key)}
          </div>
        ))}
      </div>
    </div>
  );
}
