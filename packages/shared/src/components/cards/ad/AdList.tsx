import type { AnchorHTMLAttributes, ReactElement } from 'react';
import React, { forwardRef } from 'react';
import {
  CardContent,
  CardImage,
  CardTextContainer,
  CardTitle,
} from '../common/list/ListCard';
import FeedItemContainer from '../common/list/FeedItemContainer';
import type { AdCardProps } from './common/common';
import { AdImage } from './common/AdImage';
import { AdPixel } from './common/AdPixel';
import type { Ad } from '../../../graphql/posts';
import { combinedClicks } from '../../../lib/click';

import { RemoveAd } from './common/RemoveAd';
import { usePlusSubscription } from '../../../hooks/usePlusSubscription';
import type { InViewRef } from '../../../hooks/feed/useAutoRotatingAds';
import { useAutoRotatingAds } from '../../../hooks/feed/useAutoRotatingAds';
import { Button } from '../../buttons/Button';
import { ButtonSize, ButtonVariant } from '../../buttons/common';
import AdAttribution from './common/AdAttribution';
import { AdFavicon } from './common/AdFavicon';
import PostTags from '../common/PostTags';
import { useFeature } from '../../GrowthBookProvider';
import { adImprovementsV3Feature } from '../../../lib/featureManagement';
import { TargetId } from '../../../lib/log';
import { AdvertiseLink } from './common/AdvertiseLink';

const getLinkProps = ({
  ad,
  onLinkClick,
}: {
  ad: Ad;
  onLinkClick: (ad: Ad) => unknown;
}): AnchorHTMLAttributes<HTMLAnchorElement> => {
  return {
    href: ad.link,
    target: '_blank',
    rel: 'noopener',
    title: ad.description,
    ...combinedClicks(() => onLinkClick?.(ad)),
  };
};

export const AdList = forwardRef<HTMLElement, AdCardProps>(function AdCard(
  { ad, onLinkClick, domProps, index, feedIndex },
  forwardedRef,
): ReactElement {
  const { isPlus } = usePlusSubscription();
  const adImprovementsV3 = useFeature(adImprovementsV3Feature);
  const { ref } = useAutoRotatingAds(
    ad,
    index,
    feedIndex,
    forwardedRef as InViewRef,
  );
  const matchingTags = ad?.matchingTags ?? [];

  return (
    <FeedItemContainer
      domProps={domProps ?? {}}
      ref={ref}
      data-testid="adItem"
      linkProps={getLinkProps({
        ad,
        onLinkClick: onLinkClick ?? (() => undefined),
      })}
    >
      <CardContent>
        <CardTextContainer className="mr-4 flex-1">
          <CardTitle className="!mt-0 typo-title3">
            <AdFavicon ad={ad} className="mx-0 !mt-0 mb-2" />
            {ad.description}
          </CardTitle>
          {adImprovementsV3 && matchingTags.length > 0 ? (
            <PostTags post={{ tags: matchingTags.slice(0, 6) }} />
          ) : null}
          <AdAttribution
            ad={ad}
            className={{ main: 'mt-2 block font-normal' }}
          />
        </CardTextContainer>
        <AdImage ad={ad} ImageComponent={CardImage} />
      </CardContent>

      <div className="z-1 flex items-center pt-2">
        {!!ad.callToAction && (
          <Button
            tag="a"
            href={ad.link}
            target="_blank"
            rel="noopener"
            variant={ButtonVariant.Primary}
            size={ButtonSize.Small}
            {...combinedClicks(() => onLinkClick?.(ad))}
          >
            {ad.callToAction}
          </Button>
        )}
        <AdvertiseLink
          targetId={TargetId.AdCard}
          buttonStyle
          size={ButtonSize.Small}
        />
        <div className="ml-auto">
          {!isPlus && (
            <RemoveAd size={ButtonSize.Small} className="!font-normal" />
          )}
        </div>
      </div>
      <AdPixel pixel={ad.pixel} />
    </FeedItemContainer>
  );
});
