import { useInfiniteQuery } from '@tanstack/react-query';
import { useRequestProtocol } from '../../../hooks/useRequestProtocol';
import {
  generateQueryKey,
  getNextPageParam,
  RequestKey,
  StaleTime,
} from '../../../lib/query';
import { OPPORTUNITY_MATCHES_QUERY } from '../graphql';
import type { OpportunityMatchesData } from '../types';

type UseOpportunityMatchesParams = {
  opportunityId: string | undefined;
  status?: string;
  first?: number;
};

export const useOpportunityMatches = ({
  opportunityId,
  status,
  first = 20,
}: UseOpportunityMatchesParams) => {
  const { requestMethod } = useRequestProtocol();

  const query = useInfiniteQuery({
    queryKey: generateQueryKey(RequestKey.OpportunityMatches, null, {
      opportunityId,
      status,
    }),
    queryFn: async ({ pageParam }) => {
      const result = await requestMethod<OpportunityMatchesData>(
        OPPORTUNITY_MATCHES_QUERY,
        {
          opportunityId,
          status,
          first,
          after: pageParam,
        },
      );
      return result.opportunityMatches;
    },
    initialPageParam: '',
    enabled: !!opportunityId,
    getNextPageParam: (lastPage) => getNextPageParam(lastPage?.pageInfo),
    staleTime: StaleTime.Default,
  });

  const allMatches =
    query.data?.pages.flatMap((page) => page.edges.map((edge) => edge.node)) ||
    [];

  return {
    ...query,
    allMatches,
  };
};
