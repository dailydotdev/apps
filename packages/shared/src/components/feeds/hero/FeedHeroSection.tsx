import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { Ad, Post } from '../../../graphql/posts';
import type { PostHighlight } from '../../../graphql/highlights';
import type { ViewabilityData } from '../../../features/monetization/viewability';
import type { FeaturedWideCardProps } from '../../cards/common/featuredWide';
import { HighlightCardContent } from '../../cards/highlight/common';
import { FeedHeroAd } from './FeedHeroAd';
import { FeedHeroCarousel } from './FeedHeroCarousel';

interface FeedHeroSectionProps {
  posts: Post[];
  highlights: PostHighlight[];
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
}: FeedHeroSectionProps): ReactElement => (
  <section
    className={classNames(
      'mx-auto flex w-full max-w-[80rem] flex-col gap-6 laptop:grid laptop:h-[30rem] laptop:grid-cols-3',
      className,
    )}
  >
    <FeedHeroCarousel
      posts={posts}
      className="laptop:col-span-2"
      {...cardProps}
    />
    <aside className="group flex min-h-0 min-w-0 flex-col overflow-hidden">
      <HighlightCardContent
        highlights={highlights}
        onHighlightClick={onHighlightClick}
        onReadAllClick={onReadAllClick}
        variant="grid"
        compact
        leadingItem={
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
  </section>
);
