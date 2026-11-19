import type { HTMLAttributes } from 'react';
import type { Ad } from '../../../../graphql/posts';
import type { AdRotationTarget } from '../../../../features/monetization/refresh/adRefresh';
import type { ViewabilityData } from '../../../../features/monetization/viewability';

type Callback = (ad: Ad) => unknown;
export interface AdCardProps {
  ad: Ad;
  index: number;
  feedIndex: number;
  onLinkClick?: Callback;
  onViewable?: (ad: Ad, data: ViewabilityData) => void;
  domProps?: HTMLAttributes<HTMLDivElement>;
  /** Outside the feed's own ad list, which rotation swaps creatives in. */
  disableRotation?: boolean;
  /**
   * For an ad outside the feed's own ad list that should still rotate like
   * the feed's ads: where the next creative goes.
   */
  rotationTarget?: AdRotationTarget;
}
