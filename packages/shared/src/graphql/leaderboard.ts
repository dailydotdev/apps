import { gql } from 'graphql-request';
import { LEADERBOARD_FRAGMENT } from './fragments';
import { gqlClient } from './common';
import type { QuestLevel } from './quests';
import type { Company } from '../lib/userCompany';
import type { LoggedUser, UserShortProfile } from '../lib/user';
import { generateQueryKey, RequestKey, StaleTime } from '../lib/query';

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
  MostQuestsCompleted = 'mostQuestsCompleted',
  HighestLevel = 'highestLevel',
}

export const MOST_QUESTS_COMPLETED_LIMIT = 10;

/** Rows a board on /users shows: Highest reputation fills three columns of four. */
export const LEADERBOARD_LIST_LIMIT = 12;
/** Rows a board's full list on /users opens with. */
export const LEADERBOARD_TOP_LIMIT = 50;

export interface UserLeaderboard {
  score: number;
  user: UserShortProfile;
  level?: QuestLevel | null;
}

export interface CompanyLeaderboard {
  score: number;
  company: Pick<Company, 'name' | 'image'>;
}

export type QuestCompletionLeader = {
  questId: string;
  questName: string;
  questDescription: string;
  count: number;
};

export type QuestCompletionStats = {
  totalCount: number;
  allTimeLeader: QuestCompletionLeader | null;
  weeklyLeader: QuestCompletionLeader | null;
};

export const leaderboardTypeToTitle: Record<LeaderboardType, string> = {
  [LeaderboardType.HighestReputation]: 'Highest reputation',
  [LeaderboardType.LongestStreak]: 'Longest streak',
  [LeaderboardType.HighestPostViews]: 'Highest post views',
  [LeaderboardType.MostUpvoted]: 'Most upvoted',
  [LeaderboardType.MostReferrals]: 'Most referrals',
  [LeaderboardType.MostReadingDays]: 'Most reading days',
  [LeaderboardType.MostVerifiedUsers]: 'Most verified employees',
  [LeaderboardType.MostQuestsCompleted]: 'Most quests completed',
  [LeaderboardType.HighestLevel]: 'Highest level',
};

export const isCompanyLeaderboard = (type: LeaderboardType): boolean =>
  type === LeaderboardType.MostVerifiedUsers;

export type LeaderboardPosition = {
  rank: number | null;
  score: number;
  cappedAt: number;
};

const positionSupportedTypes = new Set<LeaderboardType>([
  LeaderboardType.HighestReputation,
  LeaderboardType.LongestStreak,
  LeaderboardType.MostReadingDays,
]);

export const isLeaderboardPositionSupported = (
  type: LeaderboardType,
): boolean => positionSupportedTypes.has(type);

export const LEADERBOARD_POSITION_QUERY = gql`
  query LeaderboardPosition($type: LeaderboardType!) {
    leaderboardPosition(type: $type) {
      rank
      score
      cappedAt
    }
  }
`;

export const leaderboardPositionQueryOptions = (
  user: Pick<LoggedUser, 'id'> | undefined,
  type: LeaderboardType,
) => ({
  queryKey: generateQueryKey(RequestKey.LeaderboardPosition, user, type),
  queryFn: async (): Promise<LeaderboardPosition | null> => {
    const res = await gqlClient.request<{
      leaderboardPosition: LeaderboardPosition | null;
    }>(LEADERBOARD_POSITION_QUERY, { type });

    return res.leaderboardPosition;
  },
  staleTime: StaleTime.Default,
});

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

export const MOST_QUESTS_COMPLETED_QUERY = gql`
  query MostQuestsCompleted($limit: Int = ${MOST_QUESTS_COMPLETED_LIMIT}) {
    mostQuestsCompleted(limit: $limit) {
      ...LeaderboardFragment
    }
  }
  ${LEADERBOARD_FRAGMENT}
`;

export const QUEST_COMPLETION_STATS_QUERY = gql`
  query QuestCompletionStats {
    questCompletionStats {
      totalCount
      allTimeLeader {
        questId
        questName
        questDescription
        count
      }
      weeklyLeader {
        questId
        questName
        questDescription
        count
      }
    }
  }
`;

export const HIGHEST_LEVEL_QUERY = gql`
  query HighestLevel($limit: Int = 100) {
    highestLevel(limit: $limit) {
      ...LeaderboardFragment
      level {
        level
        totalXp
        xpInLevel
        xpToNextLevel
      }
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
  [LeaderboardType.MostQuestsCompleted]: MOST_QUESTS_COMPLETED_QUERY,
  [LeaderboardType.HighestLevel]: HIGHEST_LEVEL_QUERY,
  [LeaderboardType.MostVerifiedUsers]: MOST_VERIFIED_USERS_QUERY,
};

export const leaderboardBoardQueryOptions = <
  T extends UserLeaderboard | CompanyLeaderboard,
>(
  type: LeaderboardType,
  limit: number,
) => ({
  queryKey: generateQueryKey(RequestKey.Leaderboard, undefined, type, limit),
  queryFn: async (): Promise<T[]> => {
    const res = await gqlClient.request<Record<string, T[]>>(
      leaderboardQueries[type],
      { limit },
    );

    return res[type] ?? [];
  },
  staleTime: StaleTime.Default,
});
