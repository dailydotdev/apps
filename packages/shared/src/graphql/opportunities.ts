import { gql } from 'graphql-request';
import { useQuery } from '@tanstack/react-query';
import { gqlClient } from './common';
import { generateQueryKey, RequestKey } from '../lib/query';
import { useAuthContext } from '../contexts/AuthContext';
import type {
  LocationInput,
  SalaryInput,
  OpportunityMetaInput,
  OpportunityContentInput,
  OpportunityPreviewInput,
} from '../lib/schema/opportunity';
import { disabledRefetch } from '../lib/func';

// Re-export types for convenience
export type {
  LocationInput,
  SalaryInput,
  OpportunityMetaInput,
  OpportunityContentInput,
  OpportunityPreviewInput,
};

// Response Types
export interface OpportunityPreviewResponse {
  userIds: string[];
  totalCount: number;
}

// GraphQL Mutation
export const OPPORTUNITY_PREVIEW = gql`
  mutation OpportunityPreview {
    opportunityPreview {
      userIds
      totalCount
    }
  }
`;

// Mutation Function
export const getOpportunityPreview =
  async (): Promise<OpportunityPreviewResponse> => {
    const result = await gqlClient.request(OPPORTUNITY_PREVIEW);

    return result.opportunityPreview;
  };

// React Query Hook
export const useOpportunityPreview = () => {
  const { user } = useAuthContext();

  return useQuery({
    queryKey: generateQueryKey(RequestKey.OpportunityPreview, user),
    queryFn: () => getOpportunityPreview(),
    enabled: !!user,
    ...disabledRefetch,
    staleTime: Infinity,
    gcTime: Infinity,
  });
};
