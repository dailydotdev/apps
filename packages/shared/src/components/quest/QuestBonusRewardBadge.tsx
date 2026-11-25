import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { QuestReward, UserQuest } from '../../graphql/quests';
import { getQuestBonusRewards } from '../../graphql/quests';
import { useConditionalFeature } from '../../hooks/useConditionalFeature';
import { featureQuestBonusHighlight } from '../../lib/featureManagement';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { ButtonColor } from '../../styles/buttonColors';
import { CoreIcon, RefreshIcon, SparkleIcon } from '../icons';
import { IconSize } from '../Icon';
import { Tooltip } from '../tooltip/Tooltip';

// Values of the `quest_bonus_highlight` flag. Control is the current look.
export enum QuestBonusHighlight {
  Control = 'control',
  // Gold tier: tinted row with a gold edge, solid "2x rewards" pill, rewards
  // in gold, Swap always visible with its price.
  V1 = 'v1',
  // Show the math: shimmering 2x pill, each reward as "old -> doubled", Swap
  // as an always-visible icon button beside the title.
  V2 = 'v2',
  // Spotlight: a gold light runs around the quest, "2x bonus" label, Swap as
  // an outlined button with its price.
  V3 = 'v3',
}

const highlightValues = new Set<string>(Object.values(QuestBonusHighlight));

export const useQuestBonusHighlight = (
  shouldEvaluate = true,
): QuestBonusHighlight => {
  const { value } = useConditionalFeature({
    feature: featureQuestBonusHighlight,
    shouldEvaluate,
  });

  return highlightValues.has(value as string)
    ? (value as QuestBonusHighlight)
    : QuestBonusHighlight.Control;
};

export const getQuestBonusMultiplier = (
  quest: UserQuest,
  rewards?: QuestReward[],
): number => {
  const bonusRewards = getQuestBonusRewards(quest, rewards);

  return bonusRewards.length
    ? Math.max(...bonusRewards.map(({ multiplier }) => multiplier))
    : 1;
};

// Container classes for a quest with a bonus.
export const getQuestBonusContainerClassName = (
  highlight: QuestBonusHighlight,
  hasBonus: boolean,
): string | undefined => {
  if (!hasBonus) {
    return undefined;
  }

  switch (highlight) {
    case QuestBonusHighlight.V1:
      return 'bg-[linear-gradient(90deg,color-mix(in_srgb,var(--theme-accent-cheese-default)_18%,transparent),transparent_90%)] shadow-[inset_2px_0_0_var(--theme-accent-cheese-default)]';
    case QuestBonusHighlight.V3:
      return 'quest-bonus-spotlight';
    default:
      return undefined;
  }
};

export const QuestBonusRewardBadge = ({
  quest,
  rewards,
  highlight = QuestBonusHighlight.Control,
  compact = false,
}: {
  quest: UserQuest;
  rewards?: QuestReward[];
  highlight?: QuestBonusHighlight;
  /** Drops the label text where space is tight (the sidebar rewards line). */
  compact?: boolean;
}): ReactElement | null => {
  const multiplier = getQuestBonusMultiplier(quest, rewards);

  if (multiplier <= 1) {
    return null;
  }

  if (highlight === QuestBonusHighlight.V1) {
    return (
      <span className="inline-flex shrink-0 items-center gap-0.5 rounded-6 bg-accent-cheese-default px-1.5 py-0.5 font-bold text-raw-pepper-90 typo-caption2">
        <SparkleIcon size={IconSize.XXSmall} />
        {multiplier}x{compact ? '' : ' rewards'}
      </span>
    );
  }

  if (highlight === QuestBonusHighlight.V2) {
    return (
      <span className="quest-bonus-sheen inline-flex shrink-0 items-center rounded-8 px-2 py-0.5 font-black text-raw-pepper-90 shadow-[0_0_0.75rem_var(--theme-accent-cheese-default)] typo-footnote">
        {multiplier}x
      </span>
    );
  }

  if (highlight === QuestBonusHighlight.V3) {
    return (
      <span className="inline-flex shrink-0 items-center gap-0.5 rounded-6 bg-gradient-to-r from-accent-cheese-default to-accent-bun-default px-1.5 py-0.5 font-bold uppercase tracking-wider text-raw-pepper-90 typo-caption2">
        <SparkleIcon size={IconSize.XXSmall} />
        {multiplier}x bonus
      </span>
    );
  }

  return (
    <span className="shrink-0 rounded-6 border border-accent-bun-default bg-accent-cheese-default px-1.5 font-bold text-raw-pepper-90 typo-caption2">
      {multiplier}x
    </span>
  );
};

// v2 shows the doubling itself: the base amount struck through, then the
// doubled one. Reward amounts arrive already multiplied from the API.
export const QuestBonusAmount = ({
  amount,
  multiplier,
  prefix = '',
  suffix = '',
}: {
  amount: number;
  multiplier: number;
  prefix?: string;
  suffix?: string;
}): ReactElement => (
  <span className="inline-flex items-baseline gap-1">
    <span className="font-normal text-text-quaternary line-through">
      {prefix}
      {Math.round(amount / multiplier).toLocaleString()}
    </span>
    <span className="font-bold text-accent-cheese-default">
      {prefix}
      {amount.toLocaleString()}
      {suffix}
    </span>
  </span>
);

export const QuestSwapButton = ({
  quest,
  highlight,
  onRefresh,
  className,
}: {
  quest: UserQuest;
  highlight: QuestBonusHighlight;
  onRefresh?: (quest: UserQuest) => void;
  className?: string;
}): ReactElement => {
  const cost = quest.refreshCost ?? 0;
  const onClick = () => onRefresh?.(quest);
  const label = `Swap quest for ${cost} Cores`;

  if (highlight === QuestBonusHighlight.V2) {
    return (
      <Tooltip content={label}>
        <Button
          type="button"
          size={ButtonSize.XSmall}
          variant={ButtonVariant.Float}
          icon={<RefreshIcon />}
          aria-label={label}
          onClick={onClick}
          className={classNames('relative z-1 !flex-none', className)}
        />
      </Tooltip>
    );
  }

  if (highlight === QuestBonusHighlight.V3) {
    return (
      <Button
        type="button"
        size={ButtonSize.XSmall}
        variant={ButtonVariant.Secondary}
        color={ButtonColor.Cheese}
        icon={<RefreshIcon />}
        aria-label={label}
        onClick={onClick}
        className={classNames('relative z-1 !flex-none', className)}
      >
        Swap
        <CoreIcon className="ml-1 !size-3.5" />
        {cost}
      </Button>
    );
  }

  return (
    <Button
      type="button"
      size={ButtonSize.XSmall}
      variant={ButtonVariant.Float}
      icon={<RefreshIcon />}
      aria-label={label}
      onClick={onClick}
      className={classNames('relative z-1 !flex-none', className)}
    >
      Swap
      <CoreIcon className="ml-1 !size-3.5 text-accent-cheese-default" />
      {cost}
    </Button>
  );
};
