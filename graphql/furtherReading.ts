import { gql } from 'graphql-request';
import { Post } from './posts';

export type FurtherReadingData = {
  trendingPosts: Post[];
  similarPosts: Post[];
  discussedPosts: Post[];
};

export const FURTHER_READING_QUERY = gql`
  query SimilarPosts(
    $post: ID!
    $loggedIn: Boolean! = false
    $trendingFirst: Int
    $similarFirst: Int
    $discussedFirst: Int
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
    discussedPosts: randomDiscussedPosts(post: $post, first: $discussedFirst) {
      id
      title
      commentsPermalink
      numComments
      featuredComments {
        author {
          image
          name
        }
      }
    }
  }
`;
