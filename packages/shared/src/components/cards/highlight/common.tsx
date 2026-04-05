import type { KeyboardEvent, MouseEvent, ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { PostHighlight } from '../../../graphql/highlights';
import { RelativeTime } from '../../utilities/RelativeTime';

export interface HighlightCardProps {
  highlights: PostHighlight[];
  onHighlightClick?: (highlight: PostHighlight, position: number) => void;
  onReadAllClick?: () => void;
}

const titleGradientClassName =
  'feed-highlights-title-gradient';

export const getHighlightCardContainerHandlers = (
  onReadAllClick?: () => void,
): {
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  onKeyDown?: (event: KeyboardEvent<HTMLElement>) => void;
} => {
  if (!onReadAllClick) {
    return {};
  }

  return {
    onClick: () => onReadAllClick(),
    onKeyDown: (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') {
        return;
      }

      event.preventDefault();
      onReadAllClick();
    },
  };
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
    <button
      type="button"
      className="flex w-full flex-col gap-0 rounded-8 border-b border-border-subtlest-tertiary px-3 py-2 text-left transition-colors hover:bg-surface-hover focus-visible:bg-surface-hover"
      onClick={(event) => {
        event.stopPropagation();
        onHighlightClick?.(highlight, index + 1);
      }}
    >
      <span
        className="line-clamp-2 font-bold text-text-primary typo-callout"
      >
        {highlight.headline}
      </span>
      <RelativeTime
        dateTime={highlight.highlightedAt}
        className="text-text-tertiary typo-footnote"
      />
    </button>
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
        <button
          type="button"
          aria-label="Read all highlights"
          className="bg-surface-float/70 flex h-8 w-full items-center rounded-10 px-3 backdrop-blur-xl"
          onClick={(event) => {
            event.stopPropagation();
            onReadAllClick?.();
          }}
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
        </button>
      </div>
    </>
  );
};
