import { gql } from 'graphql-request';
import { gqlClient } from '@dailydotdev/shared/src/graphql/common';
import { ONBOARDING_RECOMMEND_TAGS_MUTATION } from '@dailydotdev/shared/src/graphql/feedSettings';

export interface PostSummary {
  postId: string;
  title: string;
  summary: string;
  tags: string[];
  url: string;
  sourceId: string;
}

export interface DiscoverPostsRequest {
  prompt?: string;
  selectedTags?: string[];
  likedTitles?: string[];
  excludeIds?: string[];
  n?: number;
}

export interface DiscoverPostsResponse {
  posts: PostSummary[];
}

const ONBOARDING_DISCOVER_POSTS_MUTATION = gql`
  mutation OnboardingDiscoverPosts(
    $prompt: String
    $selectedTags: [String!]
    $likedTitles: [String!]
    $excludeIds: [String!]
    $n: Int
  ) {
    onboardingDiscoverPosts(
      prompt: $prompt
      selectedTags: $selectedTags
      likedTitles: $likedTitles
      excludeIds: $excludeIds
      n: $n
    ) {
      posts {
        postId
        title
        summary
        tags
        url
        sourceId
      }
    }
  }
`;

export async function discoverPosts(
  req: DiscoverPostsRequest,
): Promise<DiscoverPostsResponse> {
  const data = await gqlClient.request<{
    onboardingDiscoverPosts: DiscoverPostsResponse;
  }>(ONBOARDING_DISCOVER_POSTS_MUTATION, req);
  return data.onboardingDiscoverPosts;
}

export async function recommendOnboardingTags(
  selectedTags: string[],
  n: number,
): Promise<string[]> {
  if (!selectedTags.length) {
    return [];
  }

  const data = await gqlClient.request<{
    onboardingRecommendTags: { tags: string[] };
  }>(ONBOARDING_RECOMMEND_TAGS_MUTATION, { selectedTags, n });
  return data.onboardingRecommendTags.tags;
}
