import type { RefObject } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface UseSingleRowOverflow {
  containerRef: RefObject<HTMLDivElement>;
  visibleCount: number;
}

// Keeps the shortcuts row on a single line. The tiles are all rendered (so
// reorder/drag keeps the full list) but laid out with `flex-nowrap`; this
// measures how many fit across one row and reports the count so the parent can
// hide the overflow instead of wrapping onto a second row. Hidden shortcuts
// stay reachable through the row's overflow menu.
//
// The available width is read from the row's (bounded) parent rather than the
// tiles container's own width — the tiles container's box may not have shrunk
// yet on the frame we measure, but the parent is pinned to the column width.
// Trailing controls beside the tiles (add tile, overflow menu) are subtracted
// so they always stay visible. All children keep their layout box even when
// hidden (`visibility: hidden`), so measured widths stay stable and the count
// can't oscillate.
export function useSingleRowOverflow(
  itemCount: number,
  // Bump when the rendered children change in a way that affects their widths
  // (appearance, labels) so the row re-measures.
  resetKey: unknown,
): UseSingleRowOverflow {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(itemCount);

  const measure = useCallback(() => {
    const tiles = containerRef.current;
    const row = tiles?.parentElement;
    if (!tiles || !row) {
      return;
    }

    const rowGap = parseFloat(getComputedStyle(row).columnGap) || 0;
    // Width the row is allowed (the parent is pinned to the column width).
    let available = row.clientWidth;
    // Reserve the trailing controls (add tile, overflow menu) that sit beside
    // the tiles container so the tiles never push them off the row.
    Array.from(row.children).forEach((child) => {
      const el = child as HTMLElement;
      if (el === tiles || el.offsetWidth === 0) {
        return;
      }
      const style = getComputedStyle(el);
      const marginX =
        (parseFloat(style.marginLeft) || 0) +
        (parseFloat(style.marginRight) || 0);
      available -= el.offsetWidth + marginX + rowGap;
    });

    const tileGap = parseFloat(getComputedStyle(tiles).columnGap) || 0;
    const tileEls = Array.from(tiles.children) as HTMLElement[];
    let used = 0;
    let fit = 0;
    for (let index = 0; index < tileEls.length; index += 1) {
      used += (index === 0 ? 0 : tileGap) + tileEls[index].offsetWidth;
      if (used > available) {
        break;
      }
      fit += 1;
    }
    setVisibleCount(fit);
  }, []);

  useEffect(() => {
    measure();
    const row = containerRef.current?.parentElement;
    if (!row || typeof ResizeObserver === 'undefined') {
      return undefined;
    }
    const observer = new ResizeObserver(measure);
    observer.observe(row);
    return () => observer.disconnect();
  }, [measure, itemCount, resetKey]);

  return { containerRef, visibleCount };
}
