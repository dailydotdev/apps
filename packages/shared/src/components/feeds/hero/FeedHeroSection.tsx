import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { Ad, Post } from '../../../graphql/posts';
import type { PostHighlight } from '../../../graphql/highlights';
import type { ViewabilityData } from '../../../features/monetization/viewability';
import type { FeaturedWideCardProps } from '../../cards/common/featuredWide';
import { HighlightCardContent } from '../../cards/highlight/common';
import { FeedHeroAdCard } from './FeedHeroAdCard';
import { FeedHeroCarousel } from './FeedHeroCarousel';

interface FeedHeroSectionProps {
  posts: Post[];
  highlights: PostHighlight[];
  /** The placement in its own column, beside the headlines. */
  ad?: Ad;
  cardProps?: Omit<FeaturedWideCardProps, 'post'>;
  onAdLinkClick?: (ad: Ad) => unknown;
  onAdViewable?: (ad: Ad, data: ViewabilityData) => void;
  onHighlightClick?: (highlight: PostHighlight, position: number) => void;
  onReadAllClick?: () => void;
  className?: string;
}

export const FeedHeroSection = ({
  posts,
  highlights,
  ad,
  cardProps,
  onAdLinkClick,
  onAdViewable,
  onHighlightClick,
  onReadAllClick,
  className,
}: FeedHeroSectionProps): ReactElement => {
  return (
    <section
      className={classNames(
        // No width of its own: the feed container caps this box at the card
        // grid's width, which tracks the reader's column count, so anything
        // fixed here would be too wide at three columns and too narrow at five.
        'flex w-full flex-col gap-6 laptop:grid laptop:h-[30rem]',
        ad ? 'laptop:grid-cols-4' : 'laptop:grid-cols-3',
        className,
      )}
    >
      <FeedHeroCarousel
        posts={posts}
        className="laptop:col-span-2"
        // The third column takes about 200px off the card, enough that the
        // 40/60 split stops leaving the headline a readable column.
        wideColSpan={ad ? 2 : undefined}
        {...cardProps}
      />
      <aside className="group flex min-h-0 min-w-0 flex-col overflow-hidden">
        <HighlightCardContent
          highlights={highlights}
          onHighlightClick={onHighlightClick}
          onReadAllClick={onReadAllClick}
          variant="grid"
          compact
        />
      </aside>
      {!!ad && (
        <aside className="flex min-h-0 min-w-0 flex-col overflow-hidden">
          <FeedHeroAdCard
            ad={ad}
            onLinkClick={onAdLinkClick}
            onViewable={onAdViewable}
          />
        </aside>
      )}
    </section>
  );
};
