import { gql } from 'graphql-request';

type PostStats = {
  numPosts: number;
  numPostViews: number;
  numPostUpvotes: number;
};
type CommentStats = { numComments: number; numCommentUpvotes: number };

export type UserStats = PostStats & CommentStats;
export type UserStatsData = { userStats: UserStats };

export const USER_STATS_QUERY = gql`
  query UserStats($id: ID!) {
    userStats(id: $id) {
      numCommentUpvotes
      numComments
      numPostUpvotes
      numPostViews
      numPosts
    }
  }
`;

export type UserReadingRank = { currentRank: number };
export type UserReadingRankData = { userReadingRank: UserReadingRank };
export type MostReadTag = {
  value: string;
  count: number;
  percentage?: number;
  total?: number;
};

export const USER_READING_RANK_QUERY = gql`
  query UserReadingRank($id: ID!, $version: Int) {
    userReadingRank(id: $id, version: $version) {
      currentRank
    }
  }
`;

export const USER_TOOLTIP_CONTENT_QUERY = gql`
  query UserTooltipContent(
    $id: ID!
    $version: Int
    $requestUserInfo: Boolean!
  ) {
    rank: userReadingRank(id: $id, version: $version) {
      currentRank
    }
    tags: userMostReadTags(id: $id) {
      value
    }
    user(id: $id) @include(if: $requestUserInfo) {
      id
      name
      username
      image
      bio
      permalink
    }
  }
`;

export type Tag = {
  tag: string;
  readingDays: number;
  percentage?: number;
};
export type TopTags = Tag[];
export interface MyRankData {
  rank: {
    rankLastWeek: number;
    currentRank: number;
    progressThisWeek: number;
    tags: TopTags;
    readToday: boolean;
    lastReadTime?: Date;
  };
  reads: number;
}

export const MY_READING_RANK_QUERY = gql`
  query UserReadingRank($id: ID!, $version: Int) {
    rank: userReadingRank(id: $id, version: $version) {
      rankLastWeek
      currentRank
      progressThisWeek
      readToday
      lastReadTime
      tags {
        tag
        readingDays
        percentage
      }
    }
    reads: userReads
  }
`;

export type ProfileReadingData = UserReadingRankHistoryData &
  UserReadHistoryData &
  UserReadingTopTagsData;

export type UserReadingRankHistory = { rank: number; count: number };
export interface UserReadingRankHistoryData {
  userReadingRankHistory: UserReadingRankHistory[];
}

export type UserReadHistory = { date: string; reads: number };
export interface UserReadHistoryData {
  userReadHistory: UserReadHistory[];
}
export interface UserReadingTopTagsData {
  userMostReadTags: MostReadTag[];
}

export const USER_READING_HISTORY_QUERY = gql`
  query UserReadingHistory(
    $id: ID!
    $after: String!
    $before: String!
    $version: Int
    $limit: Int
  ) {
    userReadingRankHistory(
      id: $id
      version: $version
      after: $after
      before: $before
    ) {
      rank
      count
    }
    userReadHistory(id: $id, after: $after, before: $before) {
      date
      reads
    }
    userMostReadTags(id: $id, after: $after, before: $before, limit: $limit) {
      value
      count
      total
      percentage
    }
  }
`;

export const UPVOTER_FRAGMENT = gql`
  fragment UpvoterFragment on User {
    id
    name
    username
    bio
    image
    permalink
  }
`;

const READING_HISTORY_FRAGMENT = gql`
  fragment ReadingHistoryFrament on ReadingHistory {
    timestamp
    timestampDb
    post {
      id
      title
      image
      permalink
      commentsPermalink
      trending
      tags
      readTime
      numUpvotes
      bookmarked
      numComments
      source {
        id
        image
      }
      scout {
        id
      }
      author {
        id
      }
    }
  }
`;

const READING_HISTORY_CONNECTION_FRAGMENT = gql`
  ${READING_HISTORY_FRAGMENT}
  fragment ReadingHistoryConnectionFragment on ReadingHistoryConnection {
    pageInfo {
      endCursor
      hasNextPage
    }
    edges {
      node {
        ...ReadingHistoryFrament
      }
    }
  }
`;

export interface HidePostItemCardProps {
  timestamp: Date;
  postId: string;
}

export const SEARCH_READING_HISTORY_SUGGESTIONS = gql`
  query SearchReadingHistorySuggestions($query: String!) {
    searchReadingHistorySuggestions(query: $query) {
      hits {
        title
      }
    }
  }
`;

export const SEARCH_READING_HISTORY_QUERY = gql`
  ${READING_HISTORY_CONNECTION_FRAGMENT}
  query SearchReadingHistory($first: Int, $after: String, $query: String!) {
    readHistory: searchReadingHistory(
      first: $first
      after: $after
      query: $query
    ) {
      ...ReadingHistoryConnectionFragment
    }
  }
`;

export const READING_HISTORY_QUERY = gql`
  ${READING_HISTORY_CONNECTION_FRAGMENT}
  query ReadHistory($after: String, $first: Int) {
    readHistory(after: $after, first: $first) {
      ...ReadingHistoryConnectionFragment
    }
  }
`;

export const HIDE_READING_HISTORY_MUTATION = gql`
  mutation HideReadHistory($postId: String!, $timestamp: DateTime!) {
    hideReadHistory(postId: $postId, timestamp: $timestamp) {
      _
    }
  }
`;
