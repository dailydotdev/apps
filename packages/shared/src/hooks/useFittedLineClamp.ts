import type { CSSProperties } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';

interface FittedLineClamp {
  /** The box the text has to fit inside. */
  containerRef: (node: HTMLElement | null) => void;
  /** The text itself, which must be the last thing in that box. */
  textRef: (node: HTMLElement | null) => void;
  /** Whole lines that fit, never more than `maxLines`. */
  lines: number;
  /**
   * Apply to the text. `-webkit-line-clamp: 0` is invalid and would be dropped,
   * leaving the text unclamped for its `overflow-hidden` parent to slice
   * through a glyph row, so no room at all hides the block instead.
   *
   * `visibility`, not `display`: the measurement reads this element's own top
   * edge, and `display: none` reports a 0x0 box at the origin — which measures
   * as a full viewport of room, brings the text back, and oscillates.
   */
  style: CSSProperties;
}

/**
 * How many whole lines of a block still fit the room left under everything
 * above it. `-webkit-line-clamp` takes a number, not a height, and the free
 * space is only known once the flex column above has been laid out, so it is
 * measured and handed back as that number. Clamping to a count that no longer
 * fits would let the box clip a row of glyphs through the middle.
 *
 * Safe against feedback: the text is the last child, so shortening it does not
 * move where it starts.
 */
export const useFittedLineClamp = (maxLines: number): FittedLineClamp => {
  // Nodes as state, not refs, so the effect re-runs when they attach.
  const [container, setContainer] = useState<HTMLElement | null>(null);
  const [text, setText] = useState<HTMLElement | null>(null);
  const [lines, setLines] = useState(maxLines);

  useEffect(() => {
    if (!container || !text || typeof ResizeObserver === 'undefined') {
      return undefined;
    }

    const measure = () => {
      const style = getComputedStyle(text);
      const lineHeight = parseFloat(style.lineHeight);

      // `normal` gives no number to divide by; leave the CSS clamp in charge.
      if (!lineHeight) {
        return;
      }

      const bottom =
        container.getBoundingClientRect().bottom -
        parseFloat(getComputedStyle(container).paddingBottom || '0');
      const available = bottom - text.getBoundingClientRect().top;

      setLines(
        Math.max(0, Math.min(maxLines, Math.floor(available / lineHeight))),
      );
    };

    // The container's height moves the floor, the text's moves the ceiling.
    const observer = new ResizeObserver(measure);

    observer.observe(container);
    observer.observe(text);
    measure();

    return () => observer.disconnect();
  }, [container, text, maxLines]);

  const style = useMemo<CSSProperties>(
    () => (lines > 0 ? { WebkitLineClamp: lines } : { visibility: 'hidden' }),
    [lines],
  );

  return {
    containerRef: useCallback((node: HTMLElement | null) => {
      setContainer(node);
    }, []),
    textRef: useCallback((node: HTMLElement | null) => {
      setText(node);
    }, []),
    lines,
    style,
  };
};
