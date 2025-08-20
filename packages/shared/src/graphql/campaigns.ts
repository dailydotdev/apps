import { gql } from 'graphql-request';
import { useQuery } from '@tanstack/react-query';
import type { Connection, RequestQueryParams } from './common';
import { gqlClient } from './common';
import type { TransactionCreated } from './njord';
import type { Post } from './posts';
import type { Squad } from './sources';
import { SHARED_POST_INFO_FRAGMENT, SQUAD_BASE_FRAGMENT } from './fragments';
import type { LoggedUser } from '../lib/user';
import user from '../../__tests__/fixture/loggedUser';
import { generateQueryKey, RequestKey, StaleTime } from '../lib/query';


const CAMPAIGN_FRAGMENT = gql`
  fragment CampaignFragment on Campaign {
    id
    referenceId
    state
    createdAt
    endedAt
    type
    flags {
      budget
      spend
      users
      clicks
      impressions
    }
    post {
      ...SharedPostInfo
    }
    user {
      id
      username
      name
      image
    }
    source {
      ...SquadBaseInfo
      flags {
        featured
        totalPosts
        totalViews
        totalUpvotes
        totalAwards
      }
      headerImage
      color
      membersCount
      category {
        id
      }
      members {
        edges {
          node {
            user {
              id
              name
              image
              permalink
              username
              bio
              reputation
              companies {
                name
                image
              }
            }
          }
        }
      }
      referralUrl
    }
  }
  ${SHARED_POST_INFO_FRAGMENT}
  ${SQUAD_BASE_FRAGMENT}
`;
export const CAMPAIGNS_LIST = gql`
  query CampaignsList($first: Int, $after: String) {
    campaignsList(first: $first, after: $after) {
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      edges {
        cursor
        node {
          ...CampaignFragment
        }
      }
    }
  }
  ${CAMPAIGN_FRAGMENT}
`;

export interface CampaignStats {
  spend: number;
  users: number;
  budget: number;
  clicks: number;
  impressions: number;
}

export interface Campaign {
  id: string;
  referenceId: string;
  state: 'INACTIVE' | 'CANCELLED' | 'ACTIVE';
  type: CampaignType;
  createdAt: Date;
  endedAt: Date;
  flags: CampaignStats;
  post?: Post;
  source?: Squad;
  user: LoggedUser;
}

export type CampaignConnection = Connection<Campaign>;

export const getCampaigns = async ({
  first,
  after,
}: RequestQueryParams): Promise<CampaignConnection> => {
  const result = await gqlClient.request(CAMPAIGNS_LIST, {
    first,
    after,
  });

  return result.campaignsList;
};

export const CAMPAIGN_BY_ID = gql`
  query CampaignById($id: ID!) {
    campaignById(id: $id) {
      ...CampaignFragment
    }
  }
  ${CAMPAIGN_FRAGMENT}
`;

export const getCampaignById = async (id: string): Promise<Campaign> => {
  const result = await gqlClient.request(CAMPAIGN_BY_ID, { id });

  return result.campaignById;
};

export const DAILY_CAMPAIGN_REACH_ESTIMATE = gql`
  query DailyCampaignReachEstimate(
    $type: CampaignType!
    $value: ID!
    $budget: Int!
    $duration: Int!
  ) {
    dailyCampaignReachEstimate(
      type: $type
      value: $value
      duration: $duration
      budget: $budget
    ) {
      min
      max
    }
  }
`;

export enum CampaignType {
  Post = 'post',
  Source = 'source',
}

export interface StartCampaignProps {
  value: string;
  budget: number;
  duration: number;
  type: CampaignType;
}

export interface EstimatedReach {
  min: number;
  max: number;
}

export const getDailyCampaignReachEstimate = async ({
  type,
  value,
  budget,
  duration,
}: StartCampaignProps): Promise<EstimatedReach> => {
  const result = await gqlClient.request(DAILY_CAMPAIGN_REACH_ESTIMATE, {
    type,
    value,
    budget,
    duration,
  });

  return result.dailyCampaignReachEstimate;
};

export const START_CAMPAIGN = gql`
  mutation StartCampaign(
    $type: CampaignType!
    $value: ID!
    $budget: Int!
    $duration: Int!
  ) {
    startCampaign(
      type: $type
      value: $value
      duration: $duration
      budget: $budget
    ) {
      transactionId
      referenceId
      balance {
        amount
      }
    }
  }
`;

export const startCampaign = async ({
  type,
  value,
  budget,
  duration,
}: StartCampaignProps): Promise<TransactionCreated> => {
  const result = await gqlClient.request(START_CAMPAIGN, {
    type,
    value,
    budget,
    duration,
  });

  return result.startCampaign;
};

export const STOP_CAMPAIGN = gql`
  mutation StopCampaign($campaignId: ID!) {
    stopCampaign(campaignId: $campaignId) {
      transactionId
      referenceId
      balance {
        amount
      }
    }
  }
`;

export const stopCampaign = async (id: string): Promise<TransactionCreated> => {
  const result = await gqlClient.request(STOP_CAMPAIGN, {
    postId: id,
  });

  return result.stopCampaign;
};

export const DEFAULT_CORES_PER_DAY = 5000;
export const DEFAULT_DURATION_DAYS = 7;

export const useCampaignById = (campaignId: string) =>
  useQuery({
    queryKey: generateQueryKey(RequestKey.Campaigns, user, campaignId),
    queryFn: () => getCampaignById(campaignId),
    staleTime: StaleTime.Default,
    enabled: !!campaignId,
  });
