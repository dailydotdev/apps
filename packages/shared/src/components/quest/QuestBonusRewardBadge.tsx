import type { ReactElement } from 'react';
import React from 'react';
import type { QuestReward, UserQuest } from '../../graphql/quests';
import { getQuestBonusRewards } from '../../graphql/quests';

export const QuestBonusRewardBadge = ({
  quest,
  rewards,
}: {
  quest: UserQuest;
  rewards?: QuestReward[];
}): ReactElement | null => {
  const bonusRewards = getQuestBonusRewards(quest, rewards);

  if (!bonusRewards.length) {
    return null;
  }

  return (
    <span className="shrink-0 rounded-6 border border-accent-bun-default bg-accent-cheese-default px-1.5 font-bold text-raw-pepper-90 typo-caption2">
      {Math.max(...bonusRewards.map(({ multiplier }) => multiplier))}x
    </span>
  );
};
