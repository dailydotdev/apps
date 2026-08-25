import type { ReactElement } from 'react';
import React from 'react';
import type { Ad } from '../../../graphql/posts';
import type { ViewabilityData } from '../../../features/monetization/viewability';
import { FlatCard } from '../../cards/common/Card';
import { AdCardContent } from '../../cards/ad/common/AdCardContent';

interface FeedHeroAdCardProps {
  ad: Ad;
  onLinkClick?: (ad: Ad) => unknown;
  onViewable?: (ad: Ad, data: ViewabilityData) => void;
  className?: string;
}

/**
 * The feed's ad card, flattened for the hero rail: same creative and layout,
 * without the card's own background and border so it sits on the page.
 */
export const FeedHeroAdCard = ({
  ad,
  onLinkClick,
  onViewable,
  className,
}: FeedHeroAdCardProps): ReactElement => (
  <FlatCard data-testid="feedHeroAdCard" className={className}>
    <AdCardContent
      flush
      ad={ad}
      onLinkClick={onLinkClick}
      onViewable={onViewable}
    />
  </FlatCard>
);
