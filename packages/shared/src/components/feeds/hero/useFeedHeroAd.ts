import type { Ad } from '../../../graphql/posts';
import { useAdQuery } from '../../../features/monetization/useAdQuery';
import { useAuthContext } from '../../../contexts/AuthContext';
import { usePlusSubscription } from '../../../hooks/usePlusSubscription';
import { useViewSize, ViewSize } from '../../../hooks';
import { AdPlacement } from '../../../lib/ads';
import { generateQueryKey, RequestKey, StaleTime } from '../../../lib/query';

export type FeedHeroAdSlot = {
  ad?: Ad;
  /** Whether the section has anywhere to put it. */
  isVisible: boolean;
};

/**
 * The placement sits out the laptop range: a fourth column doesn't fit under
 * 1360px, where it comes out around 220px — too narrow for a headline at the
 * featured card's size. Below `laptop` the section stacks and it returns at the
 * end. Shared with the section so the column and the ad behind it can't
 * disagree about when it exists.
 */
export const useHasFeedHeroAdColumn = (): boolean => {
  const isLaptop = useViewSize(ViewSize.Laptop);
  const isLaptopL = useViewSize(ViewSize.LaptopL);

  return !isLaptop || isLaptopL;
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
  const hasColumn = useHasFeedHeroAdColumn();

  const { data: ad } = useAdQuery({
    placement: AdPlacement.Feed,
    queryKey: generateQueryKey(RequestKey.Ads, user, 'feed-hero'),
    enabled: enabled && tokenRefreshed && !isPlus,
    staleTime: StaleTime.OneHour,
  });

  return { ad: ad ?? undefined, isVisible: !!ad && hasColumn };
};
