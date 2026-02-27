import type { QuestRewardType } from '../graphql/quests';

export const QUEST_REWARD_COUNTER_EVENT = 'quest-reward-counter';

export type QuestRewardCounterEventPhase = 'start' | 'hit';

export type QuestRewardCounterEventDetail = {
  phase: QuestRewardCounterEventPhase;
  rewardType: QuestRewardType;
  claimId: string;
  baseValue?: number;
  delta?: number;
  clearAfterMs?: number;
};
