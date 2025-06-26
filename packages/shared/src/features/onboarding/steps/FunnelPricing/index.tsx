import React from 'react';
import type { FunnelStepPricing } from '../../types/funnel';
import { FunnelPricingV1 } from './FunnelPricingV1';
import { FunnelPricingV2, isV2 } from './FunnelPricingV2';

export const FunnelPricing = (props: FunnelStepPricing) => {
  const { parameters } = props;
  if (isV2(parameters)) {
    return <FunnelPricingV2 {...props} />;
  }

  return <FunnelPricingV1 {...props} />;
};
