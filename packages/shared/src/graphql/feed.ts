import { gql } from 'graphql-request';
import { SHARED_POST_INFO_FRAGMENT } from './fragments';
import { Post, PostType } from './posts';
import { Connection } from './common';

export enum RankingAlgorithm {
  Popularity = 'POPULARITY',
  Time = 'TIME',
}

export enum OnboardingMode {
  Manual = 'manual',
  Auto = 'auto',
  Wall = 'wall',
}

export const baseFeedSupportedTypes = [
  PostType.Article,
  PostType.Share,
  PostType.Freeform,
  PostType.VideoYouTube,
  PostType.Collection,
];

export const supportedTypesForPrivateSources = [
  ...baseFeedSupportedTypes,
  PostType.Welcome,
];

const joinedTypes = baseFeedSupportedTypes.join('","');
export const SUPPORTED_TYPES = `$supportedTypes: [String!] = ["${joinedTypes}"]`;

export interface FeedData {
  page: Connection<Post>;
}

export const FEED_POST_FRAGMENT = gql`
  fragment FeedPost on Post {
    ...SharedPostInfo
    sharedPost {
      ...SharedPostInfo
    }
    trending
    feedMeta
    collectionSources {
      handle
      image
    }
    numCollectionSources
    updatedAt
    slug
  }
  ${SHARED_POST_INFO_FRAGMENT}
`;

export const USER_POST_FRAGMENT = gql`
  fragment UserPost on Post {
    read
    upvoted
    commented
    bookmarked
    downvoted
  }
`;

const getFeedPostFragment = (fields = '') => gql`
  fragment FeedPostConnection on PostConnection {
    pageInfo {
      hasNextPage
      endCursor
    }
    edges {
      node {
        ...FeedPost
        ${fields}
        ...UserPost @include(if: $loggedIn)
      }
    }
  }
  ${FEED_POST_FRAGMENT}
  ${USER_POST_FRAGMENT}
`;

export const FEED_POST_CONNECTION_FRAGMENT = getFeedPostFragment('contentHtml');

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
    $refresh: Boolean = false
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
      refresh: $refresh
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
    $source: ID
    $tag: String
  ) {
    page: mostUpvotedFeed(first: $first, after: $after, period: $period, supportedTypes: $supportedTypes, source: $source, tag: $tag) {
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
    $source: ID
    $tag: String
  ) {
    page: mostDiscussedFeed(first: $first, after: $after, supportedTypes: $supportedTypes, source: $source, tag: $tag) {
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
    $supportedTypes: [String!]
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
  ${getFeedPostFragment('pinnedAt contentHtml')}
`;

export const BOOKMARKS_FEED_QUERY = gql`
  query BookmarksFeed(
    $loggedIn: Boolean! = false
    $first: Int
    $after: String
    $supportedTypes: [String!]
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
    $supportedTypes: [String!]
  ) {
    page: searchBookmarks(
      first: $first
      after: $after
      query: $query
      supportedTypes: $supportedTypes
    ) {
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
    $version: Int
  ) {
    page: searchPosts(first: $first, after: $after, query: $query, supportedTypes: $supportedTypes, version: $version) {
      ...FeedPostConnection
    }
  }
  ${FEED_POST_CONNECTION_FRAGMENT}
`;

export const AUTHOR_FEED_QUERY = gql`
  query AuthorFeed(
    $loggedIn: Boolean! = false
    $userId: ID!,
    $after: String,
    $first: Int
    ${SUPPORTED_TYPES}
   ) {
    page: authorFeed(
      author: $userId
      after: $after
      first: $first
      ranking: TIME
      supportedTypes: $supportedTypes
    ) {
      ...FeedPostConnection
    }
  }
  ${FEED_POST_CONNECTION_FRAGMENT}
`;

export const USER_UPVOTED_FEED_QUERY = gql`
  query UpvotedFeed(
    $loggedIn: Boolean! = false
    $userId: ID!,
    $after: String,
    $first: Int
  ${SUPPORTED_TYPES}
  ) {
    page: userUpvotedFeed(
      userId: $userId
      after: $after
      first: $first
      ranking: TIME
      supportedTypes: $supportedTypes
    ) {
      ...FeedPostConnection
    }
  }
  ${FEED_POST_CONNECTION_FRAGMENT}
`;

export const KEYWORD_FEED_QUERY = gql`
  query KeywordFeed(
    $keyword: String!,
    $after: String,
    $first: Int
    ${SUPPORTED_TYPES}
   ) {
    page: keywordFeed(keyword: $keyword, after: $after, first: $first, supportedTypes: $supportedTypes) {
      pageInfo {
        endCursor
        hasNextPage
      }
      edges {
        node {
          id
          title
          commentsPermalink
          image
        }
      }
    }
  }
`;

export const PREVIEW_FEED_QUERY = gql`
  query FeedPreview(
    $loggedIn: Boolean! = false
    ${SUPPORTED_TYPES}
  ) {
    page: feedPreview(
      supportedTypes: $supportedTypes
    ) {
      ...FeedPostConnection
    }
  }
  ${FEED_POST_CONNECTION_FRAGMENT}
`;
