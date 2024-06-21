import { gql } from 'graphql-request';
import { LEADERBOARD_FRAMENT } from './fragments';

export const LEADERBOARD_QUERY = gql`
  query Leaderboard($limit: Int = 10) {
    highestReputation(limit: $limit) {
      ...LeaderboardFragment
    }
    longestStreak(limit: $limit) {
      ...LeaderboardFragment
    }
    highestPostViews(limit: $limit) {
      ...LeaderboardFragment
    }
    mostUpvoted(limit: $limit) {
      ...LeaderboardFragment
    }
    mostReferrals(limit: $limit) {
      ...LeaderboardFragment
    }
    mostReadingDays(limit: $limit) {
      ...LeaderboardFragment
    }
  }
  ${LEADERBOARD_FRAMENT}
`;
