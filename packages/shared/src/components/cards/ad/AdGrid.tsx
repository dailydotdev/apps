import type { ReactElement } from 'react';
import React, { forwardRef } from 'react';

import {
  Card,
  CardImage,
  CardSpace,
  CardTextContainer,
  CardTitle,
} from '../common/Card';
import AdLink from './common/AdLink';
import { combinedClicks } from '../../../lib/click';
import AdAttribution from './common/AdAttribution';
import { AdImage } from './common/AdImage';
import { AdPixel } from './common/AdPixel';
import type { AdCardProps } from './common/common';
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

export const AdGrid = forwardRef<HTMLElement, AdCardProps>(function AdGrid(
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
    <Card {...domProps} data-testid="adItem" ref={ref}>
      <AdLink ad={ad} onLinkClick={onLinkClick} />
      <AdFavicon ad={ad} className="mx-4" />
      <CardTextContainer className="flex-1">
        <CardTitle className="typo-title3">{ad.description}</CardTitle>
        <CardSpace />
        {adImprovementsV3 && matchingTags.length > 0 ? (
          <PostTags
            post={{ tags: matchingTags.slice(0, 6) }}
            className="!items-end"
          />
        ) : null}
        <AdAttribution ad={ad} className={{ main: 'font-normal' }} />
      </CardTextContainer>
      <AdImage className="mx-1 mb-0" ad={ad} ImageComponent={CardImage} />
      <CardTextContainer className="!mx-1 my-1">
        <div className="flex items-center">
          {!!ad.callToAction && (
            <Button
              tag="a"
              href={ad.link}
              target="_blank"
              rel="noopener"
              variant={ButtonVariant.Primary}
              size={ButtonSize.Small}
              className="z-1"
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
          <div className="ml-auto flex items-center gap-2">
            {!isPlus && (
              <RemoveAd
                variant={ButtonVariant.Tertiary}
                size={ButtonSize.Small}
                className="!font-normal"
              />
            )}
          </div>
        </div>
      </CardTextContainer>
      <AdPixel pixel={ad.pixel} />
    </Card>
  );
});
