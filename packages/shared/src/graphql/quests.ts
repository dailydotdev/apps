import { gql } from 'graphql-request';
import { gqlClient } from './common';

export enum QuestType {
  Daily = 'daily',
  Weekly = 'weekly',
}

export enum QuestStatus {
  InProgress = 'in_progress',
  Completed = 'completed',
  Claimed = 'claimed',
}

export enum QuestRewardType {
  Xp = 'xp',
  Reputation = 'reputation',
  Cores = 'cores',
}

export interface QuestReward {
  type: QuestRewardType;
  amount: number;
}

export interface QuestDefinition {
  id: string;
  name: string;
  description: string;
  type: QuestType;
  eventType: string;
  targetCount: number;
}

export interface UserQuest {
  userQuestId?: string | null;
  rotationId: string;
  progress: number;
  status: QuestStatus;
  completedAt?: Date | null;
  claimedAt?: Date | null;
  locked: boolean;
  claimable: boolean;
  quest: QuestDefinition;
  rewards: QuestReward[];
}

export interface QuestBucket {
  regular: UserQuest[];
  plus: UserQuest[];
}

export interface QuestLevel {
  level: number;
  totalXp: number;
  xpInLevel: number;
  xpToNextLevel: number;
}

export interface QuestDashboard {
  level: QuestLevel;
  daily: QuestBucket;
  weekly: QuestBucket;
}

export interface QuestDashboardData {
  questDashboard: QuestDashboard;
}

export interface ClaimQuestRewardData {
  claimQuestReward: QuestDashboard;
}

export interface QuestUpdate {
  updatedAt: Date;
}

export interface QuestUpdateData {
  questUpdate: QuestUpdate;
}

export interface QuestRotationUpdate {
  updatedAt: Date;
  type: QuestType;
  periodStart: Date;
  periodEnd: Date;
}

export interface QuestRotationUpdateData {
  questRotationUpdate: QuestRotationUpdate;
}

export enum ClientQuestEventType {
  VisitArena = 'visit_arena',
  VisitExplorePage = 'visit_explore_page',
  VisitDiscussionsPage = 'visit_discussions_page',
  VisitReadItLaterPage = 'visit_read_it_later_page',
  ViewUserProfile = 'view_user_profile',
}

export const QUEST_DASHBOARD_QUERY = gql`
  query QuestDashboard {
    questDashboard {
      level {
        level
        totalXp
        xpInLevel
        xpToNextLevel
      }
      daily {
        regular {
          userQuestId
          rotationId
          progress
          status
          completedAt
          claimedAt
          locked
          claimable
          quest {
            id
            name
            description
            type
            eventType
            targetCount
          }
          rewards {
            type
            amount
          }
        }
        plus {
          userQuestId
          rotationId
          progress
          status
          completedAt
          claimedAt
          locked
          claimable
          quest {
            id
            name
            description
            type
            eventType
            targetCount
          }
          rewards {
            type
            amount
          }
        }
      }
      weekly {
        regular {
          userQuestId
          rotationId
          progress
          status
          completedAt
          claimedAt
          locked
          claimable
          quest {
            id
            name
            description
            type
            eventType
            targetCount
          }
          rewards {
            type
            amount
          }
        }
        plus {
          userQuestId
          rotationId
          progress
          status
          completedAt
          claimedAt
          locked
          claimable
          quest {
            id
            name
            description
            type
            eventType
            targetCount
          }
          rewards {
            type
            amount
          }
        }
      }
    }
  }
`;

export const CLAIM_QUEST_REWARD_MUTATION = gql`
  mutation ClaimQuestReward($userQuestId: ID!) {
    claimQuestReward(userQuestId: $userQuestId) {
      level {
        level
        totalXp
        xpInLevel
        xpToNextLevel
      }
      daily {
        regular {
          userQuestId
          rotationId
          progress
          status
          completedAt
          claimedAt
          locked
          claimable
          quest {
            id
            name
            description
            type
            eventType
            targetCount
          }
          rewards {
            type
            amount
          }
        }
        plus {
          userQuestId
          rotationId
          progress
          status
          completedAt
          claimedAt
          locked
          claimable
          quest {
            id
            name
            description
            type
            eventType
            targetCount
          }
          rewards {
            type
            amount
          }
        }
      }
      weekly {
        regular {
          userQuestId
          rotationId
          progress
          status
          completedAt
          claimedAt
          locked
          claimable
          quest {
            id
            name
            description
            type
            eventType
            targetCount
          }
          rewards {
            type
            amount
          }
        }
        plus {
          userQuestId
          rotationId
          progress
          status
          completedAt
          claimedAt
          locked
          claimable
          quest {
            id
            name
            description
            type
            eventType
            targetCount
          }
          rewards {
            type
            amount
          }
        }
      }
    }
  }
`;

export const TRACK_QUEST_EVENT_MUTATION = gql`
  mutation TrackQuestEvent($eventType: ClientQuestEventType!) {
    trackQuestEvent(eventType: $eventType) {
      _
    }
  }
`;

export const QUEST_UPDATE_SUBSCRIPTION = gql`
  subscription QuestUpdate {
    questUpdate {
      updatedAt
    }
  }
`;

export const QUEST_ROTATION_UPDATE_SUBSCRIPTION = gql`
  subscription QuestRotationUpdate {
    questRotationUpdate {
      updatedAt
      type
      periodStart
      periodEnd
    }
  }
`;

export const trackQuestClientEvent = async (
  eventType: ClientQuestEventType,
): Promise<void> => {
  await gqlClient.request(TRACK_QUEST_EVENT_MUTATION, { eventType });
};
