import { useCallback, useEffect, useState } from 'react';

interface FittedLineClamp {
  /** The box the text has to fit inside. */
  containerRef: (node: HTMLElement | null) => void;
  /** The text itself, which must be the last thing in that box. */
  textRef: (node: HTMLElement | null) => void;
  /** Whole lines that fit, never more than `maxLines`. */
  lines: number;
}

/**
 * How many whole lines of a block still fit the room left under everything
 * above it.
 *
 * A fixed line count cannot do this: the text starts wherever the copy above it
 * happens to end, and clamping to a count that no longer fits lets the box clip
 * the overflow — a row of glyphs sliced through the middle rather than a
 * paragraph that stops. `-webkit-line-clamp` takes a number, not a height, and
 * the free space is only known once the flex column above has been laid out, so
 * it is measured here and handed back as that number.
 *
 * Reducing the count only makes the text shorter, and the text is the last
 * child, so where it starts does not move and the measurement cannot chase
 * itself.
 */
export const useFittedLineClamp = (maxLines: number): FittedLineClamp => {
  // Nodes as state rather than refs so the effect re-runs when they attach:
  // the card renders no summary at all until the post arrives.
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

      // `normal` gives no number to divide by. Leaving the count alone keeps
      // the CSS clamp, which is the behaviour without this hook at all.
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

    // The container's own height moves the floor; the text's moves the ceiling,
    // and the copy above it can rewrap without either box changing size.
    const observer = new ResizeObserver(measure);

    observer.observe(container);
    observer.observe(text);
    measure();

    return () => observer.disconnect();
  }, [container, text, maxLines]);

  return {
    containerRef: useCallback((node: HTMLElement | null) => {
      setContainer(node);
    }, []),
    textRef: useCallback((node: HTMLElement | null) => {
      setText(node);
    }, []),
    lines,
  };
};
