import { gql } from 'graphql-request';
import { SHARED_POST_INFO_FRAGMENT } from './fragments';

export enum RankingAlgorithm {
  Popularity = 'POPULARITY',
  Time = 'TIME',
}

export enum OnboardingMode {
  Manual = 'manual',
  Auto = 'auto',
}

export const SUPPORTED_TYPES = `$supportedTypes: [String!] = ["article", "share"]`;

export const FEED_POST_FRAGMENT = gql`
  fragment FeedPost on Post {
    id
    title
    createdAt
    image
    readTime
    source {
      ...SourceShortInfo
    }
    sharedPost {
      ...SharedPostInfo
    }
    permalink
    numComments
    numUpvotes
    commentsPermalink
    scout {
      ...UserShortInfo
    }
    author {
      ...UserShortInfo
    }
    trending
    tags
    type
    private
  }
  ${SHARED_POST_INFO_FRAGMENT}
`;

export const USER_POST_FRAGMENT = gql`
  fragment UserPost on Post {
    read
    upvoted
    commented
    bookmarked
  }
`;

export const FEED_POST_CONNECTION_FRAGMENT = gql`
  fragment FeedPostConnection on PostConnection {
    pageInfo {
      hasNextPage
      endCursor
    }
    edges {
      node {
        ...FeedPost
        ...UserPost @include(if: $loggedIn)
      }
    }
  }
  ${FEED_POST_FRAGMENT}
  ${USER_POST_FRAGMENT}
`;

export const ANONYMOUS_FEED_QUERY = gql`
  query AnonymousFeed(
    $loggedIn: Boolean! = false
    $first: Int
    $after: String
    $ranking: Ranking
    $version: Int
    ${SUPPORTED_TYPES}
  ) {
    page: anonymousFeed(
      first: $first
      after: $after
      ranking: $ranking
      version: $version
      supportedTypes: $supportedTypes
    ) {
      ...FeedPostConnection
    }
  }
  ${FEED_POST_CONNECTION_FRAGMENT}
`;

export const FEED_QUERY = gql`
  query Feed(
    $loggedIn: Boolean! = false
    $first: Int
    $after: String
    $ranking: Ranking
    $version: Int
    ${SUPPORTED_TYPES}
  ) {
    page: feed(
      first: $first
      after: $after
      ranking: $ranking
      version: $version
      supportedTypes: $supportedTypes
    ) {
      ...FeedPostConnection
    }
  }
  ${FEED_POST_CONNECTION_FRAGMENT}
`;

export const MOST_UPVOTED_FEED_QUERY = gql`
  query MostUpvotedFeed(
    $loggedIn: Boolean! = false
    $first: Int
    $after: String
    $period: Int
    ${SUPPORTED_TYPES}
  ) {
    page: mostUpvotedFeed(first: $first, after: $after, period: $period, supportedTypes: $supportedTypes) {
      ...FeedPostConnection
    }
  }
  ${FEED_POST_CONNECTION_FRAGMENT}
`;

export const MOST_DISCUSSED_FEED_QUERY = gql`
  query MostDiscussedFeed(
    $loggedIn: Boolean! = false
    $first: Int
    $after: String
    ${SUPPORTED_TYPES}
  ) {
    page: mostDiscussedFeed(first: $first, after: $after, supportedTypes: $supportedTypes) {
      ...FeedPostConnection
    }
  }
  ${FEED_POST_CONNECTION_FRAGMENT}
`;

export const TAG_FEED_QUERY = gql`
  query TagFeed(
    $tag: String!
    $loggedIn: Boolean! = false
    $first: Int
    $after: String
    $ranking: Ranking
    ${SUPPORTED_TYPES}
  ) {
    page: tagFeed(tag: $tag, first: $first, after: $after, ranking: $ranking, supportedTypes: $supportedTypes) {
      ...FeedPostConnection
    }
  }
  ${FEED_POST_CONNECTION_FRAGMENT}
`;

export const SOURCE_FEED_QUERY = gql`
  query SourceFeed(
    $source: ID!
    $loggedIn: Boolean! = false
    $first: Int
    $after: String
    $ranking: Ranking
    ${SUPPORTED_TYPES}
  ) {
    page: sourceFeed(
      source: $source
      first: $first
      after: $after
      ranking: $ranking
      supportedTypes: $supportedTypes
    ) {
      ...FeedPostConnection
    }
  }
  ${FEED_POST_CONNECTION_FRAGMENT}
`;

export const BOOKMARKS_FEED_QUERY = gql`
  query BookmarksFeed(
    $loggedIn: Boolean! = false
    $first: Int
    $after: String
    ${SUPPORTED_TYPES}
  ) {
    page: bookmarksFeed(
      first: $first
      after: $after
      supportedTypes: $supportedTypes
    ) {
      ...FeedPostConnection
    }
  }
  ${FEED_POST_CONNECTION_FRAGMENT}
`;

export const SEARCH_BOOKMARKS_QUERY = gql`
  query SearchBookmarks(
    $loggedIn: Boolean! = false
    $first: Int
    $after: String
    $query: String!
    ${SUPPORTED_TYPES}
  ) {
    page: searchBookmarks(first: $first, after: $after, query: $query, supportedTypes: $supportedTypes) {
      ...FeedPostConnection
    }
  }
  ${FEED_POST_CONNECTION_FRAGMENT}
`;

export const SEARCH_BOOKMARKS_SUGGESTIONS = gql`
  query SearchBookmarksSuggestions($query: String!) {
    searchBookmarksSuggestions(query: $query) {
      hits {
        title
      }
    }
  }
`;

export const SEARCH_POSTS_QUERY = gql`
  query SearchPosts(
    $loggedIn: Boolean! = false
    $first: Int
    $after: String
    $query: String!
    ${SUPPORTED_TYPES}
  ) {
    page: searchPosts(first: $first, after: $after, query: $query, supportedTypes: $supportedTypes) {
      ...FeedPostConnection
    }
  }
  ${FEED_POST_CONNECTION_FRAGMENT}
`;
