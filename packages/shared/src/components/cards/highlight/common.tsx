import type { ReactElement } from 'react';
import React, { useLayoutEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import type { PostHighlight } from '../../../graphql/highlights';
import { webappUrl } from '../../../lib/constants';
import { RelativeTime } from '../../utilities/RelativeTime';
import Link from '../../utilities/Link';
import { HighlightCardOptions } from './HighlightCardOptions';

export interface HighlightCardProps {
  highlights: PostHighlight[];
  onHighlightClick?: (highlight: PostHighlight, position: number) => void;
  onReadAllClick?: () => void;
}

export const highlightsTitleGradientClassName =
  'feed-highlights-title-gradient';

const HIGHLIGHTS_URL = `${webappUrl}highlights`;

export const getHighlightsUrl = (highlightId?: string): string =>
  highlightId ? `${HIGHLIGHTS_URL}?highlight=${highlightId}` : HIGHLIGHTS_URL;

const getHighlightUrl = (highlight: PostHighlight): string =>
  getHighlightsUrl(highlight.id);

/** Vertical padding on each grid row (`py-2`). */
const GRID_ROW_PADDING_Y_PX = 16;
/** Headline + timestamp block below the title. */
const GRID_ROW_TIME_BLOCK_PX = 18;
/** Matches `typo-callout` line-height (1.25rem) for clamp math. */
const GRID_HEADLINE_LINE_HEIGHT_PX = 20;
const GRID_HEADLINE_MAX_LINES = 3;

const getHeadlineLineClamp = (rowHeightPx: number): number => {
  const headlineArea =
    rowHeightPx - GRID_ROW_PADDING_Y_PX - GRID_ROW_TIME_BLOCK_PX;

  if (headlineArea <= 0) {
    return 1;
  }

  return Math.max(
    1,
    Math.min(
      GRID_HEADLINE_MAX_LINES,
      Math.floor(headlineArea / GRID_HEADLINE_LINE_HEIGHT_PX),
    ),
  );
};

const distributeRowHeights = (
  containerHeightPx: number,
  itemCount: number,
): number[] => {
  if (itemCount <= 0 || containerHeightPx <= 0) {
    return [];
  }

  const baseHeight = Math.floor(containerHeightPx / itemCount);
  const remainder = containerHeightPx % itemCount;

  return Array.from(
    { length: itemCount },
    (_, index) => baseHeight + (index < remainder ? 1 : 0),
  );
};

const useHighlightGridRowHeights = (
  itemCount: number,
): {
  listRef: React.RefObject<HTMLDivElement>;
  rowHeights: number[];
  headlineLineClamps: number[];
} => {
  const listRef = useRef<HTMLDivElement>(null);
  const [rowHeights, setRowHeights] = useState<number[]>([]);
  const [headlineLineClamps, setHeadlineLineClamps] = useState<number[]>([]);

  useLayoutEffect(() => {
    const listElement = listRef.current;

    if (!listElement || itemCount === 0) {
      setRowHeights([]);
      setHeadlineLineClamps([]);
      return undefined;
    }

    const updateRowHeights = (): void => {
      const containerHeightPx = listElement.clientHeight;

      if (containerHeightPx <= 0) {
        return;
      }

      const heights = distributeRowHeights(containerHeightPx, itemCount);
      setRowHeights(heights);
      setHeadlineLineClamps(heights.map(getHeadlineLineClamp));
    };

    updateRowHeights();

    if (typeof ResizeObserver === 'undefined') {
      return undefined;
    }

    const resizeObserver = new ResizeObserver(updateRowHeights);
    resizeObserver.observe(listElement);

    return () => resizeObserver.disconnect();
  }, [itemCount]);

  return { listRef, rowHeights, headlineLineClamps };
};

export const ReadAllHighlightsFooter = ({
  highlightId,
  onClick,
  className,
}: {
  highlightId?: string;
  onClick?: () => void;
  className?: string;
}): ReactElement => {
  const href = getHighlightsUrl(highlightId);
  return (
    <div className={className}>
      <Link href={href}>
        <a
          aria-label="Read all highlights"
          className="bg-surface-float/70 flex h-8 w-full items-center rounded-10 px-3 backdrop-blur-xl"
          href={href}
          onClick={() => onClick?.()}
        >
          <span className="typo-callout">
            <span className={highlightsTitleGradientClassName}>Read all</span>
          </span>
          <span
            aria-hidden
            className={classNames(
              highlightsTitleGradientClassName,
              'ml-auto select-none leading-none typo-title3',
            )}
          >
            →
          </span>
        </a>
      </Link>
    </div>
  );
};

const HighlightRow = ({
  highlight,
  index,
  onHighlightClick,
}: {
  highlight: PostHighlight;
  index: number;
  onHighlightClick?: (highlight: PostHighlight, position: number) => void;
}): ReactElement => {
  return (
    <Link href={getHighlightUrl(highlight)}>
      <a
        className="flex w-full flex-col gap-0 rounded-8 border-b border-border-subtlest-tertiary px-3 py-2 text-left transition-colors hover:bg-surface-hover focus-visible:bg-surface-hover"
        href={getHighlightUrl(highlight)}
        onClick={() => onHighlightClick?.(highlight, index + 1)}
      >
        <span className="break-words font-bold text-text-primary typo-callout">
          {highlight.headline}
        </span>
        <RelativeTime
          dateTime={highlight.highlightedAt}
          maxHoursAgo={72}
          className="mt-0.5 text-text-tertiary typo-footnote"
        />
      </a>
    </Link>
  );
};

const HighlightGridRow = ({
  highlight,
  index,
  onHighlightClick,
  rowHeight,
  headlineLineClamp,
}: {
  highlight: PostHighlight;
  index: number;
  onHighlightClick?: (highlight: PostHighlight, position: number) => void;
  rowHeight?: number;
  headlineLineClamp?: number;
}): ReactElement => (
  <Link href={getHighlightUrl(highlight)}>
    <a
      className="flex min-h-0 items-start overflow-hidden rounded-8 border-b border-border-subtlest-tertiary px-2 py-2 text-left transition-colors last:border-b-0 hover:bg-surface-hover focus-visible:bg-surface-hover"
      href={getHighlightUrl(highlight)}
      style={rowHeight ? { height: rowHeight } : undefined}
      onClick={() => onHighlightClick?.(highlight, index + 1)}
    >
      <span className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <span
          className={classNames(
            'break-words font-bold text-text-primary typo-callout',
            !headlineLineClamp && 'line-clamp-3',
          )}
          style={
            headlineLineClamp
              ? {
                  display: '-webkit-box',
                  WebkitBoxOrient: 'vertical',
                  WebkitLineClamp: headlineLineClamp,
                  overflow: 'hidden',
                }
              : undefined
          }
        >
          {highlight.headline}
        </span>
        <RelativeTime
          dateTime={highlight.highlightedAt}
          maxHoursAgo={72}
          className="mt-0.5 shrink-0 text-text-tertiary typo-caption2"
        />
      </span>
    </a>
  </Link>
);

const HighlightGridCardContent = ({
  highlights,
  onHighlightClick,
  onReadAllClick,
}: HighlightCardProps): ReactElement => {
  const firstHighlight = highlights[0];
  const { listRef, rowHeights, headlineLineClamps } = useHighlightGridRowHeights(
    highlights.length,
  );

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex shrink-0 items-start gap-2 px-4 pb-3 pt-4">
        <div className="min-w-0 flex-1">
          <h3
            className={classNames(
              highlightsTitleGradientClassName,
              'font-bold typo-title3',
            )}
          >
            Happening Now
          </h3>
        </div>
        <HighlightCardOptions className="shrink-0" />
      </header>

      <div
        ref={listRef}
        className="flex min-h-0 flex-1 flex-col overflow-hidden px-2.5 pb-1 pt-0"
      >
        {highlights.map((highlight, index) => (
          <HighlightGridRow
            key={highlight.id}
            highlight={highlight}
            index={index}
            onHighlightClick={onHighlightClick}
            rowHeight={rowHeights[index]}
            headlineLineClamp={headlineLineClamps[index]}
          />
        ))}
      </div>

      <ReadAllHighlightsFooter
        highlightId={firstHighlight?.id}
        onClick={onReadAllClick}
        className="shrink-0 px-1 pb-1"
      />
    </div>
  );
};

export const HighlightCardContent = ({
  highlights,
  onHighlightClick,
  onReadAllClick,
  variant,
}: HighlightCardProps & { variant: 'grid' | 'list' }): ReactElement => {
  if (variant === 'grid') {
    return (
      <HighlightGridCardContent
        highlights={highlights}
        onHighlightClick={onHighlightClick}
        onReadAllClick={onReadAllClick}
      />
    );
  }

  const firstHighlight = highlights[0];

  return (
    <>
      <header className="flex items-center pb-4">
        <h3
          className={classNames(
            highlightsTitleGradientClassName,
            'font-bold typo-title3',
          )}
        >
          Happening Now
        </h3>
        <HighlightCardOptions className="ml-auto" />
      </header>
      <div className="flex flex-col gap-2">
        {highlights.map((highlight, index) => (
          <HighlightRow
            key={highlight.id}
            highlight={highlight}
            index={index}
            onHighlightClick={onHighlightClick}
          />
        ))}
      </div>
      <ReadAllHighlightsFooter
        highlightId={firstHighlight?.id}
        onClick={onReadAllClick}
        className="pt-1.5"
      />
    </>
  );
};
