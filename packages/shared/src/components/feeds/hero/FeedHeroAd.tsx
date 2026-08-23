import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { Ad } from '../../../graphql/posts';
import type { ViewabilityData } from '../../../features/monetization/viewability';
import { useAdClickUrl } from '../../../features/monetization/useAdClickUrl';
import AdLink from '../../cards/ad/common/AdLink';
import AdAttribution from '../../cards/ad/common/AdAttribution';
import { AdImage } from '../../cards/ad/common/AdImage';
import { AdPixel } from '../../cards/ad/common/AdPixel';
import { AdViewability } from '../../cards/ad/common/AdViewability';
import { Image } from '../../image/Image';
import { Button } from '../../buttons/Button';
import { ButtonSize, ButtonVariant } from '../../buttons/common';
import { combinedClicks } from '../../../lib/click';
import classed from '../../../lib/classed';

const AdThumbnail = classed(Image, 'h-full object-cover');

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
  const clickUrl = useAdClickUrl(ad);

  return (
    <div
      data-testid="feedHeroAd"
      className={classNames(
        'relative flex shrink-0 items-center gap-3 overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-background-subtle p-3',
        className,
      )}
    >
      <AdLink ad={ad} onLinkClick={onLinkClick} />
      <AdImage
        ad={ad}
        ImageComponent={AdThumbnail}
        className="!my-0 size-12 shrink-0"
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <p className="truncate font-bold text-text-primary typo-callout">
          {ad.tagLine || ad.company}
        </p>
        <p className="line-clamp-2 text-text-tertiary typo-footnote">
          {ad.description}
        </p>
        <AdAttribution
          ad={ad}
          className={{ main: 'mt-0.5', typo: 'typo-caption1' }}
        />
      </div>
      {!!ad.callToAction && (
        <Button
          tag="a"
          href={clickUrl}
          target="_blank"
          rel="noopener"
          variant={ButtonVariant.Primary}
          size={ButtonSize.Small}
          className="z-1 shrink-0"
          {...combinedClicks(() => onLinkClick?.(ad))}
        >
          {ad.callToAction}
        </Button>
      )}
      <AdPixel pixel={ad.pixel} />
      {!!onViewable && (
        <AdViewability ad={ad} onViewable={(data) => onViewable(ad, data)} />
      )}
    </div>
  );
};
