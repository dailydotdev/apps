import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from '../buttons/Button';
import ProgressCircle from '../ProgressCircle';
import { ArrowIcon, CoreIcon, LockIcon, ReputationIcon, VIcon } from '../icons';
import { IconSize } from '../Icon';
import Link from '../utilities/Link';
import { plusUrl, webappUrl } from '../../lib/constants';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import type { QuestReward, UserQuest } from '../../graphql/quests';
import {
  QuestRewardType,
  QuestStatus,
  isQuestClaimed,
} from '../../graphql/quests';
import { useQuestDashboard } from '../../hooks/useQuestDashboard';
import { useClaimQuestReward } from '../../hooks/useClaimQuestReward';
import { usePlusSubscription } from '../../hooks/usePlusSubscription';
import { LogEvent, TargetId } from '../../lib/log';
import {
  getQuestDestination,
  getQuestDestinationUrl,
} from './questDestinations';

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
  onUnlock?: () => void;
}

// Exported for the Storybook state matrix: the row is presentational (the data
// hooks live in CompactQuestList), so stories can render the real thing.
export const CompactQuestRow = ({
  quest,
  isClaiming,
  onClaim,
  onUnlock,
}: CompactQuestRowProps): ReactElement => {
  const target = Math.max(quest.quest.targetCount, 1);
  const value = Math.min(Math.max(quest.progress, 0), target);
  const percentage = Math.min(100, Math.round((value / target) * 100));
  const isClaimed = isQuestClaimed(quest);
  const canClaim = quest.claimable && !!quest.userQuestId && !isClaimed;
  const isLockedComplete =
    quest.locked && !isClaimed && quest.status === QuestStatus.Completed;
  // Route each quest to the surface where it can actually be completed (same
  // mapping the quest dashboard uses); quests with no mapped surface — and
  // claimable/claimed rows, where navigating away is not the point — fall back
  // to Game Center. A finished Plus quest a non-Plus user can't claim goes to
  // Plus.
  const destination =
    canClaim || isClaimed || isLockedComplete
      ? null
      : getQuestDestination(quest.quest);
  let href = `${webappUrl}game-center`;
  let destinationLabel = 'Game Center';
  if (isLockedComplete) {
    href = plusUrl;
    destinationLabel = 'Plus';
  } else if (destination) {
    href = getQuestDestinationUrl(destination);
    destinationLabel = destination.label;
  }

  return (
    // Rounded hover pill + `hover:bg-surface-hover`, matching every other v2
    // panel list row (the px-3 container gives the same ~12px inset as `mx-3`).
    <li className="group/quest relative flex flex-col gap-1 rounded-10 px-2 py-2.5 transition-colors hover:bg-surface-hover">
      {/* Title row: title takes the full width with the open-details chevron in
          the top-right corner. */}
      <div className="flex items-start justify-between gap-1">
        <Link href={href} passHref>
          {/* Stretched link — its `before` covers the whole row (the row is
              `relative`), so clicking anywhere on the quest goes to the quest's
              own surface. The Claim button opts out via `relative z-1`; the
              chevron/progress sit under the link so they navigate too. */}
          <a
            aria-label={`${quest.quest.name} — go to ${destinationLabel}`}
            className="focus-outline min-w-0 flex-1 rounded-6 before:absolute before:inset-0 before:content-['']"
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
        <ArrowIcon
          aria-hidden
          size={IconSize.XSmall}
          className="mt-0.5 shrink-0 rotate-90 text-text-quaternary opacity-0 transition-opacity group-hover/quest:opacity-100"
        />
      </div>
      {quest.quest.description && (
        <Typography
          type={TypographyType.Caption1}
          color={TypographyColor.Tertiary}
          className="break-words"
        >
          {quest.quest.description}
        </Typography>
      )}

      {/* Bottom strip: XP/Cores rewards on the left; status aligned to the right
          on the same row — claim/claimed, or the step count + small radial. */}
      <div className="mt-0.5 flex items-center justify-between gap-2">
        <span className="flex min-w-0 shrink flex-wrap items-center gap-2">
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
          {!canClaim && isLockedComplete && (
            <Link href={plusUrl} passHref>
              <Button
                tag="a"
                size={ButtonSize.XSmall}
                color={ButtonColor.Avocado}
                variant={ButtonVariant.Primary}
                icon={<LockIcon />}
                onClick={onUnlock}
                className="relative z-1"
              >
                Claim with Plus
              </Button>
            </Link>
          )}
          {!canClaim && isClaimed && (
            <span className="flex items-center gap-1 font-bold text-accent-avocado-default typo-caption1">
              <VIcon secondary size={IconSize.XSmall} />
              Claimed
            </span>
          )}
          {!canClaim && !isClaimed && !isLockedComplete && (
            <>
              {quest.locked && (
                <LockIcon
                  aria-label="Plus quest"
                  size={IconSize.XSmall}
                  className="text-text-tertiary"
                />
              )}
              {/* Step count on the LEFT of the radial. */}
              <Typography
                type={TypographyType.Caption1}
                color={TypographyColor.Quaternary}
                className="tabular-nums"
              >
                {value}/{target}
              </Typography>
              <ProgressCircle progress={percentage} size={20} stroke={3} />
            </>
          )}
        </div>
      </div>
    </li>
  );
};

// Compact quest list for the streak panel: rounded hover-pill rows (matching
// the other v2 panels) — title + subtitle full width with the rewards beneath,
// and a right column holding the open-details chevron + step count/radial (or
// claim/claimed). Renders one period's quests; the panel shows daily and weekly
// as separate sections. Replaces the full QuestButton dashboard.
interface CompactQuestListProps {
  period: 'daily' | 'weekly';
}

const emptyCopyByPeriod: Record<CompactQuestListProps['period'], string> = {
  daily: 'new quests tomorrow',
  weekly: 'new quests next week',
};

export const CompactQuestList = ({
  period,
}: CompactQuestListProps): ReactElement | null => {
  const { data } = useQuestDashboard();
  const {
    mutate: claim,
    isPending: isClaiming,
    variables,
  } = useClaimQuestReward();
  const claimingId = isClaiming ? variables?.userQuestId : undefined;
  const { logSubscriptionEvent } = usePlusSubscription();

  const quests = useMemo(() => {
    if (!data) {
      return [];
    }
    return [...data[period].regular, ...data[period].plus];
  }, [data, period]);

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
        You&apos;re all caught up — {emptyCopyByPeriod[period]}.
      </Typography>
    );
  }

  const onClaim = (quest: UserQuest) =>
    claim({
      userQuestId: quest.userQuestId as string,
      questId: quest.quest.id,
      questType: quest.quest.type,
    });

  const onUnlock = () =>
    logSubscriptionEvent({
      event_name: LogEvent.UpgradeSubscription,
      target_id: TargetId.QuestSidebar,
    });

  return (
    <ul className="flex flex-col gap-0.5">
      {quests.map((quest) => (
        <CompactQuestRow
          key={quest.rotationId}
          quest={quest}
          isClaiming={claimingId === quest.userQuestId}
          onClaim={onClaim}
          onUnlock={onUnlock}
        />
      ))}
    </ul>
  );
};
