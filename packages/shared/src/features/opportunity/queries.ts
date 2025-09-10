import type { QueryKey } from '@tanstack/react-query';
import { RequestKey, StaleTime } from '../../lib/query';
import { gqlClient } from '../../graphql/common';
import type { Opportunity, OpportunityMatch } from './types';
import {
  GET_OPPORTUNITY_MATCH_QUERY,
  OPPORTUNITY_BY_ID_QUERY,
} from './graphql';

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
