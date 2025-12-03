import { gql } from 'graphql-request';
import { useMutation, useQuery } from '@tanstack/react-query';
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
  mutation OpportunityPreview($opportunity: OpportunityPreviewInput!) {
    opportunityPreview(opportunity: $opportunity) {
      userIds
      totalCount
    }
  }
`;

// Query Function
export const getOpportunityPreview = async (
  opportunity: OpportunityPreviewInput,
): Promise<OpportunityPreviewResponse> => {
  const result = await gqlClient.request(OPPORTUNITY_PREVIEW, {
    opportunity,
  });

  return result.opportunityPreview;
};

// React Hook (for automatic queries)
export const useOpportunityPreview = (opportunity: OpportunityPreviewInput) => {
  const { user } = useAuthContext();

  return useQuery({
    queryKey: generateQueryKey(
      RequestKey.OpportunityPreview,
      user,
      opportunity,
    ),
    queryFn: () => getOpportunityPreview(opportunity),
    enabled: !!user && !!opportunity.title && !!opportunity.tldr,
  });
};

// Mutation Hook (for manual triggering)
export const useOpportunityPreviewMutation = () => {
  return useMutation({
    mutationFn: (opportunity: OpportunityPreviewInput) =>
      getOpportunityPreview(opportunity),
  });
};
