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
export type MostReadTag = { value: string; count: number };
export type UserTooltipContentData = {
  rank: UserReadingRank;
  tags: MostReadTag[];
};

export const USER_READING_RANK_QUERY = gql`
  query UserReadingRank($id: ID!) {
    userReadingRank(id: $id) {
      currentRank
    }
  }
`;

export const USER_TOOLTIP_CONTENT_QUERY = gql`
  query UserTooltipContent($id: ID!) {
    rank: userReadingRank(id: $id) {
      currentRank
    }
    tags: userMostReadTags(id: $id) {
      value
    }
  }
`;

export interface MyRankData {
  rank: {
    currentRank: number;
    progressThisWeek: number;
    readToday: boolean;
    lastReadTime?: Date;
  };
  reads: number;
}

export const MY_READING_RANK_QUERY = gql`
  query UserReadingRank($id: ID!) {
    rank: userReadingRank(id: $id) {
      currentRank
      progressThisWeek
      readToday
      lastReadTime
    }
    reads: userReads
  }
`;

export type UserReadingRankHistory = { rank: number; count: number };
export interface UserReadingRankHistoryData {
  userReadingRankHistory: UserReadingRankHistory[];
}

export type UserReadHistory = { date: string; reads: number };
export interface UserReadHistoryData {
  userReadHistory: UserReadHistory[];
}

export const USER_READING_HISTORY_QUERY = gql`
  query UserReadingHistory($id: ID!, $after: String!, $before: String!) {
    userReadingRankHistory(id: $id) {
      rank
      count
    }
    userReadHistory(id: $id, after: $after, before: $before) {
      date
      reads
    }
  }
`;

export const UPVOTER_FRAGMENT = gql`
  fragment UpvoterFragment on User {
    name
    username
    bio
    image
    permalink
  }
`;

export interface HideReadHistoryProps {
  timestamp: Date;
  postId: string;
}

export const READING_HISTORY_QUERY = gql`
  query ReadHistory($after: String, $first: Int) {
    readHistory(after: $after, first: $first) {
      pageInfo {
        endCursor
        hasNextPage
      }
      edges {
        node {
          timestamp
          post {
            id
            title
            image
            commentsPermalink
            source {
              image
            }
          }
        }
      }
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
