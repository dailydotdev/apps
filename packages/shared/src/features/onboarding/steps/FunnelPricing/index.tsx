import React from 'react';
import type { FunnelStepPricing } from '../../types/funnel';
import { FunnelPricingV1 } from './FunnelPricingV1';
import { FunnelPricingV2 } from './FunnelPricingV2';
import { isFunnelPricingV2 } from './common';

export const FunnelPricing = (props: FunnelStepPricing) => {
  const { parameters } = props;
  if (isFunnelPricingV2(parameters)) {
    return <FunnelPricingV2 {...{ ...props, parameters }} />;
  }

  return <FunnelPricingV1 {...{ ...props, parameters }} />;
};
