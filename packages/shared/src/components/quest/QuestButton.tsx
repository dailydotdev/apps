import classNames from 'classnames';
import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  Button,
  ButtonIconPosition,
  ButtonSize,
  ButtonVariant,
} from '../buttons/Button';
import { Bubble } from '../tooltips/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '../dropdown/DropdownMenu';
import { CoreIcon, LockIcon, MedalBadgeIcon, ReputationIcon } from '../icons';
import type {
  QuestBucket,
  QuestLevel,
  QuestReward,
  UserQuest,
} from '../../graphql/quests';
import {
  QuestRewardType,
  QuestStatus,
  QUEST_UPDATE_SUBSCRIPTION,
} from '../../graphql/quests';
import { useClaimQuestReward } from '../../hooks/useClaimQuestReward';
import { useQuestDashboard } from '../../hooks/useQuestDashboard';
import { useAuthContext } from '../../contexts/AuthContext';
import { generateQueryKey, RequestKey } from '../../lib/query';
import useSubscription from '../../hooks/useSubscription';
import { ProgressBar } from '../fields/ProgressBar';
import { UpgradeToPlus } from '../UpgradeToPlus';
import { TargetId } from '../../lib/log';

const getProgress = (progress: number, target: number) => {
  const safeTarget = Math.max(target, 1);
  const safeProgress = Math.max(progress, 0);
  return {
    value: Math.min(safeProgress, safeTarget),
    percentage: Math.min(100, Math.round((safeProgress / safeTarget) * 100)),
    target: safeTarget,
  };
};

const getLevelProgress = (level: QuestLevel) => {
  const totalForLevel = level.xpInLevel + level.xpToNextLevel;

  if (!totalForLevel) {
    return 0;
  }

  return Math.min(100, Math.round((level.xpInLevel / totalForLevel) * 100));
};

const getStatusLabel = (quest: UserQuest): string => {
  if (quest.status === QuestStatus.Claimed) {
    return 'Claimed';
  }

  if (quest.claimable) {
    return 'Ready to claim';
  }

  if (quest.status === QuestStatus.Completed) {
    return quest.locked ? 'Plus required' : 'Completed';
  }

  return 'In progress';
};

const getRewardIcon = (reward: QuestReward): ReactElement => {
  switch (reward.type) {
    case QuestRewardType.Cores:
      return <CoreIcon className="text-accent-cheese-default" />;
    case QuestRewardType.Reputation:
      return <ReputationIcon className="text-accent-onion-default" />;
    case QuestRewardType.Xp:
    default:
      return (
        <span className="inline-flex size-5 items-center justify-center text-[0.5625rem] font-bold lowercase leading-none !text-accent-avocado-default">
          xp
        </span>
      );
  }
};

const getRewardLabel = (reward: QuestReward): string => {
  switch (reward.type) {
    case QuestRewardType.Cores:
      return 'Cores';
    case QuestRewardType.Reputation:
      return 'Reputation';
    case QuestRewardType.Xp:
    default:
      return 'XP';
  }
};

const QuestRewardChip = ({ reward }: { reward: QuestReward }): ReactElement => {
  return (
    <span className="inline-flex items-center gap-1 rounded-8 bg-surface-float px-2 py-1 typo-caption1">
      {getRewardIcon(reward)}+{reward.amount.toLocaleString()}{' '}
      {getRewardLabel(reward)}
    </span>
  );
};

const QuestItem = ({
  quest,
  onClaim,
  isClaiming,
}: {
  quest: UserQuest;
  onClaim: (userQuestId: string) => void;
  isClaiming: boolean;
}): ReactElement => {
  const { value, percentage, target } = getProgress(
    quest.progress,
    quest.quest.targetCount,
  );
  const canClaim = quest.claimable && !!quest.userQuestId;

  return (
    <article
      className={classNames(
        'flex flex-col gap-2 rounded-12 border border-border-subtlest-tertiary p-2',
        quest.locked && 'opacity-50 grayscale',
      )}
    >
      <header className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-bold text-text-primary typo-footnote">
            {quest.quest.name}
          </p>
          <p className="line-clamp-2 text-text-tertiary typo-caption1">
            {quest.quest.description}
          </p>
        </div>
        {quest.locked && <LockIcon className="text-text-tertiary" />}
      </header>

      <div className="flex items-center justify-between gap-2 text-text-tertiary typo-caption1">
        <span>
          {value}/{target}
        </span>
        <span>{getStatusLabel(quest)}</span>
      </div>

      <ProgressBar
        percentage={percentage}
        shouldShowBg
        className={{
          wrapper: 'h-1.5 rounded-14',
          bar: 'h-full rounded-14',
          barColor: quest.locked
            ? 'bg-border-subtler'
            : 'bg-accent-cabbage-default',
        }}
      />

      <div className="flex flex-wrap gap-1">
        {quest.rewards.map((reward, index) => (
          <QuestRewardChip
            key={`${quest.rotationId}-${reward.type}-${index.toString()}`}
            reward={reward}
          />
        ))}
      </div>

      {canClaim && (
        <Button
          variant={ButtonVariant.Primary}
          size={ButtonSize.Small}
          className="w-fit"
          disabled={isClaiming}
          loading={isClaiming}
          onClick={() => {
            if (!quest.userQuestId || isClaiming) {
              return;
            }
            onClaim(quest.userQuestId);
          }}
        >
          Claim
        </Button>
      )}
    </article>
  );
};

