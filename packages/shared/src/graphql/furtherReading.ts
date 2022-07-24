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
      commentsPermalink
      bookmarked @include(if: $loggedIn)
      source {
        id
        name
        image
      }
      scout {
        id
        username
      }
      author {
        id
        username
      }
      trending
      tags
    }
    similarPosts: randomSimilarPostsByTags(
      tags: $tags
      post: $post
      first: $similarFirst
    ) {
      id
      title
      permalink
      commentsPermalink
      bookmarked @include(if: $loggedIn)
      source {
        id
        name
        image
      }
      scout {
        id
        username
      }
      author {
        id
        username
      }
      numComments
      numUpvotes
      tags
    }
    discussedPosts: randomDiscussedPosts(post: $post, first: $discussedFirst) {
      id
      title
      permalink
      commentsPermalink
      numComments
      source {
        id
      }
      tags
      scout {
        id
        username
      }
      author {
        id
        username
      }
      featuredComments {
        author {
          id
          image
          name
          username
        }
      }
    }
  }
`;
