import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { RefObject } from 'react';
import { flushSync } from 'react-dom';

/** Upper bound on tags passed to the measurer (matches curated list size). */
export const POPULAR_TAGS_WRAP_FIT_CAP = 64;

type ChipBox = { top: number; bottom: number };

/**
 * `offsetTop` on flex children is relative to `offsetParent` (often a positioned
 * ancestor), not the wrapping `ul`. Use rects relative to the list container.
 */
function measureChipBoxes(container: HTMLElement): ChipBox[] {
  const c = container.getBoundingClientRect();

  return Array.from(container.children).map((child) => {
    const r = (child as HTMLElement).getBoundingClientRect();

    return {
      top: r.top - c.top,
      bottom: r.bottom - c.top,
    };
  });
}

function groupFlexWrapRows(boxes: ChipBox[]): ChipBox[][] {
  return boxes.reduce<ChipBox[][]>((rows, box) => {
    const topKey = Math.round(box.top);
    const prev = rows[rows.length - 1];
    if (!prev || Math.round(prev[0].top) !== topKey) {
      rows.push([box]);
    } else {
      prev.push(box);
    }
    return rows;
  }, []);
}

function countWrappedChipsThatFit(container: HTMLElement): number {
  const available = container.clientHeight;
  if (available < 1) {
    return 0;
  }

  const boxes = measureChipBoxes(container);
  if (boxes.length === 0) {
    return 0;
  }

  const rows = groupFlexWrapRows(boxes);

  const { total } = rows.reduce(
    (acc, row) => {
      if (acc.stop) {
        return acc;
      }
      const rowBottom = Math.max(...row.map((b) => b.bottom));
      if (rowBottom > available + 0.5) {
        return { ...acc, stop: true };
      }
      return { total: acc.total + row.length, stop: false };
    },
    { total: 0, stop: false },
  );

  return total;
}

/**
 * Renders as many tag chips as fit in a flex-wrapped list (no inner scroll).
 * Re-measures when candidates or container size change.
 */
export function usePopularTagsWrapFit<T extends { slug: string }>(
  tags: readonly T[],
): { listRef: RefObject<HTMLUListElement | null>; visibleTags: T[] } {
  const candidates = useMemo(
    () => tags.slice(0, POPULAR_TAGS_WRAP_FIT_CAP),
    [tags],
  );

  const listRef = useRef<HTMLUListElement | null>(null);
  const [visibleCount, setVisibleCount] = useState(1);

  useLayoutEffect(() => {
    setVisibleCount(1);
  }, [candidates]);

  const recompute = useCallback(() => {
    const el = listRef.current;
    if (!el) {
      return;
    }

    if (candidates.length === 0) {
      flushSync(() => {
        setVisibleCount(0);
      });
      return;
    }

    flushSync(() => {
      setVisibleCount(candidates.length);
    });

    const available = el.clientHeight;
    if (available < 1) {
      return;
    }

    const fit = countWrappedChipsThatFit(el);
    const next = Math.max(1, Math.min(fit, candidates.length));

    if (next !== candidates.length) {
      flushSync(() => {
        setVisibleCount(next);
      });
    }
  }, [candidates]);

  useLayoutEffect(() => {
    recompute();
  }, [recompute]);

  useLayoutEffect(() => {
    const el = listRef.current;
    if (!el) {
      return undefined;
    }

    const ro = new ResizeObserver(() => {
      requestAnimationFrame(() => {
        recompute();
      });
    });

    ro.observe(el);
    return () => {
      ro.disconnect();
    };
  }, [recompute]);

  const visibleTags = useMemo(
    () => candidates.slice(0, visibleCount),
    [candidates, visibleCount],
  );

  return { listRef, visibleTags };
}
