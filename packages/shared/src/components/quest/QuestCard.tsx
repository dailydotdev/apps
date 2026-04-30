import classNames from 'classnames';
import type { ReactElement, ReactNode } from 'react';
import React, { useId, useRef } from 'react';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { ProgressBar } from '../fields/ProgressBar';
import { ArrowIcon, CoreIcon, LockIcon, ReputationIcon } from '../icons';
import { Tooltip } from '../tooltip/Tooltip';
import type { QuestReward, QuestType, UserQuest } from '../../graphql/quests';
import { QuestRewardType, QuestStatus } from '../../graphql/quests';
import type { QuestRewardSource } from './QuestRewardAnimations';

type ClaimedStampMaskHole = {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
};

export type QuestDestination = {
  label: string;
  path: string;
};

export const QUEST_CLAIMED_STAMP_REVEAL_DELAY_MS = 220;
export const QUEST_CLAIMED_STAMP_ANIMATION_MS = 340;

const buildClaimedStampMaskHoles = (): ClaimedStampMaskHole[] => {
  const holes: ClaimedStampMaskHole[] = [];

  for (let index = 0; index < 46; index += 1) {
    const tick = index + 1;
    const cx = 12 + ((tick * 37) % 336);
    const rx = 1 + ((tick * 13) % 5) * 0.38;
    const ry = 0.6 + ((tick * 19) % 4) * 0.28;
    const topY = 3.2 + ((tick * 11) % 7) * 0.52;
    const bottomY = 116.8 - ((tick * 17) % 7) * 0.52;
    const wobble = ((tick * 5) % 5) - 2;

    holes.push(
      { cx, cy: topY, rx, ry },
      { cx: cx + wobble, cy: bottomY, rx: rx * 0.92, ry: ry * 0.9 },
    );
  }

  for (let index = 0; index < 24; index += 1) {
    const tick = index + 1;
    const cy = 11 + ((tick * 29) % 98);
    const rx = 0.55 + ((tick * 5) % 3) * 0.23;
    const ry = 1 + ((tick * 7) % 4) * 0.45;
    const leftX = 3.2 + ((tick * 13) % 7) * 0.25;
    const rightX = 356.8 - ((tick * 17) % 7) * 0.25;
    const wobble = (((tick * 3) % 5) - 2) * 0.35;

    holes.push(
      { cx: leftX, cy, rx, ry },
      { cx: rightX, cy: cy + wobble, rx: rx * 0.95, ry: ry * 0.92 },
    );
  }

  for (let index = 0; index < 130; index += 1) {
    const tick = index + 1;
    holes.push({
      cx: 22 + ((tick * 43) % 316),
      cy: 23 + ((tick * 31) % 74),
      rx: 0.45 + ((tick * 11) % 5) * 0.2,
      ry: 0.45 + ((tick * 7) % 4) * 0.18,
    });
  }

  return holes;
};

const CLAIMED_STAMP_MASK_HOLES = buildClaimedStampMaskHoles();

