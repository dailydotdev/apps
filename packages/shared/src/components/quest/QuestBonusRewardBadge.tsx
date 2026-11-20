import type { ReactElement } from 'react';
import React from 'react';
import type { QuestReward, UserQuest } from '../../graphql/quests';
import {
  getQuestBonusRewards,
  getQuestRewardLabel,
} from '../../graphql/quests';

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
    <span className="shrink-0 rounded-6 bg-accent-cheese-default px-1 font-bold text-raw-pepper-90 typo-caption2">
      {bonusRewards
        .map(
          ({ type, multiplier }) =>
            `${multiplier}x ${getQuestRewardLabel(type)}`,
        )
        .join(' · ')}
    </span>
  );
};
