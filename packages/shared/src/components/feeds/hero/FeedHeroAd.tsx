import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { Ad } from '../../../graphql/posts';
import type { ViewabilityData } from '../../../features/monetization/viewability';
import AdLink from '../../cards/ad/common/AdLink';
import AdAttribution from '../../cards/ad/common/AdAttribution';
import { AdFavicon } from '../../cards/ad/common/AdFavicon';
import { AdImage } from '../../cards/ad/common/AdImage';
import { AdPixel } from '../../cards/ad/common/AdPixel';
import { AdViewability } from '../../cards/ad/common/AdViewability';
import PostTags from '../../cards/common/PostTags';
import { Image } from '../../image/Image';
import classed from '../../../lib/classed';

const AdCover = classed(Image, 'h-full object-cover');

interface FeedHeroAdProps {
  ad: Ad;
  onLinkClick?: (ad: Ad) => unknown;
  onViewable?: (ad: Ad, data: ViewabilityData) => void;
  className?: string;
}

export const FeedHeroAd = ({
  ad,
  onLinkClick,
  onViewable,
  className,
}: FeedHeroAdProps): ReactElement => {
  const matchingTags = ad.matchingTags ?? [];

  return (
    <div
      data-testid="feedHeroAd"
      className={classNames(
        'relative flex shrink-0 items-start gap-3 rounded-8 border-b border-border-subtlest-tertiary px-3 py-2 transition-colors hover:bg-surface-hover',
        className,
      )}
    >
      <AdLink ad={ad} onLinkClick={onLinkClick} />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex min-w-0 items-center gap-1.5">
          <AdFavicon ad={ad} className="!m-0 !h-5 shrink-0" />
          <AdAttribution
            ad={ad}
            className={{ main: 'min-w-0 truncate', typo: 'typo-caption1' }}
          />
        </div>
        <p className="line-clamp-2 break-words font-bold text-text-primary typo-footnote">
          {ad.description}
        </p>
        {matchingTags.length > 0 && (
          <PostTags post={{ tags: matchingTags }} className="[&>*]:!my-0" />
        )}
      </div>
      {!!ad.image && (
        <AdImage
          ad={ad}
          ImageComponent={AdCover}
          className="!my-0 aspect-video w-28 shrink-0 rounded-8"
        />
      )}
      {/* Out of flow so the row's `gap-3` doesn't reserve a column for it. */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <AdPixel pixel={ad.pixel} />
      </div>
      {!!onViewable && (
        <AdViewability ad={ad} onViewable={(data) => onViewable(ad, data)} />
      )}
    </div>
  );
};