const getProgress = (progress: number, target: number) => {
  const safeTarget = Math.max(target, 1);
  const safeProgress = Math.max(progress, 0);

  return {
    value: Math.min(safeProgress, safeTarget),
    percentage: Math.min(100, Math.round((safeProgress / safeTarget) * 100)),
    target: safeTarget,
  };
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

export const getVisibleQuestRewards = (
  rewards: QuestReward[],
  showLevelSystem: boolean,
): QuestReward[] =>
  rewards.filter(
    (reward) => showLevelSystem || reward.type !== QuestRewardType.Xp,
  );

export const getQuestStatusLabel = (quest: UserQuest): string => {
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

const QuestRewardChip = ({
  reward,
  rewardRef,
}: {
  reward: QuestReward;
  rewardRef?: (element: HTMLSpanElement | null) => void;
}): ReactElement => {
  return (
    <span
      ref={rewardRef}
      className="inline-flex items-center gap-1 rounded-8 bg-surface-float px-2 py-1 typo-caption1"
    >
      {getRewardIcon(reward)}+{reward.amount.toLocaleString()}{' '}
      {getRewardLabel(reward)}
    </span>
  );
};

export type QuestCardProps = {
  quest: UserQuest;
  onClaim: (
    userQuestId: string,
    questId: string,
    questType: QuestType,
    rewardSources: QuestRewardSource[],
    claimRotationId: string,
  ) => void;
  showLevelSystem: boolean;
  isClaiming: boolean;
  isClaimAnimating: boolean;
  showClaimedStamp: boolean;
  animateClaimedStamp: boolean;
  suppressPersistedClaimedStamp: boolean;
  destination?: QuestDestination | null;
  onDestinationClick?: (destination: QuestDestination) => void;
  eyebrow?: ReactNode;
  statusLabel?: string;
  showLockIcon?: boolean;
};

export const QuestCard = ({
  quest,
  onClaim,
  showLevelSystem,
  isClaiming,
  isClaimAnimating,
  showClaimedStamp,
  animateClaimedStamp,
  suppressPersistedClaimedStamp,
  destination,
  onDestinationClick,
  eyebrow,
  statusLabel,
  showLockIcon = true,
}: QuestCardProps): ReactElement => {
  const { value, percentage, target } = getProgress(
    quest.progress,
    quest.quest.targetCount,
  );
  const rewardRefs = useRef<Record<string, HTMLSpanElement | null>>({});
  const claimedStampMaskId = `quest-claimed-stamp-mask-${useId().replace(
    /[^a-zA-Z0-9_-]/g,
    '',
  )}`;
  const hasPersistedClaim =
    quest.status === QuestStatus.Claimed || Boolean(quest.claimedAt);
  const isClaimed = hasPersistedClaim || showClaimedStamp;
  const shouldShowClaimedStamp =
    showClaimedStamp ||
    (hasPersistedClaim && !isClaimAnimating && !suppressPersistedClaimedStamp);
  const shouldAnimateClaimedStamp =
    animateClaimedStamp && shouldShowClaimedStamp;
  const isVisuallyDisabled =
    quest.locked || isClaiming || isClaimAnimating || isClaimed;
  const canClaim =
    quest.claimable && !!quest.userQuestId && !isClaimAnimating && !isClaimed;
  const visibleRewards = getVisibleQuestRewards(quest.rewards, showLevelSystem);
  const shouldShowDestination =
    Boolean(destination) &&
    Boolean(onDestinationClick) &&
    !quest.claimable &&
    !isVisuallyDisabled;
  const disabledContentClass = classNames(
    'flex flex-col gap-2 transition-[opacity,filter] duration-200',
    isVisuallyDisabled && 'opacity-50 grayscale',
  );

  return (
    <article className="relative overflow-hidden rounded-12 border border-border-subtlest-tertiary p-2">
      <div className="flex flex-col gap-2">
        <div className={disabledContentClass}>
          <header className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              {eyebrow && (
                <p className="font-bold uppercase tracking-[0.12em] text-text-tertiary typo-caption2">
                  {eyebrow}
                </p>
              )}
              <div className="flex items-start gap-2">
                <p className="min-w-0 flex-1 truncate font-bold text-text-primary typo-footnote">
                  {quest.quest.name}
                </p>
                {shouldShowDestination && destination && onDestinationClick && (
                  <Tooltip content={`Go to ${destination.label}`}>
                    <Button
                      variant={ButtonVariant.Tertiary}
                      size={ButtonSize.Small}
                      className="!flex-none"
                      icon={<ArrowIcon className="rotate-90" />}
                      aria-label={`Go to ${destination.label}`}
                      onClick={() => onDestinationClick(destination)}
                    />
                  </Tooltip>
                )}
              </div>
              <p className="line-clamp-2 text-text-tertiary typo-caption1">
                {quest.quest.description}
              </p>
            </div>
            {showLockIcon && quest.locked && (
              <LockIcon className="shrink-0 text-text-tertiary" />
            )}
          </header>

          <div className="flex items-center justify-between gap-2 text-text-tertiary typo-caption1">
            <span>
              {value}/{target}
            </span>
            <span>{statusLabel ?? getQuestStatusLabel(quest)}</span>
          </div>
        </div>

        <div
          className={classNames(
            'transition-opacity duration-200',
            isVisuallyDisabled && 'opacity-50',
          )}
        >
          <ProgressBar
            percentage={percentage}
            shouldShowBg
            className={{
              wrapper: 'h-1.5 rounded-14',
              bar: 'h-full rounded-14',
              barColor: quest.locked
                ? 'bg-accent-cabbage-bolder'
                : 'bg-accent-cabbage-default',
            }}
          />
        </div>

        {(visibleRewards.length > 0 || canClaim) && (
          <div className={disabledContentClass}>
            {visibleRewards.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {visibleRewards.map((reward, index) => {
                  const rewardKey = `${reward.type}-${index.toString()}`;

                  return (
                    <QuestRewardChip
                      key={`${quest.rotationId}-${
                        reward.type
                      }-${index.toString()}`}
                      reward={reward}
                      rewardRef={(element) => {
                        rewardRefs.current[rewardKey] = element;
                      }}
                    />
                  );
                })}
              </div>
            )}

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

                  const rewardSources = visibleRewards.flatMap(
                    (reward, index) => {
                      const rewardKey = `${reward.type}-${index.toString()}`;
                      const rewardElement = rewardRefs.current[rewardKey];

                      if (!rewardElement) {
                        return [];
                      }

                      const rect = rewardElement.getBoundingClientRect();

                      return [
                        {
                          id: rewardKey,
                          type: reward.type,
                          amount: reward.amount,
                          x: rect.left + rect.width / 2,
                          y: rect.top + rect.height / 2,
                        },
                      ] satisfies QuestRewardSource[];
                    },
                  );

                  onClaim(
                    quest.userQuestId,
                    quest.quest.id,
                    quest.quest.type,
                    rewardSources,
                    quest.rotationId,
                  );
                }}
              >
                Claim
              </Button>
            )}
          </div>
        )}
      </div>

      {shouldShowClaimedStamp && (
        <div className="z-10 pointer-events-none absolute inset-0 overflow-hidden">
          <svg
            className={classNames(
              'absolute left-1/2 top-1/2 w-[13.25rem] -translate-x-1/2 -translate-y-1/2 -rotate-[12deg] text-accent-avocado-default',
              shouldAnimateClaimedStamp && 'quest-claimed-stamp',
            )}
            viewBox="0 0 360 120"
            aria-hidden
          >
            <defs>
              <mask
                id={claimedStampMaskId}
                x="0"
                y="0"
                width="360"
                height="120"
                maskUnits="userSpaceOnUse"
              >
                <rect x="0" y="0" width="360" height="120" fill="white" />
                {CLAIMED_STAMP_MASK_HOLES.map((hole, index) => (
                  <ellipse
                    key={`${claimedStampMaskId}-hole-${index.toString()}`}
                    cx={hole.cx}
                    cy={hole.cy}
                    rx={hole.rx}
                    ry={hole.ry}
                    fill="black"
                  />
                ))}
              </mask>
            </defs>
            <g mask={`url(#${claimedStampMaskId})`} fill="none">
              <rect
                x="8"
                y="8"
                width="344"
                height="104"
                rx="14"
                stroke="currentColor"
                strokeWidth="8"
              />
              <rect
                x="22"
                y="22"
                width="316"
                height="76"
                rx="10"
                stroke="currentColor"
                strokeWidth="3.5"
              />
              <text
                x="180"
                y="60"
                fill="currentColor"
                textAnchor="middle"
                dominantBaseline="middle"
                className="font-black uppercase"
                style={{ fontSize: '42px', letterSpacing: '0.22em' }}
              >
                CLAIMED
              </text>
            </g>
          </svg>
        </div>
      )}
    </article>
  );
};
