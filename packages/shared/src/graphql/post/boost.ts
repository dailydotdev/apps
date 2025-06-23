import { gql } from 'graphql-request';
import type { Connection, RequestQueryParams } from '../common';
import { gqlClient } from '../common';
import type { Post } from '../posts';

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
          post {
            id
            title
            image
            shortId
            permalink
          }
          campaign {
            campaignId
            postId
            status
            budget
            currentBudget
            impressions
            clicks
          }
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
`;

export interface PromotedPost {
  campaignId: string;
  postId: string;
  status: 'completed' | 'cancelled' | 'active';
  budget: number;
  currentBudget: number;
  startedAt: Date;
  endedAt?: Date;
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
      post {
        id
        title
        image
        shortId
        permalink
      }
      campaign {
        campaignId
        postId
        status
        budget
        currentBudget
        impressions
        clicks
      }
    }
  }
`;

export const getBoostedPostByCampaignId = async (id: string) => {
  const result = await gqlClient.request(BOOSTED_POST_CAMPAIGN_BY_ID, { id });

  return result.postCampaignById;
};

export const BOOST_ESTIMATED_REACH = gql`
  query BoostEstimatedReach($postId: ID!, $duration: Int!, $budget: Int!) {
    boostEstimatedReach(postId: $postId, duration: $duration, budget: $budget) {
      estimatedReach {
        min
        max
      }
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
  budget,
  duration,
}: BoostPostProps): Promise<BoostEstimatedReach> => {
  const result = await gqlClient.request(BOOST_ESTIMATED_REACH, {
    postId: id,
    budget,
    duration,
  });

  return result.estimatedReach;
};

export const START_POST_BOOST = gql`
  mutation StartPostBoost($postId: ID!, $duration: Int!, $budget: Int!) {
    startPostBoost(postId: $postId, duration: $duration, budget: $budget) {
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
}: BoostPostProps): Promise<{
  transactionId: string;
  balance: { amount: number };
}> => {
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
      _
    }
  }
`;

export const cancelPostBoost = async (
  id: string,
): Promise<BoostEstimatedReach> => {
  const result = await gqlClient.request(CANCEL_POST_BOOST, {
    postId: id,
  });

  return result.cancelPostBoost;
};
