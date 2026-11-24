import { gql } from 'graphql-request';
import { gqlClient } from './common';

export enum QuestType {
  Daily = 'daily',
  Weekly = 'weekly',
  Milestone = 'milestone',
  Intro = 'intro',
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
  rewardMultipliers?: Record<QuestRewardType, number>;
  refreshCost?: number | null;
  chainStep?: number | null;
  chainLength?: number | null;
}

export const getQuestChainLabel = (quest: UserQuest): string | null =>
  quest.chainStep && quest.chainLength && quest.chainLength > 1
    ? `Step ${quest.chainStep}/${quest.chainLength}`
    : null;

// A claim is only reliably detected by checking both: the API stamps
// `claimedAt` without always flipping `status` to `claimed`.
export const isQuestClaimed = (quest: UserQuest): boolean =>
  quest.status === QuestStatus.Claimed || Boolean(quest.claimedAt);

export const getQuestRewardLabel = (type: QuestRewardType): string => {
  switch (type) {
    case QuestRewardType.Cores:
      return 'Cores';
    case QuestRewardType.Reputation:
      return 'Reputation';
    case QuestRewardType.Xp:
    default:
      return 'XP';
  }
};

export const getQuestBonusRewards = (
  quest: UserQuest,
  rewards: QuestReward[] = quest.rewards,
): { type: QuestRewardType; multiplier: number }[] =>
  [...new Set(rewards.map(({ type }) => type))].flatMap((type) => {
    const multiplier = quest.rewardMultipliers?.[type] ?? 1;

    return multiplier > 1 ? [{ type, multiplier }] : [];
  });

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
  currentStreak: number;
  longestStreak: number;
  daily: QuestBucket;
  weekly: QuestBucket;
  milestone: UserQuest[];
  intro: UserQuest[];
}

export interface QuestDashboardData {
  questDashboard: QuestDashboard;
}

export interface ClaimQuestRewardData {
  claimQuestReward: Pick<
    QuestDashboard,
    'level' | 'daily' | 'weekly' | 'milestone' | 'intro'
  >;
}

export interface RefreshQuestData {
  refreshQuest: ClaimQuestRewardData['claimQuestReward'];
}

export interface QuestUpdate {
  updatedAt: Date;
}

export interface QuestUpdateData {
  questUpdate: QuestUpdate;
}

export enum ClientQuestEventType {
  VisitExplorePage = 'visit_explore_page',
  VisitReadItLaterPage = 'visit_read_it_later_page',
  VisitMarketplace = 'visit_marketplace',
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
      currentStreak
      longestStreak
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
          rewardMultipliers {
            xp
            reputation
            cores
          }
          refreshCost
          chainStep
          chainLength
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
          rewardMultipliers {
            xp
            reputation
            cores
          }
          refreshCost
          chainStep
          chainLength
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
          rewardMultipliers {
            xp
            reputation
            cores
          }
          refreshCost
          chainStep
          chainLength
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
          rewardMultipliers {
            xp
            reputation
            cores
          }
          refreshCost
          chainStep
          chainLength
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
      milestone {
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
      intro {
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
`;

const QUEST_ACTION_PAYLOAD_FIELDS = `
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
          rewardMultipliers {
            xp
            reputation
            cores
          }
          refreshCost
          chainStep
          chainLength
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
          rewardMultipliers {
            xp
            reputation
            cores
          }
          refreshCost
          chainStep
          chainLength
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
          rewardMultipliers {
            xp
            reputation
            cores
          }
          refreshCost
          chainStep
          chainLength
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
          rewardMultipliers {
            xp
            reputation
            cores
          }
          refreshCost
          chainStep
          chainLength
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
      milestone {
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
      intro {
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
`;

export const CLAIM_QUEST_REWARD_MUTATION = gql`
  mutation ClaimQuestReward($userQuestId: ID!) {
    claimQuestReward(userQuestId: $userQuestId) {
${QUEST_ACTION_PAYLOAD_FIELDS}
    }
  }
`;

export const REFRESH_QUEST_MUTATION = gql`
  mutation RefreshQuest($userQuestId: ID!) {
    refreshQuest(userQuestId: $userQuestId) {
${QUEST_ACTION_PAYLOAD_FIELDS}
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

export const TRACK_SHARED_POST_CLICK_MUTATION = gql`
  mutation TrackSharedPostClick(
    $referringUserId: ID!
    $postId: ID!
    $campaign: String!
  ) {
    trackSharedPostClick(
      referringUserId: $referringUserId
      postId: $postId
      campaign: $campaign
    ) {
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

export const trackSharedPostClick = async ({
  referringUserId,
  postId,
  campaign,
}: {
  referringUserId: string;
  postId: string;
  campaign: string;
}): Promise<void> => {
  await gqlClient.request(TRACK_SHARED_POST_CLICK_MUTATION, {
    referringUserId,
    postId,
    campaign,
  });
};
