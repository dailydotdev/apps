import type { AnchorHTMLAttributes, ReactElement } from 'react';
import React, { forwardRef } from 'react';
import {
  CardContainer,
  CardContent,
  CardHeader,
  CardTitle,
} from '../common/list/ListCard';
import { Image } from '../../image/Image';
import classed from '../../../lib/classed';
import FeedItemContainer from '../common/list/FeedItemContainer';
import type { AdCardProps } from './common/common';
import { AdImage } from './common/AdImage';
import { AdPixel } from './common/AdPixel';
import { AdMeasurement } from './common/AdMeasurement';
import { AdViewability } from './common/AdViewability';
import { useAdClickUrl } from '../../../features/monetization/useAdClickUrl';
import type { Ad } from '../../../graphql/posts';
import { combinedClicks } from '../../../lib/click';

import { RemoveAd } from './common/RemoveAd';
import { usePlusSubscription } from '../../../hooks/usePlusSubscription';
import type { InViewRef } from '../../../hooks/feed/useAutoRotatingAds';
import { useAutoRotatingAds } from '../../../hooks/feed/useAutoRotatingAds';
import { Button } from '../../buttons/Button';
import { ButtonSize, ButtonVariant } from '../../buttons/common';
import { AdFavicon } from './common/AdFavicon';
import PostTags from '../common/PostTags';
import { useFeature } from '../../GrowthBookProvider';
import { adImprovementsV3Feature } from '../../../lib/featureManagement';
import { TargetId } from '../../../lib/log';
import { AdvertiseLink } from './common/AdvertiseLink';
import { useAdLabel } from '../../../features/monetization/useAdLabel';
import AdAttribution from './common/AdAttribution';
import { ProfileImageSize } from '../../ProfilePicture';
import { useViewSize, ViewSize } from '../../../hooks';
import { anchorSponsoredRel } from '../../../lib/strings';

// The post cover's box (`CardCoverList`).
const AdCardImage = classed(
  Image,
  'rounded-12 h-40 object-cover w-full mobileXL:w-60',
);

const getLinkProps = ({
  ad,
  href,
  onLinkClick,
}: {
  ad: Ad;
  href: string;
  onLinkClick: (ad: Ad) => unknown;
}): AnchorHTMLAttributes<HTMLAnchorElement> => {
  return {
    href,
    target: '_blank',
    rel: anchorSponsoredRel,
    title: ad.description,
    ...combinedClicks(() => onLinkClick?.(ad)),
  };
};

export const AdList = forwardRef<HTMLElement, AdCardProps>(function AdCard(
  { ad, onLinkClick, onViewable, domProps, index, feedIndex },
  forwardedRef,
): ReactElement {
  const { isPlus } = usePlusSubscription();
  const adImprovementsV3 = useFeature(adImprovementsV3Feature);
  const { showAdvertiseLink } = useAdLabel();
  const { ref } = useAutoRotatingAds(
    ad,
    index,
    feedIndex,
    forwardedRef as InViewRef,
  );
  const matchingTags = ad?.matchingTags ?? [];
  const clickUrl = useAdClickUrl(ad);
  const isStacked = useViewSize(ViewSize.MobileL);

  const footer = (
    <div className="relative z-1 mt-4 flex items-center tablet:mt-0">
      {!!ad.callToAction && (
        <Button
          tag="a"
          href={clickUrl}
          target="_blank"
          rel={anchorSponsoredRel}
          variant={ButtonVariant.Primary}
          size={ButtonSize.Small}
          {...combinedClicks(() => onLinkClick?.(ad))}
        >
          {ad.callToAction}
        </Button>
      )}
      {showAdvertiseLink && (
        <AdvertiseLink
          targetId={TargetId.AdCard}
          buttonStyle
          size={ButtonSize.Small}
        />
      )}
      <div className="ml-auto">
        {!isPlus && (
          <RemoveAd
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Small}
            className="!font-normal typo-footnote"
          />
        )}
      </div>
    </div>
  );

  return (
    <FeedItemContainer
      domProps={domProps ?? {}}
      ref={ref}
      data-testid="adItem"
      linkProps={getLinkProps({
        ad,
        href: clickUrl,
        onLinkClick: onLinkClick ?? (() => undefined),
      })}
    >
      <CardContainer>
        <CardHeader>
          <AdFavicon
            ad={ad}
            size={ProfileImageSize.Large}
            className="!m-0 !h-auto shrink-0"
          />
          <AdAttribution
            ad={ad}
            className={{ main: 'relative ml-4 mr-2 min-w-0 truncate' }}
          />
        </CardHeader>
        <CardContent>
          <div className="mr-4 flex flex-1 flex-col">
            <CardTitle>{ad.description}</CardTitle>
            {adImprovementsV3 && matchingTags.length > 0 ? (
              <div className="flex items-center">
                <PostTags post={{ tags: matchingTags.slice(0, 6) }} />
              </div>
            ) : null}
            <div className="hidden flex-1 tablet:flex" />
            {!isStacked && footer}
          </div>
          <AdImage
            ad={ad}
            ImageComponent={AdCardImage}
            className="mb-0 mt-4 mobileXL:self-start"
          />
        </CardContent>
      </CardContainer>
      {isStacked && footer}
      <AdPixel pixel={ad.pixel} />
      <AdMeasurement ad={ad} />
      <AdViewability ad={ad} onViewable={(data) => onViewable?.(ad, data)} />
    </FeedItemContainer>
  );
});
