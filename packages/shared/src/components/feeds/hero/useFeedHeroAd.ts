import type { Ad } from '../../../graphql/posts';
import { useAdQuery } from '../../../features/monetization/useAdQuery';
import { useAuthContext } from '../../../contexts/AuthContext';
import { usePlusSubscription } from '../../../hooks/usePlusSubscription';
import { useViewSize, ViewSize } from '../../../hooks';
import { AdPlacement } from '../../../lib/ads';
import { generateQueryKey, RequestKey, StaleTime } from '../../../lib/query';

export type FeedHeroAdSlot = {
  ad?: Ad;
  /**
   * The placement sits out the laptop range: three columns don't fit under
   * 1360px, and the ad would come out around 220px, narrow enough to push its
   * "Remove" control off the end. Below `laptop` the section stacks and it
   * returns at the end.
   */
  isVisible: boolean;
};

/**
 * The hero's ad. Read by the hero itself and by the feed underneath it, which
 * drops its own first placement while this one is showing rather than putting
 * two ads in front of the reader before the first post. Both callers share the
 * query key, so they see one creative from one request.
 */
export const useFeedHeroAd = (enabled: boolean): FeedHeroAdSlot => {
  const { user, tokenRefreshed } = useAuthContext();
  const { isPlus } = usePlusSubscription();
  const isLaptop = useViewSize(ViewSize.Laptop);
  const isLaptopL = useViewSize(ViewSize.LaptopL);

  const { data: ad } = useAdQuery({
    placement: AdPlacement.Feed,
    queryKey: generateQueryKey(RequestKey.Ads, user, 'feed-hero'),
    enabled: enabled && tokenRefreshed && !isPlus,
    staleTime: StaleTime.OneHour,
  });

  return { ad: ad ?? undefined, isVisible: !!ad && (!isLaptop || isLaptopL) };
};
