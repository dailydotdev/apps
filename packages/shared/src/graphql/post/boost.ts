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
}

export interface PromotedPostList {
  promotedPosts: PromotedPost[];
  impressions: number;
  clicks: number;
  totalSpend: number;
  postIds: string[];
}

export interface BoostedPostStats
  extends Pick<PromotedPostList, 'clicks' | 'impressions' | 'totalSpend'> {
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

export const BOOST_ESTIMATED_REACH = gql`
  query BoostEstimatedReach($postId: ID!) {
    boostEstimatedReach(postId: $postId) {
      min
      max
    }
  }
`;

export interface BoostPostProps {
  id: string;
  budget: number;
  duration: number;
}

export interface BoostEstimatedReach {
  min: number;
  max: number;
}

export const getBoostEstimatedReach = async ({
  id,
}: Pick<BoostPostProps, 'id'>): Promise<BoostEstimatedReach> => {
  const result = await gqlClient.request(BOOST_ESTIMATED_REACH, {
    postId: id,
  });

  return result.boostEstimatedReach;
};

export const START_POST_BOOST = gql`
  mutation StartPostBoost($postId: ID!, $duration: Int!, $budget: Int!) {
    startPostBoost(postId: $postId, duration: $duration, budget: $budget) {
      referenceId
      transactionId
      balance {
        amount
      }
    }
  }
`;

export const startPostBoost = async ({
  id,
  budget,
  duration,
}: BoostPostProps): Promise<TransactionCreated> => {
  const result = await gqlClient.request(START_POST_BOOST, {
    postId: id,
    budget,
    duration,
  });

  return result.startPostBoost;
};

export const CANCEL_POST_BOOST = gql`
  mutation CancelPostBoost($postId: ID!) {
    cancelPostBoost(postId: $postId) {
      referenceId
      transactionId
      balance {
        amount
      }
    }
  }
`;

export const cancelPostBoost = async (
  id: string,
): Promise<TransactionCreated> => {
  const result = await gqlClient.request(CANCEL_POST_BOOST, {
    postId: id,
  });

  return result.cancelPostBoost;
};
