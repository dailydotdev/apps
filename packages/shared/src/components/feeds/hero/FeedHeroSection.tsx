import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { Ad, Post } from '../../../graphql/posts';
import type { PostHighlight } from '../../../graphql/highlights';
import type { ViewabilityData } from '../../../features/monetization/viewability';
import type { FeaturedWideCardProps } from '../../cards/common/featuredWide';
import { useViewSize, ViewSize } from '../../../hooks';
import { HighlightCardContent } from '../../cards/highlight/common';
import { FeedHeroAd } from './FeedHeroAd';
import { FeedHeroAdCard } from './FeedHeroAdCard';
import { FeedHeroCarousel } from './FeedHeroCarousel';

interface FeedHeroSectionProps {
  posts: Post[];
  highlights: PostHighlight[];
  /** Sits as the second row of the headline list. */
  ad?: Ad;
  /** The full-size placement in its own column, beside the headlines. */
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
}: FeedHeroSectionProps): ReactElement => {
  // Three columns only fit from 1360px. On a 1024px laptop they leave the ad
  // about 220px, which drops its "Remove" control off the end, so that width
  // keeps the two-column rail and sits the placement out.
  const isLaptopL = useViewSize(ViewSize.LaptopL);
  const hasAdColumn = !!cardAd && isLaptopL;

  return (
    <section
      className={classNames(
        'mx-auto flex w-full max-w-[80rem] flex-col gap-6 laptop:grid laptop:h-[30rem]',
        cardAd
          ? 'laptop:grid-cols-3 laptopL:grid-cols-4'
          : 'laptop:grid-cols-3',
        className,
      )}
    >
      <FeedHeroCarousel
        posts={posts}
        className="laptop:col-span-2"
        // The third column takes about 200px off the card, enough that the
        // 40/60 split stops leaving the headline a readable column.
        wideColSpan={hasAdColumn ? 2 : undefined}
        {...cardProps}
      />
      <aside className="group flex min-h-0 min-w-0 flex-col overflow-hidden">
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
      </aside>
      {!!cardAd && (
        <aside className="flex min-h-0 min-w-0 flex-col overflow-hidden laptop:hidden laptopL:flex">
          <FeedHeroAdCard
            ad={cardAd}
            onLinkClick={onCardAdLinkClick}
            onViewable={onCardAdViewable}
          />
        </aside>
      )}
    </section>
  );
};
