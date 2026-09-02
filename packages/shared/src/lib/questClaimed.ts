import type { QuestType } from '../graphql/quests';

// Dispatched on window by `useClaimQuestReward` once a claim succeeds, so
// listeners mounted somewhere else entirely — the offers popup lives in
// MainLayout — can react to the claim itself instead of inferring it from a
// dashboard count. Mirrors QUEST_REWARD_COUNTER_EVENT, which the profile
// button already consumes the same way.
export const QUEST_CLAIMED_EVENT = 'quest-claimed';

export type QuestClaimedEventDetail = {
  questId: string;
  questType: QuestType;
};
