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

const titleGradientClassName = 'feed-highlights-title-gradient';

const HIGHLIGHTS_URL = `${webappUrl}highlights`;

const getHighlightsUrl = (highlightId?: string): string =>
  highlightId ? `${HIGHLIGHTS_URL}?highlight=${highlightId}` : HIGHLIGHTS_URL;

const getHighlightUrl = (highlight: PostHighlight): string =>
  getHighlightsUrl(highlight.id);

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
          className="text-text-tertiary typo-footnote"
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
}: HighlightCardProps & { variant: 'grid' | 'list' }): ReactElement => {
  const headerClassName =
    variant === 'list'
      ? 'flex items-center pb-4'
      : 'flex items-center px-4 py-4';
  const contentClassName =
    variant === 'list'
      ? 'no-scrollbar flex min-h-0 flex-col gap-2 overflow-y-auto'
      : 'no-scrollbar flex min-h-0 flex-1 flex-col gap-0 overflow-y-auto px-2.5 pb-1 pt-0';
  const footerClassName = variant === 'list' ? 'pt-1.5' : 'px-1 pb-1';
  const firstHighlight = highlights[0];

  return (
    <>
      <header className={headerClassName}>
        <h3
          className={classNames(
            titleGradientClassName,
            'font-bold typo-title3',
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
          />
        ))}
      </div>
      <div className={footerClassName}>
        <Link href={getHighlightsUrl(firstHighlight?.id)}>
          <a
            aria-label="Read all highlights"
            className="bg-surface-float/70 flex h-8 w-full items-center rounded-10 px-3 backdrop-blur-xl"
            href={getHighlightsUrl(firstHighlight?.id)}
            onClick={() => onReadAllClick?.()}
          >
            <span className="typo-callout">
              <span className={titleGradientClassName}>Read all</span>
            </span>
            <span
              aria-hidden
              className={classNames(
                titleGradientClassName,
                'ml-auto select-none leading-none typo-title3',
              )}
            >
              →
            </span>
          </a>
        </Link>
      </div>
    </>
  );
};
