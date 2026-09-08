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
  /**
   * The section's row. The carousel needs it too — it picks the featured card
   * from the same number of columns the card is given, so the two cannot end
   * up disagreeing about how much room there is.
   */
  shape: FeedHeroShape;
};

/**
 * The hero's ad. The feed underneath drops its own first placement whenever the
 * hero has somewhere to put one, so the reader never meets two before the first
 * post — and gets it back the moment the hero does not.
 *
 * Whether there is somewhere comes from the grid's column count, which is there
 * on the first render, rather than from measuring the section: a load that
 * paints straight at its final size never fires a resize to measure on.
 */
export const useFeedHeroAd = (enabled: boolean): FeedHeroAdSlot => {
  const { user, tokenRefreshed } = useAuthContext();
  const { isPlus } = usePlusSubscription();
  const { numCards } = useContext(FeedContext);
  // The same call the feed makes, so the two agree on what a list is: below
  // laptop, and on laptop up whenever the reader has list mode on.
  const { shouldUseListFeedLayout } = useFeedLayout();
  // `.eco` regardless of the reader's spaciness, because that is the count the
  // grid itself renders with — see `FeedContainer`.
  const shape = feedHeroShape(numCards.eco, shouldUseListFeedLayout);

  const { data: ad } = useAdQuery({
    placement: AdPlacement.Feed,
    queryKey: generateQueryKey(RequestKey.Ads, user, 'feed-hero'),
    enabled:
      enabled && tokenRefreshed && !isPlus && shape.adPlacement !== 'none',
    staleTime: StaleTime.OneHour,
  });

  return {
    ad: ad ?? undefined,
    placement: ad ? shape.adPlacement : 'none',
    shape,
  };
};
