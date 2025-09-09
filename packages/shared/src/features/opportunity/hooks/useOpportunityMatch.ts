import { useQuery } from '@tanstack/react-query';
import { StaleTime } from '../../../lib/query';
import { gqlClient } from '../../../graphql/common';
import { GET_OPPORTUNITY_MATCH_QUERY } from '../graphql';
import { getOpportunityByIdKey } from './useOpportunity';

export enum OpportunityMatchStatus {
  Pending = 'pending',
  CandidateAccepted = 'candidate_accepted',
  CandidateRejected = 'candidate_rejected',
  CandidateTimeOut = 'candidate_time_out',
  RecruiterAccepted = 'recruiter_accepted',
  RecruiterRejected = 'recruiter_rejected',
}

export type OpportunityMatch = {
  status: OpportunityMatchStatus;
  description?: {
    reasoning: string;
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

export const useOpportunityMatch = (id: string) => {
  const { data: match } = useQuery(opportunityMatchOptions({ id }));

  return { match };
};
