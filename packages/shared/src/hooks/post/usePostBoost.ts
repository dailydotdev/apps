import type { InfiniteData } from '@tanstack/react-query';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useRef } from 'react';
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

export const usePostBoost = (): UsePostBoost => {
  const { user } = useAuthContext();
  const statsRef = useRef<BoostedPostStats>({
    totalSpend: 0,
    clicks: 0,
    impressions: 0,
    engagements: 0,
  });
  const key = generateQueryKey(RequestKey.PostCampaigns, user, {
    first: FIRST_DEFAULT_VALUE,
  });
  const {
    data: campaigns,
    isPending,
    isFetched,
  } = useInfiniteQuery({
    queryKey: key,
    queryFn: async ({ pageParam }) => {
      const isFirstRequest = !pageParam;
      const response = await getBoostedPostCampaigns({
        first: FIRST_DEFAULT_VALUE,
        after: pageParam,
      });

      if (isFirstRequest) {
        statsRef.current = response.stats;
      }

      return response;
    },
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
    stats: statsRef.current,
    isLoading: isPending && !isFetched,
  };
};
