import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { Ad, Post } from '../../../graphql/posts';
import type { PostHighlight } from '../../../graphql/highlights';
import type { ViewabilityData } from '../../../features/monetization/viewability';
import type { FeaturedWideCardProps } from '../../cards/common/featuredWide';
import { HighlightCardContent } from '../../cards/highlight/common';
import { Button } from '../../buttons/Button';
import { ButtonSize, ButtonVariant } from '../../buttons/common';
import Link from '../../utilities/Link';
import { FeedHeroAd } from './FeedHeroAd';
import { FeedHeroCarousel } from './FeedHeroCarousel';

interface FeedHeroSectionProps {
  posts: Post[];
  highlights: PostHighlight[];
  ad?: Ad;
  exploreHref?: string;
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
  exploreHref,
  cardProps,
  onAdLinkClick,
  onAdViewable,
  onHighlightClick,
  onReadAllClick,
  className,
}: FeedHeroSectionProps): ReactElement => (
  <section
    className={classNames(
      'flex flex-col gap-4 laptop:grid laptop:h-[30rem] laptop:grid-cols-3',
      className,
    )}
  >
    <FeedHeroCarousel
      posts={posts}
      className="laptop:col-span-2"
      {...cardProps}
    />
    <aside className="flex min-h-0 min-w-0 flex-col gap-3">
      {!!ad && (
        <FeedHeroAd
          ad={ad}
          onLinkClick={onAdLinkClick}
          onViewable={onAdViewable}
        />
      )}
      <div className="group flex min-h-0 flex-1 flex-col overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-surface-float">
        <HighlightCardContent
          highlights={highlights}
          onHighlightClick={onHighlightClick}
          onReadAllClick={onReadAllClick}
          variant="grid"
        />
      </div>
      {!!exploreHref && (
        <Link href={exploreHref} passHref>
          <Button
            tag="a"
            variant={ButtonVariant.Float}
            size={ButtonSize.Medium}
            className="w-full"
          >
            Explore all
          </Button>
        </Link>
      )}
    </aside>
  </section>
);
