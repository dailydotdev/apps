import type { HTMLAttributes } from 'react';
import type { Ad } from '../../../../graphql/posts';
import type { ViewabilityData } from '../../../../features/monetization/viewability';

type Callback = (ad: Ad) => unknown;
export interface AdCardProps {
  ad: Ad;
  index: number;
  feedIndex: number;
  onLinkClick?: Callback;
  onViewable?: (ad: Ad, data: ViewabilityData) => void;
  domProps?: HTMLAttributes<HTMLDivElement>;
}
