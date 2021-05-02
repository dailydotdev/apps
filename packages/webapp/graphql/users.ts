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
  query UserReadingRank($id: ID!) {
    userReadingRank(id: $id) {
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
}

export const MY_READING_RANK_QUERY = gql`
  query UserReadingRank($id: ID!) {
    rank: userReadingRank(id: $id) {
      currentRank
      progressThisWeek
      readToday
    }
  }
`;

export type UserReadingRankHistory = { rank: number; count: number };
export interface UserReadingRankHistoryData {
  userReadingRankHistory: UserReadingRankHistory[];
}

export const USER_READING_HISTORY_QUERY = gql`
  query UserReadingHistory($id: ID!) {
    userReadingRankHistory(id: $id) {
      rank
      count
    }
  }
`;
