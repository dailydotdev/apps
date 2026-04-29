import { gql } from 'graphql-request';
import { gqlClient } from '@dailydotdev/shared/src/graphql/common';

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
  confirmedTags?: string[];
  likedTitles?: string[];
  excludeIds?: string[];
  saturatedTags?: string[];
  n?: number;
}

export interface DiscoverPostsResponse {
  posts: PostSummary[];
  subPrompts: string[];
}

const ONBOARDING_DISCOVER_POSTS_MUTATION = gql`
  mutation OnboardingDiscoverPosts(
    $prompt: String
    $selectedTags: [String!]
    $confirmedTags: [String!]
    $likedTitles: [String!]
    $excludeIds: [String!]
    $saturatedTags: [String!]
    $n: Int
  ) {
    onboardingDiscoverPosts(
      prompt: $prompt
      selectedTags: $selectedTags
      confirmedTags: $confirmedTags
      likedTitles: $likedTitles
      excludeIds: $excludeIds
      saturatedTags: $saturatedTags
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
      subPrompts
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

const ONBOARDING_EXTRACT_TAGS_MUTATION = gql`
  mutation OnboardingExtractTags($prompt: String!) {
    onboardingExtractTags(prompt: $prompt) {
      tags
    }
  }
`;

export async function extractTags(prompt: string): Promise<string[]> {
  const data = await gqlClient.request<{
    onboardingExtractTags: { tags: string[] };
  }>(ONBOARDING_EXTRACT_TAGS_MUTATION, { prompt });
  return data.onboardingExtractTags.tags;
}
