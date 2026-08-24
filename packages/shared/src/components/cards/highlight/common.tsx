import type { ReactElement } from 'react';
import React from 'react';
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
  compact,
}: {
  highlight: PostHighlight;
  index: number;
  onHighlightClick?: (highlight: PostHighlight, position: number) => void;
  compact?: boolean;
}): ReactElement => {
  return (
    <Link href={getHighlightUrl(highlight)}>
      <a
        className={classNames(
          'flex w-full flex-col gap-0 rounded-8 border-b border-border-subtlest-tertiary px-3 text-left transition-colors hover:bg-surface-hover focus-visible:bg-surface-hover',
          compact ? 'py-1.5' : 'py-2',
        )}
        href={getHighlightUrl(highlight)}
        onClick={() => onHighlightClick?.(highlight, index + 1)}
      >
        <span
          className={classNames(
            'break-words font-bold text-text-primary',
            compact ? 'typo-footnote' : 'typo-callout',
          )}
        >
          {highlight.headline}
        </span>
        <RelativeTime
          dateTime={highlight.highlightedAt}
          maxHoursAgo={72}
          className={classNames(
            'mt-0.5 text-text-tertiary',
            compact ? 'typo-caption1' : 'typo-footnote',
          )}
        />
      </a>
    </Link>
  );
};

export const HighlightCardContent = ({
  highlights,
  onHighlightClick,
  onReadAllClick,
  variant,
  compact,
}: HighlightCardProps & {
  variant: 'grid' | 'list';
  /** Flush against its container, for a surface without card chrome. */
  compact?: boolean;
}): ReactElement => {
  const isFlushGrid = variant === 'grid' && compact;
  const headerClassName = classNames(
    'flex items-center',
    variant === 'list' && 'pb-4',
    variant === 'grid' && (isFlushGrid ? 'pb-2' : 'px-4 py-4'),
  );
  const contentClassName = classNames(
    variant === 'list' && 'flex flex-col gap-2',
    variant === 'grid' &&
      'no-scrollbar flex min-h-0 flex-1 flex-col gap-0 overflow-y-auto pt-0',
    variant === 'grid' && (isFlushGrid ? '-mx-3' : 'px-2.5 pb-1'),
    // The list scrolls, so let the last visible row fade out instead of being
    // sliced flat by the pinned footer.
    isFlushGrid &&
      '[mask-image:linear-gradient(to_bottom,black_calc(100%-1.25rem),transparent)]',
  );
  const footerClassName = classNames(
    variant === 'list' && 'pt-1.5',
    variant === 'grid' && (isFlushGrid ? 'pt-2' : 'px-1 pb-1'),
  );
  const firstHighlight = highlights[0];

  return (
    <>
      <header className={headerClassName}>
        <h3
          className={classNames(
            highlightsTitleGradientClassName,
            'font-bold',
            compact ? 'typo-callout' : 'typo-title3',
          )}
        >
          Happening Now
        </h3>
        <HighlightCardOptions className="ml-auto" />
      </header>
      <div className={contentClassName}>
        {highlights.map((highlight, index) => (
          <HighlightRow
            key={highlight.id}
            highlight={highlight}
            index={index}
            onHighlightClick={onHighlightClick}
            compact={compact}
          />
        ))}
      </div>
      <ReadAllHighlightsFooter
        highlightId={firstHighlight?.id}
        onClick={onReadAllClick}
        className={footerClassName}
      />
    </>
  );
};
