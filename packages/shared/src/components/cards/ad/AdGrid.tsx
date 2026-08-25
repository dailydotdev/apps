import type { ReactElement } from 'react';
import React, { forwardRef } from 'react';

import { Card } from '../common/Card';
import { AdCardContent } from './common/AdCardContent';
import type { AdCardProps } from './common/common';
import type { InViewRef } from '../../../hooks/feed/useAutoRotatingAds';
import { useAutoRotatingAds } from '../../../hooks/feed/useAutoRotatingAds';

export const AdGrid = forwardRef<HTMLElement, AdCardProps>(function AdGrid(
  { ad, onLinkClick, onViewable, domProps, index, feedIndex },
  forwardedRef,
): ReactElement {
  const { ref } = useAutoRotatingAds(
    ad,
    index,
    feedIndex,
    forwardedRef as InViewRef,
  );

  return (
    <Card {...domProps} data-testid="adItem" ref={ref}>
      <AdCardContent
        ad={ad}
        onLinkClick={onLinkClick}
        onViewable={onViewable}
      />
    </Card>
  );
});
