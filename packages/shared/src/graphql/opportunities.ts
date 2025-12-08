import { gql } from 'graphql-request';
import type { Connection } from './common';
import type {
  OpportunityMatchDescription,
  ScreeningAnswer,
  EngagementProfile,
  ApplicationRank,
  OpportunityLocation,
} from '../features/opportunity/types';
import type { PublicProfile } from '../lib/user';
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

export type OpportunityMatchUser = Pick<
  PublicProfile,
  'id' | 'name' | 'image' | 'permalink' | 'reputation'
>;

export type OpportunityMatchLocation = Pick<
  OpportunityLocation,
  'city' | 'country'
>;

export interface OpportunityCandidatePreferences {
  role: string | null;
  location: OpportunityMatchLocation[];
}

export interface OpportunityMatch {
  userId: string;
  opportunityId: string;
  status: string;
  description: OpportunityMatchDescription;
  screening: ScreeningAnswer[];
  engagementProfile: Pick<EngagementProfile, 'profileText'> | null;
  applicationRank: Pick<ApplicationRank, 'score' | 'description'>;
  user: OpportunityMatchUser;
  candidatePreferences: OpportunityCandidatePreferences | null;
}

export interface OpportunityMatchesData {
  opportunityMatches: Connection<OpportunityMatch>;
}

export const OPPORTUNITY_MATCHES_QUERY = gql`
  query OpportunityMatches(
    $opportunityId: ID!
    $status: OpportunityMatchStatus
    $after: String
    $first: Int
  ) {
    opportunityMatches(
      opportunityId: $opportunityId
      status: $status
      after: $after
      first: $first
    ) {
      pageInfo {
        hasNextPage
        endCursor
        totalCount
      }
      edges {
        node {
          userId
          opportunityId
          status
          description {
            reasoning
          }
          screening {
            screening
            answer
          }
          engagementProfile {
            profileText
          }
          user {
            id
            name
            image
            permalink
            reputation
          }
          candidatePreferences {
            role
            location {
              city
              country
            }
          }
          applicationRank {
            score
            description
          }
        }
      }
    }
  }
`;

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
