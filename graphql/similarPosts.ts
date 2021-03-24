import { gql } from 'graphql-request';
import { Post } from './posts';

export type SimilarPostsData = { trendingPosts: Post[]; similarPosts: Post[] };

export const SIMILAR_POSTS_QUERY = gql`
  query SimilarPosts(
    $post: ID!
    $loggedIn: Boolean! = false
    $trendingFirst: Int
    $similarFirst: Int
  ) {
    trendingPosts: randomTrendingPosts(first: $trendingFirst) {
      id
      title
      url
      bookmarked @include(if: $loggedIn)
      source {
        name
        image
      }
      trending
    }
    similarPosts: randomSimilarPosts(post: $post, first: $similarFirst) {
      id
      title
      url
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
