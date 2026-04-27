import { gql } from 'graphql-request';
import { gqlClient } from '@dailydotdev/shared/src/graphql/common';
import { supportedTypesForPrivateSources } from '@dailydotdev/shared/src/graphql/feed';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';

interface FeedByIdsResponse {
  page: {
    edges: Array<{ node: Post }>;
  };
}

const POSTS_HYDRATION_QUERY = gql`
  query SwipeOnboardingPostHydration(
    $postIds: [String!]!
    $supportedTypes: [String!]
  ) {
    page: feedByIds(
      first: 50
      supportedTypes: $supportedTypes
      postIds: $postIds
    ) {
      edges {
        node {
          id
          title
          image
          permalink
          commentsPermalink
          type
          tags
          bookmarked
          createdAt
          readTime
          numUpvotes
          numComments
          source {
            id
            name
            image
            type
          }
        }
      }
    }
  }
`;

export async function hydratePostsByIds(
  postIds: string[],
): Promise<Map<string, Post>> {
  const map = new Map<string, Post>();
  if (postIds.length === 0) return map;
  const res = await gqlClient.request<FeedByIdsResponse>(
    POSTS_HYDRATION_QUERY,
    { postIds, supportedTypes: supportedTypesForPrivateSources },
  );
  for (const edge of res.page.edges) {
    map.set(edge.node.id, edge.node);
  }
  return map;
}
