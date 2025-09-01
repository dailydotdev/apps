import type { InfiniteData } from '@tanstack/react-query';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useAuthContext } from '../../contexts/AuthContext';
import type {
  CampaignConnection,
  UserCampaignStats,
} from '../../graphql/campaigns';
import { getCampaigns, getUserCampaignStats } from '../../graphql/campaigns';
import {
  generateQueryKey,
  RequestKey,
  getNextPageParam,
  StaleTime,
} from '../../lib/query';
import type { InfiniteScrollingQueryProps } from '../../components/containers/InfiniteScrolling';
import { checkFetchMore } from '../../components/containers/InfiniteScrolling';

interface UsePostBoost {
  stats: UserCampaignStats;
  data?: InfiniteData<CampaignConnection>;
  isLoading: boolean;
  infiniteScrollingProps: InfiniteScrollingQueryProps;
}

const FIRST_DEFAULT_VALUE = 20;

export const defaultStats: UserCampaignStats = {
  spend: 0,
  users: 0,
  clicks: 0,
  impressions: 0,
  newMembers: 0,
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

  const { data: stats } = useQuery({
    queryKey: generateQueryKey(RequestKey.Campaigns, user, 'stats'),
    queryFn: getUserCampaignStats,
    staleTime: StaleTime.Default,
    enabled: !!user,
    placeholderData: defaultStats,
  });

  return {
    stats,
    data: campaigns,
    isLoading: isPending && !isFetched,
    infiniteScrollingProps: {
      isFetchingNextPage,
      fetchNextPage,
      canFetchMore: checkFetchMore(queryResult),
    },
  };
};
