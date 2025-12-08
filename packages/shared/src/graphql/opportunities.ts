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

export interface OpportunityPreviewCompany {
  name: string;
  favicon?: string;
}

export interface TopReaderBadge {
  /** The keyword/tag name */
  keyword: {
    value: string;
  };
  /** When the badge was issued */
  issuedAt: Date;
}

export interface OpportunityPreviewUser {
  /** Real user ID */
  id: string;
  /** User profile image */
  profileImage?: string;
  /** Anonymized ID (e.g., anon #1002) */
  anonId: string;
  /** User description/bio */
  description?: string;
  /** Whether the user is open to work */
  openToWork: boolean;
  /** User seniority level */
  seniority?: string;
  /** User location (from preferences or geo flags) */
  location?: string;
  /** Active company from experience */
  company?: OpportunityPreviewCompany;
  /** Last activity timestamp */
  lastActivity?: Date;
  /** Top tags for the user */
  topTags?: string[];
  /** Top reader badges with tag and issue date */
  recentlyRead?: TopReaderBadge[];
  /** Active squad IDs */
  activeSquads?: string[];
}

export interface OpportunityPreviewEdge {
  node: OpportunityPreviewUser;
  cursor: string;
}

export interface PageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor?: string;
  endCursor?: string;
}

export interface OpportunityPreviewResponse {
  edges: OpportunityPreviewEdge[];
  pageInfo: PageInfo & { totalCount: number };
}

export interface OpportunityPreviewDetails {
  tags: string[];
  companies: OpportunityPreviewCompany[];
  squads: string[];
}

// GraphQL Query
export const OPPORTUNITY_PREVIEW = gql`
  query OpportunityPreview {
    opportunityPreview {
      edges {
        node {
          id
          profileImage
          anonId
          description
          openToWork
          seniority
          location
          company {
            name
            favicon
          }
          lastActivity
          topTags
          recentlyRead {
            keyword {
              value
            }
            issuedAt
          }
          activeSquads
        }
        cursor
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
        totalCount
      }
    }
  }
`;

// Query Function
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

// GraphQL Query for Preview Details
export const OPPORTUNITY_PREVIEW_DETAILS = gql`
  query OpportunityPreviewDetails {
    opportunityPreviewDetails {
      tags
      companies {
        name
        favicon
      }
      squads
    }
  }
`;

// Query Function
export const getOpportunityPreviewDetails =
  async (): Promise<OpportunityPreviewDetails> => {
    const result = await gqlClient.request(OPPORTUNITY_PREVIEW_DETAILS);

    return result.opportunityPreviewDetails;
  };

// React Query Hook - Only fires if opportunityPreview succeeded
export const useOpportunityPreviewDetails = () => {
  const { user } = useAuthContext();
  const { isSuccess: previewSuccess } = useOpportunityPreview();

  return useQuery({
    queryKey: generateQueryKey(RequestKey.OpportunityPreviewDetails, user),
    queryFn: () => getOpportunityPreviewDetails(),
    enabled: !!user && previewSuccess,
    ...disabledRefetch,
    staleTime: Infinity,
    gcTime: Infinity,
  });
};
