import { gql } from 'graphql-request';
import { CUSTOM_FEED_FRAGMENT, FEED_POST_FRAGMENT } from './fragments';
import type { Post } from './posts';
import { PostType } from '../types';
import type { Connection } from './common';
import type { FeedOrder } from '../lib/constants';

export enum RankingAlgorithm {
  Popularity = 'POPULARITY',
  Time = 'TIME',
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

export type FeedFlags = {
  name: string;
  icon?: string;
  orderBy?: FeedOrder;
  minDayRange?: number;
  minUpvotes?: number;
  minViews?: number;
  disableEngagementFilter?: boolean;
};

export enum FeedType {
  Main = 'main',
  Custom = 'custom',
}

export type Feed = {
  id: string;
  userId: string;
  flags?: FeedFlags;
  slug: string;
  createdAt: Date;
  type: FeedType;
};

export type FeedList = {
  feedList: Connection<Feed>;
};

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
    $period: Int
    ${SUPPORTED_TYPES}
    $source: ID
    $tag: String
  ) {
    page: mostDiscussedFeed(first: $first, after: $after, period: $period, supportedTypes: $supportedTypes, source: $source, tag: $tag) {
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
    $listId: ID
    $reminderOnly: Boolean
    $supportedTypes: [String!]
  ) {
    page: bookmarksFeed(
      first: $first
      after: $after
      listId: $listId
      reminderOnly: $reminderOnly
      supportedTypes: $supportedTypes
    ) {
      ...FeedPostConnection
    }
  }
  ${FEED_POST_CONNECTION_FRAGMENT}
`;

export const FOLLOWING_FEED_QUERY = gql`
  query FollowingFeed(
    $loggedIn: Boolean! = false
    $first: Int
    $after: String
    ${SUPPORTED_TYPES}
  ) {
    page: followingFeed(
      first: $first
      after: $after
      supportedTypes: $supportedTypes
    ) {
      ...FeedPostConnection
    }
  }
  ${FEED_POST_CONNECTION_FRAGMENT}
`;

export const FEED_BY_IDS_QUERY = gql`
  query FeedByIdsFeed(
    $loggedIn: Boolean! = false
    $first: Int
    $after: String
    $supportedTypes: [String!]
    $postIds: [String!]!
  ) {
    page: feedByIds(
      first: $first
      after: $after
      supportedTypes: $supportedTypes
      postIds: $postIds
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
    $listId: ID
    $supportedTypes: [String!]
  ) {
    page: searchBookmarks(
      first: $first
      after: $after
      query: $query
      listId: $listId
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
    $contentCuration: [String]
    $time: SearchTime
    $version: Int
  ) {
    page: searchPosts(
      first: $first,
      after: $after,
      query: $query,
      supportedTypes: $supportedTypes,
      contentCuration: $contentCuration,
      time: $time,
      version: $version
    ) {
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
    $filters: FiltersInput
  ) {
    page: feedPreview(
      supportedTypes: $supportedTypes
      filters: $filters
    ) {
      ...FeedPostConnection
    }
  }
  ${FEED_POST_CONNECTION_FRAGMENT}
`;

export const FEED_LIST_QUERY = gql`
  {
    feedList {
      pageInfo {
        endCursor
        hasNextPage
      }
      edges {
        node {
          ...CustomFeed
        }
      }
    }
  }
  ${CUSTOM_FEED_FRAGMENT}
`;

export const CUSTOM_FEED_QUERY = gql`
  query CustomFeed(
    $loggedIn: Boolean! = false
    $feedId: ID!
    $after: String
    $first: Int
    ${SUPPORTED_TYPES}
    $version: Int
    $ranking: Ranking
  ) {
    page: customFeed(
      feedId: $feedId
      after: $after
      first: $first
      supportedTypes: $supportedTypes
      version: $version
      ranking: $ranking
    ) {
      ...FeedPostConnection
    }
  }
  ${FEED_POST_CONNECTION_FRAGMENT}
`;

export const CREATE_FEED_MUTATION = `
  mutation CreateFeed($name: String!, $icon: String) {
    createFeed(name: $name, icon: $icon) {
      ...CustomFeed
    }
  }
  ${CUSTOM_FEED_FRAGMENT}
`;

export const UPDATE_FEED_MUTATION = `
  mutation UpdateFeed($feedId: ID!, $name: String!, $icon: String, $orderBy: FeedOrderBy, $minDayRange: Int, $minUpvotes: Int, $minViews: Int, $disableEngagementFilter: Boolean) {
    updateFeed(feedId: $feedId, name: $name, icon: $icon, orderBy: $orderBy, minDayRange: $minDayRange, minUpvotes: $minUpvotes, minViews: $minViews, disableEngagementFilter: $disableEngagementFilter) {
      ...CustomFeed
    }
  }
  ${CUSTOM_FEED_FRAGMENT}
`;

export const DELETE_FEED_MUTATION = `
  mutation DeleteFeed($feedId: ID!) {
    deleteFeed(feedId: $feedId) {
      _
    }
}
`;
