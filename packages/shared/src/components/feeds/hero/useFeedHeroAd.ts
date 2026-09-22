import { useContext } from 'react';
import type { Ad } from '../../../graphql/posts';
import { useAdQuery } from '../../../features/monetization/useAdQuery';
import { useAuthContext } from '../../../contexts/AuthContext';
import FeedContext from '../../../contexts/FeedContext';
import { useFeedLayout } from '../../../hooks/useFeedLayout';
import { usePlusSubscription } from '../../../hooks/usePlusSubscription';
import { AdPlacement } from '../../../lib/ads';
import { generateQueryKey, RequestKey, StaleTime } from '../../../lib/query';
import type { FeedHeroAdPlacement, FeedHeroShape } from './feedHeroShape';
import { feedHeroShape } from './feedHeroShape';

export type FeedHeroAdSlot = {
  ad?: Ad;
  placement: FeedHeroAdPlacement;
  /** The section's row, so the card and the layout around it share one number. */
  shape: FeedHeroShape;
};

/**
 * The hero's ad. Whether there is room comes from the grid's column count,
 * which is there on the first render — measuring the section instead missed a
 * load that painted straight at its final size and so never fired a resize.
 */
export const useFeedHeroAd = (): FeedHeroAdSlot => {
  const { user, tokenRefreshed } = useAuthContext();
  const { isPlus } = usePlusSubscription();
  const { numCards } = useContext(FeedContext);
  // The same call the feed makes, so the two agree on what a list is.
  const { shouldUseListFeedLayout } = useFeedLayout();
  // `.eco` regardless of the reader's spaciness: the count the grid renders
  // with — see `FeedContainer`.
  const shape = feedHeroShape(numCards.eco, shouldUseListFeedLayout);

  const { data: ad } = useAdQuery({
    placement: AdPlacement.Feed,
    queryKey: generateQueryKey(RequestKey.Ads, user, 'feed-hero'),
    enabled: tokenRefreshed && !isPlus && shape.adPlacement !== 'none',
    staleTime: StaleTime.OneHour,
  });

  return {
    ad: ad ?? undefined,
    placement: ad ? shape.adPlacement : 'none',
    shape,
  };
};
