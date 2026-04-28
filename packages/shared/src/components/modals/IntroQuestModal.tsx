import type { ReactElement } from 'react';
import React from 'react';
import type { ModalProps } from './common/Modal';
import { Modal } from './common/Modal';
import { ModalClose } from './common/ModalClose';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { ProgressBar } from '../fields/ProgressBar';
import { ArrowIcon, CoreIcon, TourIcon } from '../icons';
import type { QuestReward, UserQuest } from '../../graphql/quests';
import { QuestRewardType, QuestStatus } from '../../graphql/quests';
import { useQuestDashboard } from '../../hooks/useQuestDashboard';

type IntroQuestStatus = 'complete' | 'active';

type IntroQuestDestination = {
  label: string;
  path: string;
};

const introDestinationByEventType: Record<string, IntroQuestDestination> = {
  notifications_enable: {
    label: 'Notifications',
    path: '/settings/notifications',
  },
  brief_generate: {
    label: 'Briefing',
    path: '/briefing/generate',
  },
  profile_complete: {
    label: 'Profile',
    path: '/settings/profile',
  },
};

const padStep = (index: number): string =>
  `Step ${(index + 1).toString().padStart(2, '0')}`;

const toIntroStatus = (status: QuestStatus): IntroQuestStatus =>
  status === QuestStatus.Completed || status === QuestStatus.Claimed
    ? 'complete'
    : 'active';

const getProgress = (progress: number, target: number) => {
  const safeTarget = Math.max(target, 1);
  const safeProgress = Math.max(progress, 0);

  return {
    value: Math.min(safeProgress, safeTarget),
    percentage: Math.min(100, Math.round((safeProgress / safeTarget) * 100)),
    target: safeTarget,
  };
};

const getStatusLabel = (status: IntroQuestStatus): string =>
  status === 'complete' ? 'Completed' : 'In progress';

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

const getRewardIcon = (reward: QuestReward): ReactElement => {
  switch (reward.type) {
    case QuestRewardType.Cores:
      return <CoreIcon className="text-accent-cheese-default" />;
    case QuestRewardType.Xp:
    default:
      return (
        <span className="inline-flex size-5 items-center justify-center text-[0.5625rem] font-bold lowercase leading-none !text-accent-avocado-default">
          xp
        </span>
      );
  }
};

const RewardChip = ({ reward }: { reward: QuestReward }): ReactElement => (
  <span className="inline-flex items-center gap-1 rounded-8 bg-surface-float px-2 py-1 typo-caption1">
    {getRewardIcon(reward)}+{reward.amount.toLocaleString()}{' '}
    {getRewardLabel(reward)}
  </span>
);

type QuestCardProps = {
  userQuest: UserQuest;
  index: number;
};

const QuestCard = ({ userQuest, index }: QuestCardProps): ReactElement => {
  const status = toIntroStatus(userQuest.status);
  const { value, percentage, target } = getProgress(
    userQuest.progress,
    userQuest.quest.targetCount,
  );
  const destination = introDestinationByEventType[userQuest.quest.eventType];

  return (
    <article className="relative overflow-hidden rounded-12 border border-border-subtlest-tertiary p-2">
      <div className="flex flex-col gap-2">
        <header className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="font-bold uppercase tracking-[0.12em] text-text-tertiary typo-caption2">
              {padStep(index)}
            </p>
            <div className="flex items-start gap-2">
              <p className="min-w-0 flex-1 truncate font-bold text-text-primary typo-footnote">
                {userQuest.quest.name}
              </p>
              {destination && status !== 'complete' && (
                <Button
                  type="button"
                  tag="a"
                  href={destination.path}
                  variant={ButtonVariant.Tertiary}
                  size={ButtonSize.Small}
                  className="!flex-none"
                  icon={<ArrowIcon className="rotate-90" />}
                  aria-label={`Go to ${destination.label}`}
                />
              )}
            </div>
            <p className="line-clamp-2 text-text-tertiary typo-caption1">
              {userQuest.quest.description}
            </p>
          </div>
        </header>

        <div className="flex items-center justify-between gap-2 text-text-tertiary typo-caption1">
          <span>
            {value}/{target}
          </span>
          <span>{getStatusLabel(status)}</span>
        </div>

        <ProgressBar
          percentage={percentage}
          shouldShowBg
          className={{
            wrapper: 'h-1.5 rounded-14',
            bar: 'h-full rounded-14',
            barColor: 'bg-accent-cabbage-default',
          }}
        />

        <div className="flex flex-wrap gap-1">
          {userQuest.rewards.map((reward, rewardIndex) => (
            <RewardChip
              key={`${userQuest.rotationId}-${
                reward.type
              }-${rewardIndex.toString()}`}
              reward={reward}
            />
          ))}
        </div>
      </div>
    </article>
  );
};

export const IntroQuestModal = ({
  onRequestClose,
  ...props
}: ModalProps): ReactElement => {
  const { data, isPending, isError } = useQuestDashboard();
  const introQuests = data?.intro ?? [];

  return (
    <Modal
      {...props}
      kind={Modal.Kind.FlexibleCenter}
      size={Modal.Size.Medium}
      onRequestClose={onRequestClose}
      isDrawerOnMobile
    >
      <ModalClose className="top-2" onClick={onRequestClose} />
      <Modal.Body className="gap-4 p-4 tablet:p-6">
        <div className="flex items-start gap-3 border-b border-border-subtlest-tertiary pb-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-12 bg-surface-float text-text-primary">
            <TourIcon />
          </div>
          <div className="min-w-0 flex-1 pr-8">
            <h1 className="font-bold text-text-primary typo-title3">
              Intro quests
            </h1>
            <p className="mt-1 text-text-tertiary typo-callout">
              Get the most out of daily.dev with these quick wins.
            </p>
          </div>
        </div>

        {isPending && (
          <p className="text-text-tertiary typo-callout">Loading quests...</p>
        )}
        {isError && (
          <p className="text-text-tertiary typo-callout">
            Intro quests are unavailable right now.
          </p>
        )}
        {!isPending && !isError && introQuests.length === 0 && (
          <p className="text-text-tertiary typo-callout">
            You&apos;re all caught up — no intro quests to show.
          </p>
        )}

        {introQuests.length > 0 && (
          <div className="flex flex-col gap-2">
            {introQuests.map((userQuest, index) => (
              <QuestCard
                key={userQuest.rotationId}
                userQuest={userQuest}
                index={index}
              />
            ))}
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default IntroQuestModal;
