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
    {/* Everything in the rail shares one text edge; the hover surfaces bleed
        past it and are clipped here, so they read as full-width bands. */}
    <aside className="flex min-h-0 min-w-0 flex-col gap-1 overflow-hidden">
      {!!ad && (
        <FeedHeroAd
          ad={ad}
          className="-mx-2"
          onLinkClick={onAdLinkClick}
          onViewable={onAdViewable}
        />
      )}
      <div className="group flex min-h-0 flex-1 flex-col overflow-hidden">
        <HighlightCardContent
          highlights={highlights}
          onHighlightClick={onHighlightClick}
          onReadAllClick={onReadAllClick}
          variant="grid"
          compact
        />
      </div>
    </aside>
  </section>
);
