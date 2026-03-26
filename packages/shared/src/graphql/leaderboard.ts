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
    mostAchievementPoints(limit: $limit) {
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
        username
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
  MostAchievementPoints = 'mostAchievementPoints',
  MostQuestsCompleted = 'mostQuestsCompleted',
  HighestLevel = 'highestLevel',
}

export const MOST_QUESTS_COMPLETED_LIMIT = 10;

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
  [LeaderboardType.MostAchievementPoints]: 'Most achievement points',
  [LeaderboardType.MostQuestsCompleted]: 'Most quests completed',
  [LeaderboardType.HighestLevel]: 'Highest level',
};

export const getLeaderboardTitle = (
  type: LeaderboardType,
  showAchievementXp = false,
): string => {
  if (type === LeaderboardType.MostAchievementPoints && showAchievementXp) {
    return 'Most achievement XP';
  }

  return leaderboardTypeToTitle[type];
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

export const MOST_ACHIEVEMENT_POINTS_QUERY = gql`
  query MostAchievementPoints($limit: Int = 100) {
    mostAchievementPoints(limit: $limit) {
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
  [LeaderboardType.MostAchievementPoints]: MOST_ACHIEVEMENT_POINTS_QUERY,
  [LeaderboardType.MostQuestsCompleted]: MOST_QUESTS_COMPLETED_QUERY,
  [LeaderboardType.HighestLevel]: HIGHEST_LEVEL_QUERY,
  [LeaderboardType.MostVerifiedUsers]: MOST_VERIFIED_USERS_QUERY,
};
