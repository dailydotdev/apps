import { gql } from 'graphql-request';
import { gqlClient } from '../common';

export enum AchievementType {
  Instant = 'instant',
  Streak = 'streak',
  Milestone = 'milestone',
  Multipart = 'multipart',
}

export interface AchievementCriteria {
  targetCount?: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  image: string;
  type: AchievementType;
  criteria?: AchievementCriteria;
  points: number;
}

export interface UserAchievement {
  achievement: Achievement;
  progress: number;
  unlockedAt: string | null;
  createdAt: string | null;
}

export interface AchievementsData {
  achievements: Achievement[];
}

export interface UserAchievementsData {
  userAchievements: UserAchievement[];
}

const ACHIEVEMENT_FRAGMENT = gql`
  fragment AchievementFragment on Achievement {
    id
    name
    description
    image
    type
    criteria {
      targetCount
    }
    points
  }
`;

export const ACHIEVEMENTS_QUERY = gql`
  query Achievements {
    achievements {
      ...AchievementFragment
    }
  }
  ${ACHIEVEMENT_FRAGMENT}
`;

export const USER_ACHIEVEMENTS_QUERY = gql`
  query UserAchievements($userId: ID!) {
    userAchievements(userId: $userId) {
      achievement {
        ...AchievementFragment
      }
      progress
      unlockedAt
      createdAt
    }
  }
  ${ACHIEVEMENT_FRAGMENT}
`;

export const getAchievements = async (): Promise<Achievement[]> => {
  const result = await gqlClient.request<AchievementsData>(ACHIEVEMENTS_QUERY);
  return result.achievements;
};

export const getUserAchievements = async (
  userId: string,
): Promise<UserAchievement[]> => {
  const result = await gqlClient.request<UserAchievementsData>(
    USER_ACHIEVEMENTS_QUERY,
    { userId },
  );
  return result.userAchievements;
};

// Helper to get target count from achievement criteria
export const getTargetCount = (achievement: Achievement): number => {
  return achievement.criteria?.targetCount ?? 1;
};
