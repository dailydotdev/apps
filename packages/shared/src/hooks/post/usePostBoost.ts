import type { InfiniteData } from '@tanstack/react-query';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useAuthContext } from '../../contexts/AuthContext';
import type {
  BoostedPostConnection,
  BoostedPostStats,
} from '../../graphql/post/boost';
import { getBoostedPostCampaigns } from '../../graphql/post/boost';
import {
  generateQueryKey,
  RequestKey,
  getNextPageParam,
  StaleTime,
} from '../../lib/query';

interface UsePostBoost {
  stats: BoostedPostStats;
  data?: InfiniteData<BoostedPostConnection>;
  isLoading: boolean;
}

const FIRST_DEFAULT_VALUE = 20;
const defaultStats = {
  totalSpend: 0,
  clicks: 0,
  impressions: 0,
  engagements: 0,
};

export const usePostBoost = (): UsePostBoost => {
  const { user } = useAuthContext();
  const key = generateQueryKey(RequestKey.PostCampaigns, user, {
    first: FIRST_DEFAULT_VALUE,
  });
  const {
    data: campaigns,
    isPending,
    isFetched,
  } = useInfiniteQuery({
    queryKey: key,
    queryFn: ({ pageParam }) =>
      getBoostedPostCampaigns({
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

  return {
    data: campaigns,
    stats: campaigns?.pages?.[0]?.stats ?? defaultStats,
    isLoading: isPending && !isFetched,
  };
};
