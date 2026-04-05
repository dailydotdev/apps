import type { ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import type { PostHighlight } from '../../../graphql/highlights';
import { ArrowIcon } from '../../icons';
import { IconSize } from '../../Icon';
import { RelativeTime } from '../../utilities/RelativeTime';

export interface HighlightCardProps {
  highlights: PostHighlight[];
  onHighlightClick?: (highlight: PostHighlight, position: number) => void;
  onReadAllClick?: () => void;
}

const titleGradientClassName =
  'bg-gradient-to-r from-accent-blueCheese-default via-accent-cheese-default to-accent-avocado-default bg-clip-text text-transparent';

const HighlightRow = ({
  highlight,
  index,
  isRead,
  isViewed,
  onHighlightClick,
  onRead,
  onViewed,
}: {
  highlight: PostHighlight;
  index: number;
  isRead: boolean;
  isViewed: boolean;
  onHighlightClick?: (highlight: PostHighlight, position: number) => void;
  onRead: () => void;
  onViewed: () => void;
}): ReactElement => {
  const isInteracted = isRead || isViewed;

  return (
    <button
      type="button"
      className={classNames(
        'hover:bg-surface-hover/50 flex w-full flex-col gap-1 border-b border-border-subtlest-tertiary px-3 py-2 text-left transition-colors',
        isViewed && 'bg-surface-hover/30',
      )}
      onMouseEnter={onViewed}
      onFocus={onViewed}
      onClick={() => {
        onRead();
        onHighlightClick?.(highlight, index + 1);
      }}
    >
      <span
        className={classNames(
          'line-clamp-2 font-bold text-text-primary typo-callout',
          isInteracted && 'text-text-secondary',
        )}
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
  const [viewedHighlightIds, setViewedHighlightIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [readHighlightIds, setReadHighlightIds] = useState<Set<string>>(
    () => new Set(),
  );

  const headerClassName =
    variant === 'list'
      ? 'flex items-center pb-4'
      : 'flex items-center px-4 py-4';
  const contentClassName =
    variant === 'list'
      ? 'flex flex-col gap-2'
      : 'flex flex-1 flex-col px-2.5 pb-1';
  const footerClassName = variant === 'list' ? 'pt-1.5' : 'px-1 pb-1';

  const markHighlightViewed = (highlightId: string): void => {
    setViewedHighlightIds((currentIds) => {
      if (currentIds.has(highlightId)) {
        return currentIds;
      }

      const nextIds = new Set(currentIds);
      nextIds.add(highlightId);
      return nextIds;
    });
  };

  const markHighlightRead = (highlightId: string): void => {
    setReadHighlightIds((currentIds) => {
      if (currentIds.has(highlightId)) {
        return currentIds;
      }

      const nextIds = new Set(currentIds);
      nextIds.add(highlightId);
      return nextIds;
    });
  };

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
            isRead={readHighlightIds.has(highlight.id)}
            isViewed={viewedHighlightIds.has(highlight.id)}
            onViewed={() => markHighlightViewed(highlight.id)}
            onRead={() => markHighlightRead(highlight.id)}
            onHighlightClick={onHighlightClick}
          />
        ))}
      </div>
      <div className={footerClassName}>
        <button
          type="button"
          aria-label="Read all highlights"
          className="bg-background-default/60 flex h-8 w-full items-center rounded-10 px-3 transition-colors hover:bg-surface-hover"
          onClick={onReadAllClick}
        >
          <span className={classNames(titleGradientClassName, 'typo-callout')}>
            Read all
          </span>
          <ArrowIcon
            aria-hidden
            size={IconSize.Size16}
            className={classNames(titleGradientClassName, 'ml-auto rotate-90')}
          />
        </button>
      </div>
    </>
  );
};
