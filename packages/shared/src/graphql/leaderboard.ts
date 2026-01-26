import { gql } from 'graphql-request';
import { LEADERBOARD_FRAGMENT } from './fragments';

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
    mostVerifiedUsers(limit: $limit) {
      score
      company {
        name
        image
      }
    }
    popularHotTakes(limit: $limit) {
      score
      hotTake {
        id
        title
        subtitle
        emoji
      }
      user {
        permalink
      }
    }
  }
  ${LEADERBOARD_FRAGMENT}
`;

export enum LeaderboardType {
  HighestReputation = 'highestReputation',
  LongestStreak = 'longestStreak',
  HighestPostViews = 'highestPostViews',
  MostUpvoted = 'mostUpvoted',
  MostReferrals = 'mostReferrals',
  MostReadingDays = 'mostReadingDays',
  MostVerifiedUsers = 'mostVerifiedUsers',
}

export const leaderboardTypeToTitle: Record<LeaderboardType, string> = {
  [LeaderboardType.HighestReputation]: 'Highest reputation',
  [LeaderboardType.LongestStreak]: 'Longest streak',
  [LeaderboardType.HighestPostViews]: 'Highest post views',
  [LeaderboardType.MostUpvoted]: 'Most upvoted',
  [LeaderboardType.MostReferrals]: 'Most referrals',
  [LeaderboardType.MostReadingDays]: 'Most reading days',
  [LeaderboardType.MostVerifiedUsers]: 'Most verified employees',
};

export const isCompanyLeaderboard = (type: LeaderboardType): boolean =>
  type === LeaderboardType.MostVerifiedUsers;

export const HIGHEST_REPUTATION_QUERY = gql`
  query HighestReputation($limit: Int = 100) {
    highestReputation(limit: $limit) {
      ...LeaderboardFragment
    }
  }
  ${LEADERBOARD_FRAGMENT}
`;

export const LONGEST_STREAK_QUERY = gql`
  query LongestStreak($limit: Int = 100) {
    longestStreak(limit: $limit) {
      ...LeaderboardFragment
    }
  }
  ${LEADERBOARD_FRAGMENT}
`;

export const HIGHEST_POST_VIEWS_QUERY = gql`
  query HighestPostViews($limit: Int = 100) {
    highestPostViews(limit: $limit) {
      ...LeaderboardFragment
    }
  }
  ${LEADERBOARD_FRAGMENT}
`;

export const MOST_UPVOTED_QUERY = gql`
  query MostUpvoted($limit: Int = 100) {
    mostUpvoted(limit: $limit) {
      ...LeaderboardFragment
    }
  }
  ${LEADERBOARD_FRAGMENT}
`;

export const MOST_REFERRALS_QUERY = gql`
  query MostReferrals($limit: Int = 100) {
    mostReferrals(limit: $limit) {
      ...LeaderboardFragment
    }
  }
  ${LEADERBOARD_FRAGMENT}
`;

export const MOST_READING_DAYS_QUERY = gql`
  query MostReadingDays($limit: Int = 100) {
    mostReadingDays(limit: $limit) {
      ...LeaderboardFragment
    }
  }
  ${LEADERBOARD_FRAGMENT}
`;

export const MOST_VERIFIED_USERS_QUERY = gql`
  query MostVerifiedUsers($limit: Int = 100) {
    mostVerifiedUsers(limit: $limit) {
      score
      company {
        name
        image
      }
    }
  }
`;

export const leaderboardQueries: Record<LeaderboardType, string> = {
  [LeaderboardType.HighestReputation]: HIGHEST_REPUTATION_QUERY,
  [LeaderboardType.LongestStreak]: LONGEST_STREAK_QUERY,
  [LeaderboardType.HighestPostViews]: HIGHEST_POST_VIEWS_QUERY,
  [LeaderboardType.MostUpvoted]: MOST_UPVOTED_QUERY,
  [LeaderboardType.MostReferrals]: MOST_REFERRALS_QUERY,
  [LeaderboardType.MostReadingDays]: MOST_READING_DAYS_QUERY,
  [LeaderboardType.MostVerifiedUsers]: MOST_VERIFIED_USERS_QUERY,
};
