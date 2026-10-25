import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';

const SHOW_MORE_SUFFIX = '… Show more';

/**
 * Video TL;DR capped to four lines. When the text overflows we truncate it at a
 * word boundary and append an inline "… Show more" in the same font as the body
 * (only the link is recolored) — a real ellipsis cut rather than a fade
 * overlay. The fitting prefix is measured with an off-screen clone so the
 * suffix always lands on the last visible line.
 */
export const PostHybridVideoSummary = ({
  summary,
  trailing,
}: {
  summary: string;
  trailing?: ReactNode;
}): ReactElement => {
  const ref = useRef<HTMLParagraphElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  // `null` => not measured yet or text fits; a string => the truncated prefix.
  const [truncated, setTruncated] = useState<string | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || isExpanded) {
      setTruncated(null);
      return undefined;
    }

    const measure = () => {
      const clone = el.cloneNode(false) as HTMLElement;
      clone.classList.remove('line-clamp-4');
      Object.assign(clone.style, {
        position: 'absolute',
        visibility: 'hidden',
        pointerEvents: 'none',
        width: `${el.clientWidth}px`,
        height: 'auto',
        maxHeight: 'none',
      });
      el.parentElement?.appendChild(clone);

      clone.textContent = 'Mg';
      const maxHeight = clone.scrollHeight * 4 + 1;

      clone.textContent = summary;
      if (clone.scrollHeight <= maxHeight) {
        clone.remove();
        setTruncated(null);
        return;
      }

      let lo = 0;
      let hi = summary.length;
      let best = 0;
      while (lo <= hi) {
        const mid = Math.floor((lo + hi) / 2);
        clone.textContent = `${summary
          .slice(0, mid)
          .trimEnd()}${SHOW_MORE_SUFFIX}`;
        if (clone.scrollHeight <= maxHeight) {
          best = mid;
          lo = mid + 1;
        } else {
          hi = mid - 1;
        }
      }
      clone.remove();

      // Snap back to the previous word boundary so we never cut mid-word.
      const prefix = summary.slice(0, best).trimEnd();
      const lastSpace = prefix.lastIndexOf(' ');
      const snapped = lastSpace > 0 ? prefix.slice(0, lastSpace) : prefix;
      // Never render a bare "… Show more" with no preview; fall back to the
      // CSS line-clamp instead.
      setTruncated(snapped || null);
    };

    measure();
    if (typeof ResizeObserver === 'undefined') {
      return undefined;
    }
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [summary, isExpanded]);

  const isTruncated = !isExpanded && truncated !== null;

  return (
    <p
      ref={ref}
      className={classNames(
        'select-text break-words text-text-secondary typo-markdown',
        // Fallback clamp until the prefix is measured (and on SSR) so the full
        // text never flashes.
        truncated === null && !isExpanded && 'line-clamp-4',
      )}
      data-testid="tldr-container"
    >
      {isTruncated ? (
        <>
          {truncated}
          {'… '}
          <button
            type="button"
            onClick={() => setIsExpanded(true)}
            className="text-text-link hover:underline"
          >
            Show more
          </button>
        </>
      ) : (
        summary
      )}
      {trailing}
    </p>
  );
};
