import { gql } from 'graphql-request';
import { Post } from './posts';

export type SimilarPostsData = { trendingPosts: Post[]; similarPosts: Post[] };

export const SIMILAR_POSTS_QUERY = gql`
  query SimilarPosts(
    $post: ID!
    $loggedIn: Boolean! = false
    $trendingFirst: Int
    $similarFirst: Int
    $tags: [String]!
  ) {
    trendingPosts: randomTrendingPosts(post: $post, first: $trendingFirst) {
      id
      title
      permalink
      bookmarked @include(if: $loggedIn)
      source {
        name
        image
      }
      trending
    }
    similarPosts: randomSimilarPostsByTags(
      tags: $tags
      post: $post
      first: $similarFirst
    ) {
      id
      title
      permalink
      bookmarked @include(if: $loggedIn)
      source {
        name
        image
      }
      numComments
      numUpvotes
    }
  }
`;
