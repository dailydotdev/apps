import type { InfiniteData } from '@tanstack/react-query';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useAuthContext } from '../../contexts/AuthContext';
import type {
  CampaignConnection,
  CampaignStats,
} from '../../graphql/campaigns';
import { getCampaigns } from '../../graphql/campaigns';
import {
  generateQueryKey,
  RequestKey,
  getNextPageParam,
  StaleTime,
} from '../../lib/query';
import type { InfiniteScrollingQueryProps } from '../../components/containers/InfiniteScrolling';
import { checkFetchMore } from '../../components/containers/InfiniteScrolling';

interface UsePostBoost {
  stats: CampaignStats;
  data?: InfiniteData<CampaignConnection>;
  isLoading: boolean;
  infiniteScrollingProps: InfiniteScrollingQueryProps;
}

const FIRST_DEFAULT_VALUE = 20;

const defaultStats: CampaignStats = {
  spend: 0,
  users: 0,
  budget: 0,
  clicks: 0,
  impressions: 0,
};

export const useCampaigns = (): UsePostBoost => {
  const { user } = useAuthContext();
  const key = generateQueryKey(RequestKey.Campaigns, user, {
    first: FIRST_DEFAULT_VALUE,
  });
  const queryResult = useInfiniteQuery({
    queryKey: key,
    queryFn: ({ pageParam }) =>
      getCampaigns({
        first: FIRST_DEFAULT_VALUE,
        after: pageParam,
      }),
    initialPageParam: '',
    getNextPageParam: (data, _, lastPageParam) => {
      const nextPageparam = getNextPageParam(data?.pageInfo);

      if (lastPageParam === nextPageparam) {
        return null;
      }

      return getNextPageParam(data?.pageInfo);
    },
    enabled: !!user,
    staleTime: StaleTime.Default,
  });

  const {
    data: campaigns,
    isPending,
    isFetched,
    isFetchingNextPage,
    fetchNextPage,
  } = queryResult;

  return {
    data: campaigns,
    stats: defaultStats, // TODO: introduce new query for stats
    isLoading: isPending && !isFetched,
    infiniteScrollingProps: {
      isFetchingNextPage,
      fetchNextPage,
      canFetchMore: checkFetchMore(queryResult),
    },
  };
};
