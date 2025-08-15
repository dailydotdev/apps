import { gql } from 'graphql-request';
import type { Connection, RequestQueryParams } from '../common';
import { gqlClient } from '../common';
import type { Post } from '../posts';
import type { TransactionCreated } from '../njord';

const BOOSTED_POST_FRAGMENT = gql`
  fragment BoostedPostFragment on BoostedPost {
    post {
      id
      title
      image
      shortId
      permalink
      engagements
      commentsPermalink
    }
    campaign {
      campaignId
      postId
      status
      spend
      budget
      impressions
      clicks
      users
      startedAt
      endedAt
    }
  }
`;
export const BOOSTED_POST_CAMPAIGNS = gql`
  query PostCampaigns($first: Int, $after: String) {
    postCampaigns(first: $first, after: $after) {
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      edges {
        cursor
        node {
          ...BoostedPostFragment
        }
      }
      stats {
        impressions
        clicks
        totalSpend
        engagements
        users
      }
    }
  }
  ${BOOSTED_POST_FRAGMENT}
`;

export interface PromotedPost {
  campaignId: string;
  postId: string;
  status: 'INACTIVE' | 'CANCELLED' | 'ACTIVE';
  spend: number;
  budget: number;
  startedAt: Date;
  endedAt: Date;
  impressions: number;
  clicks: number;
  users: number;
}

export interface PromotedPostList {
  promotedPosts: PromotedPost[];
  impressions: number;
  clicks: number;
  users: number;
  totalSpend: number;
  postIds: string[];
}

export interface BoostedPostStats
  extends Pick<
    PromotedPostList,
    'clicks' | 'users' | 'impressions' | 'totalSpend'
  > {
  engagements: number;
}

interface CampaignBoostedPost extends Pick<Post, 'id' | 'title'> {
  image: string;
  permalink: string;
  commentsPermalink: string;
  engagements: number;
}

export interface BoostedPostData {
  campaign: PromotedPost;
  post: CampaignBoostedPost;
}

export interface BoostedPostConnection extends Connection<BoostedPostData> {
  stats?: BoostedPostStats;
}

export const getBoostedPostCampaigns = async ({
  first,
  after,
}: RequestQueryParams): Promise<BoostedPostConnection> => {
  const result = await gqlClient.request(BOOSTED_POST_CAMPAIGNS, {
    first,
    after,
  });

  return result.postCampaigns;
};

export const BOOSTED_POST_CAMPAIGN_BY_ID = gql`
  query PostCampaignById($id: ID!) {
    postCampaignById(id: $id) {
      ...BoostedPostFragment
    }
  }
  ${BOOSTED_POST_FRAGMENT}
`;

export const getBoostedPostByCampaignId = async (
  id: string,
): Promise<BoostedPostData> => {
  const result = await gqlClient.request(BOOSTED_POST_CAMPAIGN_BY_ID, { id });

  return result.postCampaignById;
};

export const BOOST_ESTIMATED_REACH_DAILY = gql`
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

export interface BoostEstimatedReach {
  min: number;
  max: number;
}

export const getBoostEstimatedReachDaily = async ({
  type,
  value,
  budget,
  duration,
}: StartCampaignProps): Promise<BoostEstimatedReach> => {
  const result = await gqlClient.request(BOOST_ESTIMATED_REACH_DAILY, {
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

export const cancelPostBoost = async (
  id: string,
): Promise<TransactionCreated> => {
  const result = await gqlClient.request(STOP_CAMPAIGN, {
    postId: id,
  });

  return result.stopCampaign;
};

export const DEFAULT_CORES_PER_DAY = 5000;
export const DEFAULT_DURATION_DAYS = 7;
