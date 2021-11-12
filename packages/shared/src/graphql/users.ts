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

export const USER_READING_RANK_QUERY = gql`
  query UserReadingRank($id: ID!, $timezone: String) {
    userReadingRank(id: $id, timezone: $timezone) {
      currentRank
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
  query UserReadingRank($id: ID!, $timezone: String) {
    rank: userReadingRank(id: $id, timezone: $timezone) {
      currentRank
      progressThisWeek
      readToday
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
  query UserReadingHistory(
    $id: ID!
    $timezone: String
    $after: String!
    $before: String!
  ) {
    userReadingRankHistory(id: $id, timezone: $timezone) {
      rank
      count
    }
    userReadHistory(
      id: $id
      timezone: $timezone
      after: $after
      before: $before
    ) {
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
