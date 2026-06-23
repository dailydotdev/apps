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
    <li className="group/quest relative -mx-2 flex flex-col gap-1 border-b border-border-subtlest-tertiary px-2 py-2.5 transition-colors last:border-b-0 hover:bg-surface-hover">
      {/* Title + subtitle span the full row width (their own lines). */}
      <Link href={`${webappUrl}game-center`} passHref>
        {/* Stretched link — its `before` covers the whole row (the row is
            `relative`), so clicking anywhere on the quest opens the Game Center
            (where the full quest details live). The Claim button opts out via
            `relative z-1`; the progress/chevron sit under the link so they
            navigate too. */}
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

      {/* Bottom strip: XP / Cores rewards on the left; status pinned to the
          bottom-right — claim/claimed, or the step count followed by a small
          radial sized to this strip's height. */}
      <div className="mt-0.5 flex items-center justify-between gap-2">
        <span className="flex flex-wrap items-center gap-2">
          {quest.rewards.map((reward) => (
            <QuestRewardValue key={reward.type} reward={reward} />
          ))}
        </span>
        <div className="flex shrink-0 items-center gap-1.5">
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
            <>
              {/* Step count on the LEFT of the radial. */}
              <Typography
                type={TypographyType.Caption1}
                color={TypographyColor.Quaternary}
                className="tabular-nums"
              >
                {value}/{target}
              </Typography>
              {/* Small ring — sized to roughly match the reward strip height. */}
              <ProgressCircle progress={percentage} size={20} stroke={3} />
            </>
          )}
          {/* Affordance that the row opens the quest's details on click. */}
          <ArrowIcon
            aria-hidden
            size={IconSize.XSmall}
            className="rotate-90 text-text-quaternary opacity-0 transition-opacity group-hover/quest:opacity-100"
          />
        </div>
      </div>
    </li>
  );
};

// Borderless, compact quest list for the streak panel: one tight two-line row
// per quest (name + reward value on top, progress bar or claim action below)
// with hairline separators — no cards, no level chrome. Daily and weekly quests
// are merged into a single list under the panel's "Daily quests" header.
// Replaces the full QuestButton dashboard inside the sidebar.
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
    <ul className="flex flex-col">
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
