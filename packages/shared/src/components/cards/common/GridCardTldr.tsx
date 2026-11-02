import type { CSSProperties, ReactElement } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import type { Post } from '../../../graphql/posts';
import { useConditionalFeature } from '../../../hooks/useConditionalFeature';
import { featureGridCardTldr } from '../../../lib/featureManagement';

/** The cover gives up the TLDR's room, so the card keeps its height. */
export const gridCardTldrCoverClassName = '!h-[5.5rem]';

interface UseGridCardTldr {
  summary?: string;
  isShown: boolean;
  isExpanded: boolean;
  /** Pins the card at the height it had before the TLDR opened. */
  cardStyle?: CSSProperties;
  expand: (cardHeight: number) => void;
}

/**
 * The `grid_card_tldr` experiment: the post's TLDR on a grid card. Only grid
 * cards with a TLDR evaluate the flag, so only grid readers are enrolled. A
 * share shows the TLDR of the post it shares.
 */
export const useGridCardTldr = (post: Post): UseGridCardTldr => {
  const summary = (post.sharedPost ?? post).summary?.trim();
  const { value: isEnabled } = useConditionalFeature({
    feature: featureGridCardTldr,
    shouldEvaluate: !!summary,
  });
  const [isExpanded, setIsExpanded] = useState(false);
  const [cardHeight, setCardHeight] = useState(0);

  return {
    summary,
    isShown: !!isEnabled && !!summary,
    isExpanded,
    cardStyle: isExpanded && cardHeight ? { height: cardHeight } : undefined,
    expand: (height) => {
      setCardHeight(height);
      setIsExpanded(true);
    },
  };
};

interface GridCardTldrProps {
  summary: string;
  isExpanded: boolean;
  onExpand: (cardHeight: number) => void;
  /** Opens the post, for a tap on the TLDR once it is expanded. */
  onOpen: () => void;
}

// "Show more" and the gap above it.
const showMoreHeight = 24;

/**
 * Under the title, as many lines as the card has room for (two at least).
 * Tapping the clamped text or "Show more" expands it in place: the cover makes
 * room and the TLDR scrolls inside the card, so the card never grows. From
 * then on a tap opens the post.
 */
export const GridCardTldr = ({
  summary,
  isExpanded,
  onExpand,
  onOpen,
}: GridCardTldrProps): ReactElement => {
  const ref = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);
  const [isTruncated, setIsTruncated] = useState(false);
  const [lines, setLines] = useState(2);

  useEffect(() => {
    const box = ref.current;
    const text = textRef.current;
    if (!box || !text || isExpanded) {
      return undefined;
    }

    const measure = () => {
      const lineHeight = parseFloat(getComputedStyle(text).lineHeight) || 20;
      const textLines = Math.round(text.scrollHeight / lineHeight);
      const truncated = textLines > Math.floor(box.clientHeight / lineHeight);
      const room = box.clientHeight - (truncated ? showMoreHeight : 0);

      setIsTruncated(truncated);
      setLines(
        truncated ? Math.max(2, Math.floor(room / lineHeight)) : textLines,
      );
    };

    measure();
    if (typeof ResizeObserver === 'undefined') {
      return undefined;
    }

    const observer = new ResizeObserver(measure);
    observer.observe(box);

    return () => observer.disconnect();
  }, [isExpanded, summary]);

  if (isExpanded) {
    return (
      // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
      <div
        className="pointer-events-auto relative z-1 mt-2 min-h-0 flex-1 basis-0 cursor-pointer overflow-y-auto overscroll-contain pb-5 [mask-image:linear-gradient(to_bottom,black_calc(100%-1.25rem),transparent)]"
        onClick={onOpen}
      >
        <p className="break-words text-text-primary typo-callout">{summary}</p>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className="relative mt-2 flex min-h-16 flex-1 basis-0 flex-col items-start"
    >
      <p
        ref={textRef}
        className="line-clamp-[var(--tldr-lines)] break-words text-text-primary typo-callout"
        style={{ '--tldr-lines': lines } as CSSProperties}
      >
        {summary}
      </p>
      {isTruncated && (
        <button
          type="button"
          className="mt-1 text-text-link typo-callout after:absolute after:inset-0"
          onClick={() =>
            onExpand(ref.current?.closest('article')?.offsetHeight ?? 0)
          }
        >
          Show more
        </button>
      )}
    </div>
  );
};
