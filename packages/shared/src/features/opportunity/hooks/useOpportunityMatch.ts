import { useQuery } from '@tanstack/react-query';
import { StaleTime } from '../../../lib/query';
import { gqlClient } from '../../../graphql/common';
import { GET_OPPORTUNITY_MATCH_QUERY } from '../graphql';
import { getOpportunityByIdKey } from './useOpportunity';
import type { OpportunityMatch } from '../types';

export const opportunityMatchOptions = ({ id }: { id: string }) => {
  return {
    queryKey: [...getOpportunityByIdKey(id), 'match'],
    queryFn: async () => {
      const res = await gqlClient.request<{
        getOpportunityMatch: OpportunityMatch;
      }>(GET_OPPORTUNITY_MATCH_QUERY, {
        id,
      });

      return res.getOpportunityMatch;
    },
    staleTime: StaleTime.Default,
    enabled: !!id,
  };
};

export const useOpportunityMatch = (id: string) => {
  const { data: match } = useQuery(opportunityMatchOptions({ id }));

  return { match };
};
