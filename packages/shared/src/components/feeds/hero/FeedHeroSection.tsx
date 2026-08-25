import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { Ad, Post } from '../../../graphql/posts';
import type { PostHighlight } from '../../../graphql/highlights';
import type { ViewabilityData } from '../../../features/monetization/viewability';
import type { FeaturedWideCardProps } from '../../cards/common/featuredWide';
import { HighlightCardContent } from '../../cards/highlight/common';
import { FeedHeroAd } from './FeedHeroAd';
import { FeedHeroAdCard } from './FeedHeroAdCard';
import { FeedHeroCarousel } from './FeedHeroCarousel';

interface FeedHeroSectionProps {
  posts: Post[];
  highlights: PostHighlight[];
  /** Sits as the second row of the headline list. */
  ad?: Ad;
  /** The full-size placement under the rail. */
  cardAd?: Ad;
  cardProps?: Omit<FeaturedWideCardProps, 'post'>;
  onAdLinkClick?: (ad: Ad) => unknown;
  onAdViewable?: (ad: Ad, data: ViewabilityData) => void;
  onCardAdLinkClick?: (ad: Ad) => unknown;
  onCardAdViewable?: (ad: Ad, data: ViewabilityData) => void;
  onHighlightClick?: (highlight: PostHighlight, position: number) => void;
  onReadAllClick?: () => void;
  className?: string;
}

export const FeedHeroSection = ({
  posts,
  highlights,
  ad,
  cardAd,
  cardProps,
  onAdLinkClick,
  onAdViewable,
  onCardAdLinkClick,
  onCardAdViewable,
  onHighlightClick,
  onReadAllClick,
  className,
}: FeedHeroSectionProps): ReactElement => (
  <section
    className={classNames(
      'mx-auto flex w-full max-w-[80rem] flex-col gap-6 laptop:grid laptop:grid-cols-3 laptop:items-start',
      className,
    )}
  >
    <FeedHeroCarousel
      posts={posts}
      className="laptop:col-span-2 laptop:h-[30rem]"
      {...cardProps}
    />
    {/* The rail runs past the carousel: the headlines stay level with it and
        the ad card hangs below, rather than the list giving up rows for it. */}
    <aside className="flex min-w-0 flex-col gap-4">
      <div className="group flex min-h-0 flex-col overflow-hidden laptop:h-[30rem]">
        <HighlightCardContent
          highlights={highlights}
          onHighlightClick={onHighlightClick}
          onReadAllClick={onReadAllClick}
          variant="grid"
          compact
          insertedItem={
            !!ad && (
              <FeedHeroAd
                ad={ad}
                onLinkClick={onAdLinkClick}
                onViewable={onAdViewable}
              />
            )
          }
        />
      </div>
      {!!cardAd && (
        <FeedHeroAdCard
          ad={cardAd}
          onLinkClick={onCardAdLinkClick}
          onViewable={onCardAdViewable}
        />
      )}
    </aside>
  </section>
);
