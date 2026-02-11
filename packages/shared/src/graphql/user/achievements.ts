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
  updatedAt: string | null;
}

export interface AchievementsData {
  achievements: Achievement[];
}

export interface UserAchievementsData {
  userAchievements: UserAchievement[];
}

export interface AchievementSyncStatus {
  syncCount: number;
  remainingSyncs: number;
  canSync: boolean;
  syncedAchievements: boolean;
}

export interface AchievementSyncResult extends AchievementSyncStatus {
  pointsGained: number;
  totalPoints: number;
  newlyUnlockedAchievements: UserAchievement[];
  closeAchievements: UserAchievement[];
}

export interface AchievementSyncStatusData {
  achievementSyncStatus: AchievementSyncStatus;
}

export interface SyncAchievementsData {
  syncAchievements: AchievementSyncResult;
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
      updatedAt
    }
  }
  ${ACHIEVEMENT_FRAGMENT}
`;

export const ACHIEVEMENT_SYNC_STATUS_QUERY = gql`
  query AchievementSyncStatus {
    achievementSyncStatus {
      syncCount
      remainingSyncs
      canSync
      syncedAchievements
    }
  }
`;

export const SYNC_ACHIEVEMENTS_MUTATION = gql`
  mutation SyncAchievements {
    syncAchievements {
      syncCount
      remainingSyncs
      canSync
      syncedAchievements
      pointsGained
      totalPoints
      newlyUnlockedAchievements {
        achievement {
          ...AchievementFragment
        }
        progress
        unlockedAt
        createdAt
        updatedAt
      }
      closeAchievements {
        achievement {
          ...AchievementFragment
        }
        progress
        unlockedAt
        createdAt
        updatedAt
      }
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

export const getAchievementSyncStatus =
  async (): Promise<AchievementSyncStatus> => {
    const result = await gqlClient.request<AchievementSyncStatusData>(
      ACHIEVEMENT_SYNC_STATUS_QUERY,
    );

    return result.achievementSyncStatus;
  };

export const syncAchievements = async (): Promise<AchievementSyncResult> => {
  const result = await gqlClient.request<SyncAchievementsData>(
    SYNC_ACHIEVEMENTS_MUTATION,
  );

  return result.syncAchievements;
};

// Helper to get target count from achievement criteria
export const getTargetCount = (achievement: Achievement): number => {
  return achievement.criteria?.targetCount ?? 1;
};
