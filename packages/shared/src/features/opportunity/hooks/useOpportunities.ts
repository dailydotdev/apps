import { useInfiniteQuery } from '@tanstack/react-query';
import { useRequestProtocol } from '../../../hooks/useRequestProtocol';
import {
  generateQueryKey,
  getNextPageParam,
  RequestKey,
  StaleTime,
} from '../../../lib/query';
import { OPPORTUNITIES_QUERY } from '../graphql';
import type { Connection } from '../../../graphql/common';
import type { Opportunity } from '../types';
import type { OpportunityState } from '../protobuf/opportunity';

type UseOpportunitiesParams = {
  state?: OpportunityState;
  first?: number;
};

type OpportunitiesData = {
  opportunities: Connection<Opportunity>;
};

export const useOpportunities = ({
  state,
  first = 20,
}: UseOpportunitiesParams = {}) => {
  const { requestMethod } = useRequestProtocol();

  const query = useInfiniteQuery({
    queryKey: generateQueryKey(RequestKey.Opportunities, null, {
      state,
      first,
    }),
    queryFn: async ({ pageParam }) => {
      const result = await requestMethod<OpportunitiesData>(
        OPPORTUNITIES_QUERY,
        {
          state,
          first,
          after: pageParam,
        },
      );
      return result.opportunities;
    },
    initialPageParam: '',
    getNextPageParam: (lastPage) => getNextPageParam(lastPage?.pageInfo),
    staleTime: StaleTime.Default,
  });

  const allOpportunities =
    query.data?.pages.flatMap((page) => page.edges.map((edge) => edge.node)) ||
    [];

  return {
    ...query,
    allOpportunities,
  };
};
