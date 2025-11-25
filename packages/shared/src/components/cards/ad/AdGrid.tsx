import type { ReactElement } from 'react';
import React, { forwardRef, useCallback } from 'react';

import { Card, CardImage, CardTextContainer, CardTitle } from '../common/Card';
import AdLink from './common/AdLink';
import AdAttribution from './common/AdAttribution';
import { AdImage } from './common/AdImage';
import { AdPixel } from './common/AdPixel';
import type { AdCardProps } from './common/common';
import { RemoveAd } from './common/RemoveAd';
import { usePlusSubscription } from '../../../hooks/usePlusSubscription';
import type { InViewRef } from '../../../hooks/feed/useAutoRotatingAds';
import { useAutoRotatingAds } from '../../../hooks/feed/useAutoRotatingAds';
import { AdRefresh } from './common/AdRefresh';
import { ButtonSize, ButtonVariant } from '../../buttons/common';
import { AdFavicon } from './common/AdFavicon';
import PostTags from '../common/PostTags';
import { useFeature } from '../../GrowthBookProvider';
import { adImprovementsV3Feature } from '../../../lib/featureManagement';

export const AdGrid = forwardRef(function AdGrid(
  { ad, onLinkClick, onRefresh, domProps, index, feedIndex }: AdCardProps,
  inViewRef: InViewRef,
): ReactElement {
  const { isPlus } = usePlusSubscription();
  const adImprovementsV3 = useFeature(adImprovementsV3Feature);
  const { ref, refetch, isRefetching } = useAutoRotatingAds(
    ad,
    index,
    feedIndex,
    inViewRef,
  );

  const onRefreshClick = useCallback(async () => {
    onRefresh?.(ad);
    await refetch();
  }, [ad, onRefresh, refetch]);

  return (
    <Card {...domProps} data-testid="adItem" ref={ref}>
      <AdLink ad={ad} onLinkClick={onLinkClick} />
      <AdFavicon ad={ad} className="mx-4" />
      <CardTextContainer className="flex-1">
        <CardTitle className="line-clamp-4 typo-title3">
          {ad.description}
        </CardTitle>
        {adImprovementsV3 && ad?.matchingTags?.length > 0 ? (
          <PostTags
            post={{ tags: ad.matchingTags.slice(0, 6) }}
            className="!items-end"
          />
        ) : null}
        <AdAttribution ad={ad} className={{ main: 'mt-auto font-normal' }} />
      </CardTextContainer>
      <AdImage className="mx-1 mb-0" ad={ad} ImageComponent={CardImage} />
      <CardTextContainer className="!mx-1 my-1">
        <div className="flex items-center">
          <AdRefresh
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Small}
            onClick={onRefreshClick}
            loading={isRefetching}
          />
          {!isPlus && (
            <RemoveAd
              variant={ButtonVariant.Tertiary}
              size={ButtonSize.Small}
            />
          )}
        </div>
      </CardTextContainer>
      <AdPixel pixel={ad.pixel} />
    </Card>
  );
});
