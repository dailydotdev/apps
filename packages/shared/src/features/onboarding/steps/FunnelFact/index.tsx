import React from 'react';
import type { FunnelStepFact } from '../../types/funnel';
import { FunnelFactCentered } from './FunnelFactCentered';
import { FunnelFactDefault } from './FunnelFactDefault';

export const FunnelFact = (props: FunnelStepFact) => {
  switch (props.parameters.layout) {
    case 'centered':
      return <FunnelFactCentered {...props} />;
    default:
      return <FunnelFactDefault {...props} />;
  }
};
