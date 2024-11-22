import React, { forwardRef, ReactElement } from 'react';

import { Card, CardImage, CardTextContainer, CardTitle } from '../common/Card';
import AdLink from './common/AdLink';
import AdAttribution from './common/AdAttribution';
import { AdImage } from './common/AdImage';
import { AdPixel } from './common/AdPixel';
import type { AdCardProps } from './common/common';
import { RemoveAd } from './common/RemoveAd';
import { usePlusSubscription } from '../../../hooks/usePlusSubscription';
import {
  useAutoRotatingAds,
  type InViewRef,
} from '../../../hooks/feed/useAutoRotatingAds';
import { AdRefresh } from './common/AdRefresh';
import { ButtonSize } from '../../buttons/common';

export const AdGrid = forwardRef(function AdGrid(
  { ad, onLinkClick, onRefresh, domProps, index, feedIndex }: AdCardProps,
  inViewRef: InViewRef,
): ReactElement {
  const { isEnrolledNotPlus } = usePlusSubscription();
  const { ref, refetch } = useAutoRotatingAds(ad, index, feedIndex, inViewRef);

  return (
    <Card {...domProps} data-testid="adItem" ref={ref}>
      <AdLink ad={ad} onLinkClick={onLinkClick} />
      <CardTextContainer className="flex-1">
        <CardTitle className="line-clamp-4 typo-title3">
          {ad.description}
        </CardTitle>
        <AdAttribution ad={ad} className={{ main: 'mt-auto font-normal' }} />
      </CardTextContainer>
      <AdImage ad={ad} ImageComponent={CardImage} />
      <CardTextContainer>
        <div className="flex items-center">
          <AdRefresh
            size={ButtonSize.Small}
            onClick={() => {
              onRefresh?.(ad);
              refetch();
            }}
          />
          {isEnrolledNotPlus && <RemoveAd size={ButtonSize.Small} />}
        </div>
      </CardTextContainer>
      <AdPixel pixel={ad.pixel} />
    </Card>
  );
});
