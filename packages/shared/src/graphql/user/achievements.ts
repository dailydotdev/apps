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
  rarity: number | null;
  unit: string | null;
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

export interface TrackedAchievementData {
  trackedAchievement: UserAchievement | null;
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

export interface TrackAchievementData {
  trackAchievement: UserAchievement;
}

export interface UntrackAchievementData {
  untrackAchievement: {
    _: boolean | null;
  };
}

export interface ShowcaseAchievementsData {
  showcaseAchievements: UserAchievement[];
}

export interface SetShowcaseAchievementsData {
  setShowcaseAchievements: UserAchievement[];
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
    rarity
    unit
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

export const TRACKED_ACHIEVEMENT_QUERY = gql`
  query TrackedAchievement {
    trackedAchievement {
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

export const TRACK_ACHIEVEMENT_MUTATION = gql`
  mutation TrackAchievement($achievementId: ID!) {
    trackAchievement(achievementId: $achievementId) {
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

export const UNTRACK_ACHIEVEMENT_MUTATION = gql`
  mutation UntrackAchievement {
    untrackAchievement {
      _
    }
  }
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

export const SHOWCASE_ACHIEVEMENTS_QUERY = gql`
  query ShowcaseAchievements($userId: ID!) {
    showcaseAchievements(userId: $userId) {
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

export const SET_SHOWCASE_ACHIEVEMENTS_MUTATION = gql`
  mutation SetShowcaseAchievements($achievementIds: [ID!]!) {
    setShowcaseAchievements(achievementIds: $achievementIds) {
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

export const getTrackedAchievement =
  async (): Promise<UserAchievement | null> => {
    const result = await gqlClient.request<TrackedAchievementData>(
      TRACKED_ACHIEVEMENT_QUERY,
    );

    return result.trackedAchievement;
  };

export const trackAchievement = async (
  achievementId: string,
): Promise<UserAchievement> => {
  const result = await gqlClient.request<TrackAchievementData>(
    TRACK_ACHIEVEMENT_MUTATION,
    { achievementId },
  );

  return result.trackAchievement;
};

export const untrackAchievement = async (): Promise<void> => {
  await gqlClient.request<UntrackAchievementData>(UNTRACK_ACHIEVEMENT_MUTATION);
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

export const getShowcaseAchievements = async (
  userId: string,
): Promise<UserAchievement[]> => {
  const result = await gqlClient.request<ShowcaseAchievementsData>(
    SHOWCASE_ACHIEVEMENTS_QUERY,
    { userId },
  );
  return result.showcaseAchievements;
};

export const setShowcaseAchievements = async (
  achievementIds: string[],
): Promise<UserAchievement[]> => {
  const result = await gqlClient.request<SetShowcaseAchievementsData>(
    SET_SHOWCASE_ACHIEVEMENTS_MUTATION,
    { achievementIds },
  );
  return result.setShowcaseAchievements;
};

// Helper to get target count from achievement criteria
export const getTargetCount = (achievement: Achievement): number => {
  return achievement.criteria?.targetCount ?? 1;
};
