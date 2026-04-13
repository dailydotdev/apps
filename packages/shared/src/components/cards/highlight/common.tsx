import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { PostHighlight } from '../../../graphql/highlights';
import { webappUrl } from '../../../lib/constants';
import { RelativeTime } from '../../utilities/RelativeTime';
import Link from '../../utilities/Link';

export interface HighlightCardProps {
  highlights: PostHighlight[];
}

const titleGradientClassName = 'feed-highlights-title-gradient';

const HIGHLIGHTS_URL = `${webappUrl}highlights`;

const getHighlightUrl = (highlight: PostHighlight): string =>
  `${HIGHLIGHTS_URL}?highlight=${highlight.id}`;

const HighlightRow = ({
  highlight,
}: {
  highlight: PostHighlight;
}): ReactElement => {
  return (
    <Link href={getHighlightUrl(highlight)}>
      <a className="flex w-full flex-col gap-0 rounded-8 border-b border-border-subtlest-tertiary px-3 py-2 text-left transition-colors hover:bg-surface-hover focus-visible:bg-surface-hover">
        <span className="line-clamp-2 font-bold text-text-primary typo-callout">
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
  variant,
}: HighlightCardProps & { variant: 'grid' | 'list' }): ReactElement => {
  const headerClassName =
    variant === 'list'
      ? 'flex items-center pb-4'
      : 'flex items-center px-4 py-4';
  const contentClassName =
    variant === 'list'
      ? 'flex flex-col gap-2'
      : 'flex flex-1 flex-col gap-0 px-2.5 pb-1 pt-0';
  const footerClassName = variant === 'list' ? 'pt-1.5' : 'px-1 pb-1';

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
      </header>
      <div className={contentClassName}>
        {highlights.map((highlight) => (
          <HighlightRow key={highlight.id} highlight={highlight} />
        ))}
      </div>
      <div className={footerClassName}>
        <Link href={HIGHLIGHTS_URL}>
          <a className="bg-surface-float/70 flex h-8 w-full items-center rounded-10 px-3 backdrop-blur-xl">
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