const QuestSection = ({
  title,
  bucket,
  onClaim,
  claimingQuestId,
}: {
  title: string;
  bucket: QuestBucket;
  onClaim: (userQuestId: string) => void;
  claimingQuestId?: string;
}): ReactElement => {
  const hasQuests = bucket.regular.length > 0 || bucket.plus.length > 0;

  if (!hasQuests) {
    return (
      <section className="flex flex-col gap-2">
        <h4 className="font-bold text-text-primary typo-callout">{title}</h4>
        <p className="text-text-tertiary typo-caption1">
          No active quests yet.
        </p>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-2">
      <h4 className="font-bold text-text-primary typo-callout">{title}</h4>

      {bucket.regular.map((quest) => (
        <QuestItem
          key={quest.rotationId}
          quest={quest}
          onClaim={onClaim}
          isClaiming={claimingQuestId === quest.userQuestId}
        />
      ))}

      {bucket.plus.length > 0 && (
        <>
          <div className="mt-1 flex items-center justify-between gap-2">
            <p className="text-action-plus-default typo-caption1">Plus quest</p>
            <UpgradeToPlus
              target={TargetId.Popover}
              size={ButtonSize.Small}
              className="!flex-none"
            />
          </div>
          {bucket.plus.map((quest) => (
            <QuestItem
              key={quest.rotationId}
              quest={quest}
              onClaim={onClaim}
              isClaiming={claimingQuestId === quest.userQuestId}
            />
          ))}
        </>
      )}
    </section>
  );
};

export const QuestButton = (): ReactElement => {
  const queryClient = useQueryClient();
  const { user } = useAuthContext();
  const { data, isPending, isError } = useQuestDashboard();
  const {
    mutate: claimQuestReward,
    isPending: isClaimPending,
    variables,
  } = useClaimQuestReward();
  const questDashboardQueryKey = generateQueryKey(
    RequestKey.QuestDashboard,
    user,
  );

  useSubscription(
    () => ({
      query: QUEST_UPDATE_SUBSCRIPTION,
    }),
    {
      next: () => {
        queryClient.invalidateQueries({
          queryKey: questDashboardQueryKey,
          exact: true,
        });
      },
    },
    [user?.id],
  );

  const level = data?.level.level ?? 1;
  const levelProgress = data?.level ? getLevelProgress(data.level) : 0;
  const claimableCount = useMemo(() => {
    if (!data) {
      return 0;
    }

    return [
      ...data.daily.regular,
      ...data.daily.plus,
      ...data.weekly.regular,
      ...data.weekly.plus,
    ].filter((quest) => quest.claimable).length;
  }, [data]);
  const claimingQuestId = isClaimPending ? variables?.userQuestId : undefined;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        asChild
        tooltip={{
          content: 'Quests',
          side: 'bottom',
        }}
      >
        <Button
          variant={ButtonVariant.Float}
          className="relative w-[5.25rem] justify-center"
          aria-label="Quests"
          iconPosition={ButtonIconPosition.Left}
          icon={<MedalBadgeIcon />}
        >
          L{level}
          {claimableCount > 0 && (
            <Bubble className="-right-1.5 -top-1.5 px-1">
              {claimableCount}
            </Bubble>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-[22rem] !p-0"
        scrollableClassName="max-h-[var(--radix-dropdown-menu-content-available-height)]"
      >
        <div className="flex flex-col">
          <header className="flex flex-col gap-2 border-b border-border-subtlest-tertiary p-3">
            <p className="font-bold text-text-primary typo-callout">Quests</p>
            <div className="flex items-center justify-between gap-2 text-text-tertiary typo-caption1">
              <span>Level {level}</span>
              {data?.level && (
                <span>
                  {data.level.xpInLevel}/
                  {data.level.xpInLevel + data.level.xpToNextLevel} XP
                </span>
              )}
            </div>
            <ProgressBar
              percentage={levelProgress}
              shouldShowBg
              className={{
                wrapper: 'h-1.5 rounded-14',
                bar: 'h-full rounded-14',
              }}
            />
          </header>

          <div className="flex flex-col gap-4 p-3">
            {isPending && (
              <p className="text-text-tertiary typo-caption1">
                Loading quests...
              </p>
            )}

            {isError && !data && (
              <p className="text-text-tertiary typo-caption1">
                Quests are unavailable right now.
              </p>
            )}

            {!isPending && data && (
              <>
                <QuestSection
                  title="Daily quests"
                  bucket={data.daily}
                  claimingQuestId={claimingQuestId}
                  onClaim={(userQuestId) => claimQuestReward({ userQuestId })}
                />
                <QuestSection
                  title="Weekly quests"
                  bucket={data.weekly}
                  claimingQuestId={claimingQuestId}
                  onClaim={(userQuestId) => claimQuestReward({ userQuestId })}
                />
              </>
            )}
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default QuestButton;
