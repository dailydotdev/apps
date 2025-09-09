import { useQuery } from '@tanstack/react-query';
import type { QueryKey } from '@tanstack/react-query';
import { RequestKey, StaleTime } from '../../../lib/query';
import { gqlClient } from '../../../graphql/common';
import { OPPORTUNITY_BY_ID_QUERY } from '../graphql';
import type { Opportunity } from '../types';

export const getOpportunityByIdKey = (id: string): QueryKey => [
  RequestKey.Opportunity,
  id,
];

export const opportunityByIdOptions = ({ id }: { id: string }) => {
  return {
    queryKey: getOpportunityByIdKey(id),
    queryFn: async () => {
      const res = await gqlClient.request<{
        opportunityById: Opportunity;
      }>(OPPORTUNITY_BY_ID_QUERY, {
        id,
      });

      return res.opportunityById;
    },
    staleTime: StaleTime.Default,
    enabled: !!id,
  };
};

export const useOpportunity = (id: string) => {
  const { data: opportunity, isPending } = useQuery(
    opportunityByIdOptions({ id }),
  );

  return { opportunity, isPending };
};
