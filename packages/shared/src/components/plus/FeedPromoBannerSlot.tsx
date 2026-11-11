import type { ComponentProps, ReactElement } from 'react';
import React from 'react';
import { BriefBannerFeed } from '../cards/brief/BriefBanner/BriefBannerFeed';
import { PlusFeedBannerSlot } from './PlusFeedBanner';
import { useConditionalFeature } from '../../hooks/useConditionalFeature';
import { featurePlusFeedBanner } from '../../lib/featureManagement';

export const FeedPromoBannerSlot = ({
  style,
}: Pick<ComponentProps<'div'>, 'style'>): ReactElement | null => {
  const { value: showPlusBanner, isLoading } = useConditionalFeature({
    feature: featurePlusFeedBanner,
  });

  if (isLoading) {
    return null;
  }

  return showPlusBanner ? (
    <PlusFeedBannerSlot style={style} />
  ) : (
    <BriefBannerFeed style={style} />
  );
};
