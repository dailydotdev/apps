import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import classNames from 'classnames';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import ProgressCircle from '../ProgressCircle';
import { ArrowIcon, CoreIcon, ReputationIcon, VIcon } from '../icons';
import { IconSize } from '../Icon';
import Link from '../utilities/Link';
import { webappUrl } from '../../lib/constants';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import type { QuestReward, UserQuest } from '../../graphql/quests';
import { QuestRewardType, QuestStatus } from '../../graphql/quests';
import { useQuestDashboard } from '../../hooks/useQuestDashboard';
import { useClaimQuestReward } from '../../hooks/useClaimQuestReward';

const rewardColorByType: Record<QuestRewardType, string> = {
  // XP reads as plain white, normal weight (de-emphasized); Cores/Reputation
  // stay bold + colour-coded so they pop.
  [QuestRewardType.Xp]: 'text-text-primary',
  [QuestRewardType.Cores]: 'text-accent-cheese-default',
  [QuestRewardType.Reputation]: 'text-accent-onion-default',
};

// The reward "value" of a quest — the thing that answers "what do I get?".
const QuestRewardValue = ({
  reward,
}: {
  reward: QuestReward;
}): ReactElement => (
  <span
    className={classNames(
      'flex items-center gap-0.5 tabular-nums typo-caption1',
      reward.type === QuestRewardType.Xp ? 'font-normal' : 'font-bold',
      rewardColorByType[reward.type],
    )}
  >
    {reward.type === QuestRewardType.Cores && <CoreIcon className="size-4" />}
    {reward.type === QuestRewardType.Reputation && (
      <ReputationIcon className="size-4" />
    )}
    <span>
      {reward.amount}
      {reward.type === QuestRewardType.Xp ? ' XP' : ''}
    </span>
  </span>
);

interface CompactQuestRowProps {
  quest: UserQuest;
  isClaiming: boolean;
  onClaim: (quest: UserQuest) => void;
}

const CompactQuestRow = ({
  quest,
  isClaiming,
  onClaim,
}: CompactQuestRowProps): ReactElement => {
  const target = Math.max(quest.quest.targetCount, 1);
  const value = Math.min(Math.max(quest.progress, 0), target);
  const percentage = Math.min(100, Math.round((value / target) * 100));
  const isClaimed =
    quest.status === QuestStatus.Claimed || Boolean(quest.claimedAt);
  const canClaim = quest.claimable && !!quest.userQuestId && !isClaimed;

  return (
    // Rounded hover pill + `hover:bg-surface-hover`, matching every other v2
    // panel list row (the px-3 container gives the same ~12px inset as `mx-3`).
    <li className="group/quest relative flex items-start gap-2 rounded-10 px-2 py-2.5 transition-colors hover:bg-surface-hover">
      {/* Left: title + subtitle take the full row width, with the XP/Cores
          rewards beneath. */}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <Link href={`${webappUrl}game-center`} passHref>
          {/* Stretched link — its `before` covers the whole row (the row is
              `relative`), so clicking anywhere on the quest opens the Game
              Center (where the full quest details live). The Claim button opts
              out via `relative z-1`; the chevron/progress sit under the link so
              they navigate too. */}
          <a
            aria-label={`${quest.quest.name} — open Game Center`}
            className="focus-outline rounded-6 before:absolute before:inset-0 before:content-['']"
          >
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Primary}
              bold
              className="break-words"
            >
              {quest.quest.name}
            </Typography>
          </a>
        </Link>
        {quest.quest.description && (
          <Typography
            type={TypographyType.Caption1}
            color={TypographyColor.Tertiary}
            className="break-words"
          >
            {quest.quest.description}
          </Typography>
        )}
        <span className="mt-0.5 flex flex-wrap items-center gap-2">
          {quest.rewards.map((reward) => (
            <QuestRewardValue key={reward.type} reward={reward} />
          ))}
        </span>
      </div>

      {/* Right column: the open-details chevron in the top-right corner, then
          the status below it on the right — claim/claimed, or the step count
          followed by a small radial ring. */}
      <div className="flex shrink-0 flex-col items-end gap-1.5">
        <ArrowIcon
          aria-hidden
          size={IconSize.XSmall}
          className="rotate-90 text-text-quaternary opacity-0 transition-opacity group-hover/quest:opacity-100"
        />
        {canClaim && (
          <Button
            type="button"
            size={ButtonSize.XSmall}
            variant={ButtonVariant.Primary}
            loading={isClaiming}
            onClick={() => onClaim(quest)}
            // Sits above the stretched link so claiming doesn't navigate.
            className="relative z-1"
          >
            Claim
          </Button>
        )}
        {!canClaim && isClaimed && (
          <span className="flex items-center gap-1 font-bold text-accent-avocado-default typo-caption1">
            <VIcon secondary size={IconSize.XSmall} />
            Claimed
          </span>
        )}
        {!canClaim && !isClaimed && (
          <span className="flex items-center gap-1.5">
            {/* Step count on the LEFT of the radial. */}
            <Typography
              type={TypographyType.Caption1}
              color={TypographyColor.Quaternary}
              className="tabular-nums"
            >
              {value}/{target}
            </Typography>
            <ProgressCircle progress={percentage} size={20} stroke={3} />
          </span>
        )}
      </div>
    </li>
  );
};

// Compact quest list for the streak panel: rounded hover-pill rows (matching
// the other v2 panels) — title + subtitle full width with the rewards beneath,
// and a right column holding the open-details chevron + step count/radial (or
// claim/claimed). Daily and weekly quests are merged into one list under the
// panel's "Daily quests" header. Replaces the full QuestButton dashboard.
export const CompactQuestList = (): ReactElement | null => {
  const { data } = useQuestDashboard();
  const {
    mutate: claim,
    isPending: isClaiming,
    variables,
  } = useClaimQuestReward();
  const claimingId = isClaiming ? variables?.userQuestId : undefined;

  const quests = useMemo(() => {
    if (!data) {
      return [];
    }
    return [
      ...data.daily.regular,
      ...data.daily.plus,
      ...data.weekly.regular,
      ...data.weekly.plus,
    ];
  }, [data]);

  if (!data) {
    return null;
  }

  if (quests.length === 0) {
    return (
      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Tertiary}
        className="py-2"
      >
        You&apos;re all caught up — new quests tomorrow.
      </Typography>
    );
  }

  const onClaim = (quest: UserQuest) =>
    claim({
      userQuestId: quest.userQuestId as string,
      questId: quest.quest.id,
      questType: quest.quest.type,
    });

  return (
    <ul className="flex flex-col gap-0.5">
      {quests.map((quest) => (
        <CompactQuestRow
          key={quest.rotationId}
          quest={quest}
          isClaiming={claimingId === quest.userQuestId}
          onClaim={onClaim}
        />
      ))}
    </ul>
  );
};
