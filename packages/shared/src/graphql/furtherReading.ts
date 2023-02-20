import { gql } from 'graphql-request';
import {
  SOURCE_SHORT_INFO_FRAGMENT,
  USER_SHORT_INFO_FRAGMENT,
} from './fragments';
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
        ...SourceShortInfo
      }
      scout {
        ...UserShortInfo
      }
      author {
        ...UserShortInfo
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
        ...SourceShortInfo
      }
      scout {
        ...UserShortInfo
      }
      author {
        ...UserShortInfo
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
        ...SourceShortInfo
      }
      tags
      scout {
        ...UserShortInfo
      }
      author {
        ...UserShortInfo
      }
      featuredComments {
        author {
          ...UserShortInfo
        }
      }
    }
  }
  ${USER_SHORT_INFO_FRAGMENT}
  ${SOURCE_SHORT_INFO_FRAGMENT}
`;
