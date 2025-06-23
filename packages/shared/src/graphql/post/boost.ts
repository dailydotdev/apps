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
