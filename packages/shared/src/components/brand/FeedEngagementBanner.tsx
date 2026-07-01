import type { ReactElement } from 'react';
import React from 'react';
import { useEngagementAdsContext } from '../../contexts/EngagementAdsContext';
import { useActiveFeedNameContext } from '../../contexts/ActiveFeedNameContext';
import { isEngagementAdFeed } from '../../hooks/feed/useFeedName';
import { EngagementPlacement } from '../../lib/engagementAds';
import { EngagementBanner } from './EngagementBanner';

type FeedEngagementBannerProps = {
  className?: string;
};

// Self-contained top-banner consumer for the app layout. Renders nothing
// unless we're on an engagement-ad feed AND a campaign opted into the
// top-banner placement, so the banner stays scoped to those campaigns and
// feeds. Placing it in the layout (rather than the feed) keeps it above the
// feed's floating-card box in both layout modes.
export const FeedEngagementBanner = ({
  className,
}: FeedEngagementBannerProps): ReactElement | null => {
  const { feedName } = useActiveFeedNameContext();
  const { getCreativeForPlacement } = useEngagementAdsContext();

  if (!isEngagementAdFeed(feedName)) {
    return null;
  }

  const creative = getCreativeForPlacement(EngagementPlacement.TopBanner);

  if (!creative) {
    return null;
  }

  return <EngagementBanner creative={creative} className={className} />;
};
