import classNames from 'classnames';
import type { CSSProperties, ReactElement } from 'react';
import React, {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { Bubble } from '../tooltips/utils';
import { IconSize } from '../Icon';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '../dropdown/DropdownMenu';
import { CoreIcon, LockIcon, ReputationIcon, TourIcon } from '../icons';
import type {
  QuestLevel,
  QuestReward,
  QuestType,
  UserQuest,
} from '../../graphql/quests';
import {
  QuestRewardType,
  QuestStatus,
  QUEST_ROTATION_UPDATE_SUBSCRIPTION,
  QUEST_UPDATE_SUBSCRIPTION,
} from '../../graphql/quests';
import { useClaimQuestReward } from '../../hooks/useClaimQuestReward';
import { useQuestDashboard } from '../../hooks/useQuestDashboard';
import { useAuthContext } from '../../contexts/AuthContext';
import { useLogContext } from '../../contexts/LogContext';
import { useSettingsContext } from '../../contexts/SettingsContext';
import { generateQueryKey, RequestKey } from '../../lib/query';
import useSubscription from '../../hooks/useSubscription';
import { ProgressBar } from '../fields/ProgressBar';
import { UpgradeToPlus } from '../UpgradeToPlus';
import { LogEvent, TargetId, TargetType } from '../../lib/log';
import { RootPortal } from '../tooltips/Portal';
import { QUEST_REWARD_COUNTER_EVENT } from '../../lib/questRewardAnimation';
import type { QuestRewardCounterEventDetail } from '../../lib/questRewardAnimation';

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

  return Math.min(100, (level.xpInLevel / totalForLevel) * 100);
};

const QUEST_LEVEL_PROGRESS_SIZE = 40;
const QUEST_LEVEL_PROGRESS_STROKE = 4;
const QUEST_REWARD_FLY_DURATION_MS = 1850;
const QUEST_REWARD_HIT_PROGRESS = 0.86;
const QUEST_REWARD_FLIGHT_STAGGER_MS = 180;
const QUEST_REWARD_SOURCE_LIFT_PX = 34;
const QUEST_LEVEL_FIREWORK_PARTICLE_COUNT = 18;
const QUEST_LEVEL_FIREWORK_BURST_DELAY_MS = 120;
const QUEST_LEVEL_FIREWORK_PARTICLE_DURATION_MS = 780;
const QUEST_LEVEL_FIREWORK_PRIMARY_BURST_RADIUS = 48;
const QUEST_LEVEL_FIREWORK_SECONDARY_BURST_RADIUS = 38;
const QUEST_LEVEL_FIREWORK_DISTANCE_VARIATION_STEPS = 5;
const QUEST_LEVEL_FIREWORK_DISTANCE_STEP_PX = 4;
const QUEST_LEVEL_FIREWORK_BURST_DISTANCE_OFFSET_PX = 3;
const QUEST_LEVEL_PROGRESS_SPIKE_SETTLE_MS = 90;
const QUEST_CLAIMED_STAMP_REVEAL_DELAY_MS = 220;
const QUEST_REWARD_LAYER_Z_INDEX = 2147483647;

type ClaimedStampMaskHole = {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
};

const buildClaimedStampMaskHoles = (): ClaimedStampMaskHole[] => {
  const holes: ClaimedStampMaskHole[] = [];

  // Small chips around top and bottom edges.
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

  // Smaller vertical chips near left and right edges.
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

  // Fine interior speckle to make the print feel worn.
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

const getQuestRewardHitAt = (delayMs: number): number =>
  delayMs +
  Math.round(QUEST_REWARD_FLY_DURATION_MS * QUEST_REWARD_HIT_PROGRESS);

type QuestRewardSource = {
  id: string;
  type: QuestRewardType;
  amount: number;
  x: number;
  y: number;
};

type QuestRewardFlight = QuestRewardSource & {
  dx: number;
  dy: number;
  delayMs: number;
};

type QuestLevelFireworkParticle = {
  id: string;
  x: number;
  y: number;
  dx: number;
  dy: number;
  delayMs: number;
  durationMs: number;
  hue: number;
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

const getVisibleRewards = (
  rewards: QuestReward[],
  showLevelSystem: boolean,
): QuestReward[] =>
  rewards.filter(
    (reward) => showLevelSystem || reward.type !== QuestRewardType.Xp,
  );

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

const QuestItem = ({
  quest,
  onClaim,
  showLevelSystem,
  isClaiming,
  isClaimAnimating,
  showClaimedStamp,
}: {
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
}): ReactElement => {
  const { value, percentage, target } = getProgress(
    quest.progress,
    quest.quest.targetCount,
  );
  const rewardRefs = useRef<Record<string, HTMLSpanElement | null>>({});
  const claimedStampMaskId = `quest-claimed-stamp-mask-${useId().replace(
    /[^a-zA-Z0-9_-]/g,
    '',
  )}`;
  const isClaimed = quest.status === QuestStatus.Claimed || showClaimedStamp;
  const isVisuallyDisabled =
    quest.locked || isClaiming || isClaimAnimating || isClaimed;
  const canClaim =
    quest.claimable && !!quest.userQuestId && !isClaimAnimating && !isClaimed;
  const visibleRewards = getVisibleRewards(quest.rewards, showLevelSystem);
  const disabledContentClass = classNames(
    'flex flex-col gap-2 transition-[opacity,filter] duration-200',
    isVisuallyDisabled && 'opacity-50 grayscale',
  );

  return (
    <article className="relative overflow-hidden rounded-12 border border-border-subtlest-tertiary p-2">
      <div className="flex flex-col gap-2">
        <div className={disabledContentClass}>
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

      {showClaimedStamp && (
        <div className="z-10 pointer-events-none absolute inset-0 overflow-hidden">
          <svg
            className="quest-claimed-stamp absolute left-1/2 top-1/2 w-[13.25rem] -translate-x-1/2 -translate-y-1/2 -rotate-[12deg] text-accent-avocado-default"
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

const QuestSection = ({
  title,
  quests,
  onClaim,
  showLevelSystem,
  claimingQuestId,
  animatingClaimRotationId,
  claimedStampRotationIds,
  emptyLabel = 'No active quests yet.',
}: {
  title: string;
  quests: UserQuest[];
  onClaim: (
    userQuestId: string,
    questId: string,
    questType: QuestType,
    rewardSources: QuestRewardSource[],
    claimRotationId: string,
  ) => void;
  showLevelSystem: boolean;
  claimingQuestId?: string;
  animatingClaimRotationId?: string;
  claimedStampRotationIds: Set<string>;
  emptyLabel?: string;
}): ReactElement => {
  if (!quests.length) {
    return (
      <section className="flex flex-col gap-2">
        <h4 className="font-bold text-text-primary typo-callout">{title}</h4>
        <p className="text-text-tertiary typo-caption1">{emptyLabel}</p>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-2">
      <h4 className="font-bold text-text-primary typo-callout">{title}</h4>

      {quests.map((quest) => (
        <QuestItem
          key={quest.rotationId}
          quest={quest}
          onClaim={onClaim}
          showLevelSystem={showLevelSystem}
          isClaiming={claimingQuestId === quest.userQuestId}
          isClaimAnimating={animatingClaimRotationId === quest.rotationId}
          showClaimedStamp={claimedStampRotationIds.has(quest.rotationId)}
        />
      ))}
    </section>
  );
};

const getQuestRewardAnimationIcon = (
  rewardType: QuestRewardType,
): ReactElement => {
  switch (rewardType) {
    case QuestRewardType.Cores:
      return (
        <CoreIcon
          size={IconSize.Large}
          className="text-accent-cheese-default drop-shadow-[0_2px_6px_rgb(0_0_0_/_0.45)]"
        />
      );
    case QuestRewardType.Reputation:
      return (
        <ReputationIcon
          size={IconSize.Large}
          className="text-accent-onion-default drop-shadow-[0_2px_6px_rgb(0_0_0_/_0.45)]"
        />
      );
    case QuestRewardType.Xp:
    default:
      return (
        <span className="inline-flex min-w-[1.5rem] items-center justify-center text-lg font-black lowercase leading-none !text-accent-avocado-default [text-shadow:0_2px_6px_rgb(0_0_0_/_0.55)]">
          xp
        </span>
      );
  }
};

const getQuestRewardFlightCount = (
  rewardType: QuestRewardType,
  amount: number,
): number => {
  const normalizedAmount = Math.max(1, Math.round(amount));
  const maxParticles = rewardType === QuestRewardType.Xp ? 5 : 4;

  return Math.min(normalizedAmount, maxParticles);
};

const buildQuestRewardFlights = (
  rewardSources: QuestRewardSource[],
): QuestRewardFlight[] => {
  if (typeof document === 'undefined') {
    return [];
  }

  const startedAt = Date.now();

  return rewardSources.flatMap((source) => {
    const target = document.querySelector<HTMLElement>(
      `[data-reward-target="${source.type}"]`,
    );

    if (!target) {
      return [];
    }

    const targetRect = target.getBoundingClientRect();
    const targetX = targetRect.left + targetRect.width / 2;
    const targetY = targetRect.top + targetRect.height / 2;
    const particleCount = getQuestRewardFlightCount(source.type, source.amount);
    const horizontalSpread =
      Math.min(0.75, 0.1875 + particleCount * 0.0625) * 16;

    return Array.from({ length: particleCount }, (_, index) => {
      const normalizedPosition =
        particleCount > 1 ? index / (particleCount - 1) : 0.5;
      const offsetX = (normalizedPosition - 0.5) * 2 * horizontalSpread;
      const originX = source.x + offsetX + (index % 2 === 0 ? 2 : -2);
      const originY = source.y - QUEST_REWARD_SOURCE_LIFT_PX;
      const delayMs = index * QUEST_REWARD_FLIGHT_STAGGER_MS;

      return {
        ...source,
        id: `${source.id}-${index.toString()}-${startedAt.toString()}`,
        x: originX,
        y: originY,
        dx: targetX - originX,
        dy: targetY - originY,
        delayMs,
      };
    });
  });
};

const buildQuestLevelFireworkParticles = (): QuestLevelFireworkParticle[] => {
  if (typeof document === 'undefined') {
    return [];
  }

  const target = document.querySelector<HTMLElement>(
    `[data-reward-target="${QuestRewardType.Xp}"]`,
  );

  if (!target) {
    return [];
  }

  const targetRect = target.getBoundingClientRect();
  const centerX = targetRect.left + targetRect.width / 2;
  const centerY = targetRect.top + targetRect.height / 2;
  const startedAt = Date.now();
  const bursts = [
    {
      count: QUEST_LEVEL_FIREWORK_PARTICLE_COUNT,
      delayMs: 0,
      radius: QUEST_LEVEL_FIREWORK_PRIMARY_BURST_RADIUS,
    },
    {
      count: Math.round(QUEST_LEVEL_FIREWORK_PARTICLE_COUNT * 0.67),
      delayMs: QUEST_LEVEL_FIREWORK_BURST_DELAY_MS,
      radius: QUEST_LEVEL_FIREWORK_SECONDARY_BURST_RADIUS,
    },
  ];

  return bursts.flatMap((burst, burstIndex) =>
    Array.from({ length: burst.count }, (_, index) => {
      const angleOffset = burstIndex === 0 ? 0 : Math.PI / burst.count;
      const angle = (Math.PI * 2 * index) / burst.count + angleOffset;
      const distance =
        burst.radius +
        (index % QUEST_LEVEL_FIREWORK_DISTANCE_VARIATION_STEPS) *
          QUEST_LEVEL_FIREWORK_DISTANCE_STEP_PX +
        burstIndex * QUEST_LEVEL_FIREWORK_BURST_DISTANCE_OFFSET_PX;

      return {
        id: `quest-level-firework-${startedAt.toString()}-${burstIndex.toString()}-${index.toString()}`,
        x: centerX,
        y: centerY,
        dx: Math.cos(angle) * distance,
        dy: Math.sin(angle) * distance,
        delayMs: burst.delayMs + index * 12,
        durationMs:
          QUEST_LEVEL_FIREWORK_PARTICLE_DURATION_MS + (index % 4) * 70,
        hue: 24 + ((index * 17 + burstIndex * 29) % 122),
      };
    }),
  );
};

const getQuestRewardCounterHitSchedule = ({
  flights,
  totalAmount,
}: {
  flights: QuestRewardFlight[];
  totalAmount: number;
}): Array<{ hitAt: number; delta: number }> => {
  if (!flights.length || totalAmount <= 0) {
    return [];
  }

  const sortedFlights = [...flights].sort((a, b) => a.delayMs - b.delayMs);
  const baseDelta = Math.floor(totalAmount / sortedFlights.length);
  let remainder = totalAmount % sortedFlights.length;

  return sortedFlights.map((flight) => {
    const hitAt = getQuestRewardHitAt(flight.delayMs);
    const delta = baseDelta + (remainder > 0 ? 1 : 0);

    if (remainder > 0) {
      remainder -= 1;
    }

    return { hitAt, delta };
  });
};

const QuestRewardFlightLayer = ({
  flights,
  onDone,
}: {
  flights: QuestRewardFlight[];
  onDone: () => void;
}): ReactElement | null => {
  useEffect(() => {
    if (!flights.length) {
      return undefined;
    }

    const latestDelay = flights.reduce(
      (maxDelay, flight) => Math.max(maxDelay, flight.delayMs),
      0,
    );
    const timeout = window.setTimeout(
      onDone,
      latestDelay + QUEST_REWARD_FLY_DURATION_MS + 120,
    );

    return () => window.clearTimeout(timeout);
  }, [flights, onDone]);

  if (!flights.length) {
    return null;
  }

  return (
    <RootPortal>
      <div
        className="pointer-events-none fixed inset-0"
        style={{ zIndex: QUEST_REWARD_LAYER_Z_INDEX }}
      >
        {flights.map((flight) => {
          const style = {
            left: `${flight.x}px`,
            top: `${flight.y}px`,
            '--quest-reward-fly-x': `${flight.dx}px`,
            '--quest-reward-fly-y': `${flight.dy}px`,
          } as CSSProperties;

          return (
            <span
              key={flight.id}
              className="quest-reward-flight absolute inline-flex items-center justify-center text-text-primary"
              style={{
                ...style,
                animationDelay: `${flight.delayMs}ms`,
              }}
            >
              {getQuestRewardAnimationIcon(flight.type)}
            </span>
          );
        })}
      </div>
    </RootPortal>
  );
};

const QuestLevelFireworkLayer = ({
  particles,
  onDone,
}: {
  particles: QuestLevelFireworkParticle[];
  onDone: () => void;
}): ReactElement | null => {
  useEffect(() => {
    if (!particles.length) {
      return undefined;
    }

    const latestEnd = particles.reduce(
      (maxEnd, particle) =>
        Math.max(maxEnd, particle.delayMs + particle.durationMs),
      0,
    );
    const timeout = window.setTimeout(onDone, latestEnd + 120);

    return () => window.clearTimeout(timeout);
  }, [onDone, particles]);

  if (!particles.length) {
    return null;
  }

  return (
    <RootPortal>
      <div
        className="pointer-events-none fixed inset-0"
        style={{ zIndex: QUEST_REWARD_LAYER_Z_INDEX }}
      >
        {particles.map((particle) => {
          const style = {
            left: `${particle.x}px`,
            top: `${particle.y}px`,
            color: `hsl(${particle.hue} 95% 62%)`,
            '--quest-level-firework-x': `${particle.dx}px`,
            '--quest-level-firework-y': `${particle.dy}px`,
          } as CSSProperties;

          return (
            <span
              key={particle.id}
              className="quest-level-firework-particle absolute"
              style={{
                ...style,
                animationDelay: `${particle.delayMs}ms`,
                animationDuration: `${particle.durationMs}ms`,
              }}
            />
          );
        })}
      </div>
    </RootPortal>
  );
};

interface QuestButtonProps {
  compact?: boolean;
}

interface QuestDropdownPanelProps {
  showLevelSystem: boolean;
  renderedLevel: number;
  data?: ReturnType<typeof useQuestDashboard>['data'];
  isPending: boolean;
  isError: boolean;
  claimingQuestId?: string;
  animatingClaimRotationId?: string;
  claimedStampRotationIds: Set<string>;
  onClaim: (
    userQuestId: string,
    questId: string,
    questType: QuestType,
    rewardSources: QuestRewardSource[],
    claimRotationId: string,
  ) => void;
}

const QuestDropdownPanel = ({
  showLevelSystem,
  renderedLevel,
  data,
  isPending,
  isError,
  claimingQuestId,
  animatingClaimRotationId,
  claimedStampRotationIds,
  onClaim,
}: QuestDropdownPanelProps): ReactElement => {
  const { logEvent } = useLogContext();

  useEffect(() => {
    logEvent({
      event_name: LogEvent.Impression,
      target_type: TargetType.Quest,
    });
  }, [logEvent]);

  return (
    <div className="flex flex-col">
      <header className="flex flex-col gap-2 border-b border-border-subtlest-tertiary p-3">
        <p className="font-bold text-text-primary typo-callout">Quests</p>
        {showLevelSystem && (
          <div className="flex items-center justify-between gap-2 text-text-tertiary typo-caption1">
            <span>Level {renderedLevel}</span>
            {data?.level && (
              <span>
                {data.level.xpInLevel}/
                {data.level.xpInLevel + data.level.xpToNextLevel} XP
              </span>
            )}
          </div>
        )}
      </header>

      <div className="flex flex-col gap-4 p-3">
        {isPending && (
          <p className="text-text-tertiary typo-caption1">Loading quests...</p>
        )}

        {isError && !data && (
          <p className="text-text-tertiary typo-caption1">
            Quests are unavailable right now.
          </p>
        )}

        {!isPending && data && (
          <>
            <QuestSection
              title="Daily"
              quests={data.daily.regular}
              showLevelSystem={showLevelSystem}
              claimingQuestId={claimingQuestId}
              animatingClaimRotationId={animatingClaimRotationId}
              claimedStampRotationIds={claimedStampRotationIds}
              onClaim={onClaim}
            />
            <QuestSection
              title="Weekly"
              quests={data.weekly.regular}
              showLevelSystem={showLevelSystem}
              claimingQuestId={claimingQuestId}
              animatingClaimRotationId={animatingClaimRotationId}
              claimedStampRotationIds={claimedStampRotationIds}
              onClaim={onClaim}
            />
            {(data.daily.plus.length > 0 || data.weekly.plus.length > 0) && (
              <section className="flex flex-col gap-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-action-plus-default typo-caption1">
                    Plus quests
                  </p>
                  <UpgradeToPlus
                    target={TargetId.Popover}
                    size={ButtonSize.Small}
                    className="!flex-none"
                  />
                </div>
                <QuestSection
                  title="Daily"
                  quests={data.daily.plus}
                  showLevelSystem={showLevelSystem}
                  claimingQuestId={claimingQuestId}
                  animatingClaimRotationId={animatingClaimRotationId}
                  claimedStampRotationIds={claimedStampRotationIds}
                  onClaim={onClaim}
                  emptyLabel="No active plus quests yet."
                />
                <QuestSection
                  title="Weekly"
                  quests={data.weekly.plus}
                  showLevelSystem={showLevelSystem}
                  claimingQuestId={claimingQuestId}
                  animatingClaimRotationId={animatingClaimRotationId}
                  claimedStampRotationIds={claimedStampRotationIds}
                  onClaim={onClaim}
                  emptyLabel="No active plus quests yet."
                />
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export const QuestButton = ({
  compact = false,
}: QuestButtonProps): ReactElement => {
  const { optOutLevelSystem } = useSettingsContext();
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
  const invalidateQuestDashboard = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: questDashboardQueryKey,
      exact: true,
    });
  }, [queryClient, questDashboardQueryKey]);

  useSubscription(
    () => ({
      query: QUEST_UPDATE_SUBSCRIPTION,
    }),
    {
      next: invalidateQuestDashboard,
    },
    [user?.id],
  );

  useSubscription(
    () => ({
      query: QUEST_ROTATION_UPDATE_SUBSCRIPTION,
    }),
    {
      next: invalidateQuestDashboard,
    },
    [user?.id],
  );

  const level = data?.level?.level ?? 1;
  const levelProgress = data?.level ? getLevelProgress(data.level) : 0;
  const showLevelSystem = !optOutLevelSystem;
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
  const [rewardFlights, setRewardFlights] = useState<QuestRewardFlight[]>([]);
  const [levelFireworkParticles, setLevelFireworkParticles] = useState<
    QuestLevelFireworkParticle[]
  >([]);
  const [animatedLevel, setAnimatedLevel] = useState<number | null>(null);
  const [animatedLevelProgress, setAnimatedLevelProgress] = useState<
    number | null
  >(null);
  const [animatingClaimRotationId, setAnimatingClaimRotationId] = useState<
    string | null
  >(null);
  const [claimedStampRotationIds, setClaimedStampRotationIds] = useState<
    string[]
  >([]);
  const progressTimersRef = useRef<number[]>([]);
  const claimedStampTimersRef = useRef<number[]>([]);
  const claimProgressSnapshotRef = useRef<number | null>(null);
  const claimLevelSnapshotRef = useRef<number | null>(null);
  const claimAnimationRotationIdRef = useRef<string | null>(null);
  const renderedLevel = animatedLevel ?? level;
  const renderedLevelProgress = animatedLevelProgress ?? levelProgress;
  const triggerButtonSize = compact ? ButtonSize.Small : ButtonSize.Medium;
  const triggerButtonVariant = compact
    ? ButtonVariant.Tertiary
    : ButtonVariant.Float;
  const triggerVisualSize = compact ? 32 : QUEST_LEVEL_PROGRESS_SIZE;
  const triggerProgressStroke = compact ? 3 : QUEST_LEVEL_PROGRESS_STROKE;
  const triggerProgressRadius = (triggerVisualSize - triggerProgressStroke) / 2;
  const triggerProgressCircumference = 2 * Math.PI * triggerProgressRadius;
  const triggerVisualClassName = compact ? 'size-8' : 'size-10';
  const triggerLevelClassName = compact ? 'typo-caption2' : 'typo-caption1';
  const claimedStampRotationIdSet = useMemo(
    () => new Set(claimedStampRotationIds),
    [claimedStampRotationIds],
  );

  const clearProgressTimers = useCallback(() => {
    progressTimersRef.current.forEach((timerId) => {
      window.clearTimeout(timerId);
    });
    progressTimersRef.current = [];
  }, []);
  const clearClaimedStampTimers = useCallback(() => {
    claimedStampTimersRef.current.forEach((timerId) => {
      window.clearTimeout(timerId);
    });
    claimedStampTimersRef.current = [];
  }, []);
  const scheduleClaimedStampReveal = useCallback((claimRotationId: string) => {
    const timerId = window.setTimeout(() => {
      setClaimedStampRotationIds((current) => {
        if (current.includes(claimRotationId)) {
          return current;
        }

        return [...current, claimRotationId];
      });
      claimedStampTimersRef.current = claimedStampTimersRef.current.filter(
        (activeTimerId) => activeTimerId !== timerId,
      );
    }, QUEST_CLAIMED_STAMP_REVEAL_DELAY_MS);

    claimedStampTimersRef.current.push(timerId);
  }, []);
  const clearRewardFlights = useCallback(() => {
    const completedClaimRotationId = claimAnimationRotationIdRef.current;

    clearProgressTimers();
    setRewardFlights([]);
    setAnimatedLevel(null);
    setAnimatedLevelProgress(null);
    setAnimatingClaimRotationId(null);
    claimProgressSnapshotRef.current = null;
    claimLevelSnapshotRef.current = null;
    claimAnimationRotationIdRef.current = null;

    if (!completedClaimRotationId) {
      return;
    }

    scheduleClaimedStampReveal(completedClaimRotationId);
  }, [clearProgressTimers, scheduleClaimedStampReveal]);
  const clearLevelFireworkParticles = useCallback(() => {
    setLevelFireworkParticles([]);
  }, []);
  const emitRewardCounterEvent = useCallback(
    (event: QuestRewardCounterEventDetail) => {
      if (typeof window === 'undefined') {
        return;
      }

      window.dispatchEvent(
        new CustomEvent<QuestRewardCounterEventDetail>(
          QUEST_REWARD_COUNTER_EVENT,
          {
            detail: event,
          },
        ),
      );
    },
    [],
  );

  const scheduleLevelProgressByHits = useCallback(
    ({
      flights,
      finalProgress,
      startProgress,
      finalLevel,
      startLevel,
    }: {
      flights: QuestRewardFlight[];
      finalProgress: number;
      startProgress: number;
      finalLevel: number;
      startLevel: number;
    }) => {
      const xpFlights = flights
        .filter((flight) => flight.type === QuestRewardType.Xp)
        .sort((a, b) => a.delayMs - b.delayMs);

      if (!xpFlights.length) {
        setAnimatedLevel(null);
        setAnimatedLevelProgress(null);
        return;
      }

      clearProgressTimers();
      setAnimatedLevel(startLevel);
      setAnimatedLevelProgress(startProgress);

      const didLevelUp = finalLevel > startLevel;
      const didLevelWrap = didLevelUp || finalProgress < startProgress;
      const progressTarget = didLevelWrap ? 100 : finalProgress;
      const totalProgressDelta = Math.max(progressTarget - startProgress, 0);
      const progressPerHit =
        xpFlights.length > 0 ? totalProgressDelta / xpFlights.length : 0;
      const spikeAmount = Math.min(1.25, Math.max(0.35, progressPerHit * 0.45));
      const completeLevelAnimation = () => {
        setAnimatedLevelProgress(finalProgress);

        if (didLevelUp) {
          setAnimatedLevel(finalLevel);
          setLevelFireworkParticles(buildQuestLevelFireworkParticles());
        }
      };

      xpFlights.forEach((flight, index) => {
        const isLastHit = index === xpFlights.length - 1;
        const hitAt = getQuestRewardHitAt(flight.delayMs);
        const progressAtHit = Math.min(
          progressTarget,
          startProgress + progressPerHit * (index + 1),
        );
        const timerId = window.setTimeout(() => {
          setAnimatedLevelProgress(Math.min(100, progressAtHit + spikeAmount));

          const settleTimer = window.setTimeout(() => {
            if (isLastHit) {
              if (didLevelWrap) {
                const wrapTimer = window.setTimeout(completeLevelAnimation, 50);

                progressTimersRef.current.push(wrapTimer);
                return;
              }

              completeLevelAnimation();
              return;
            }

            setAnimatedLevelProgress(progressAtHit);
          }, QUEST_LEVEL_PROGRESS_SPIKE_SETTLE_MS);

          progressTimersRef.current.push(settleTimer);
        }, hitAt);

        progressTimersRef.current.push(timerId);
      });
    },
    [clearProgressTimers],
  );

  const scheduleRewardCounterByHits = useCallback(
    ({
      claimId,
      flights,
      rewardSources,
    }: {
      claimId: string;
      flights: QuestRewardFlight[];
      rewardSources: QuestRewardSource[];
    }) => {
      const rewardTypes = [QuestRewardType.Reputation, QuestRewardType.Cores];

      rewardTypes.forEach((rewardType) => {
        const typeFlights = flights.filter(
          (flight) => flight.type === rewardType,
        );

        if (!typeFlights.length) {
          return;
        }

        const totalAmount = rewardSources
          .filter((reward) => reward.type === rewardType)
          .reduce((sum, reward) => sum + reward.amount, 0);

        if (totalAmount <= 0) {
          return;
        }

        const hitSchedule = getQuestRewardCounterHitSchedule({
          flights: typeFlights,
          totalAmount,
        });

        const baseValue =
          rewardType === QuestRewardType.Cores
            ? user?.balance?.amount ?? 0
            : user?.reputation ?? 0;
        const latestHitAt = hitSchedule.reduce(
          (maxHitAt, hit) => Math.max(maxHitAt, hit.hitAt),
          0,
        );

        emitRewardCounterEvent({
          phase: 'start',
          rewardType,
          claimId,
          baseValue,
          clearAfterMs: latestHitAt + 1200,
        });

        hitSchedule.forEach(({ hitAt, delta }) => {
          const timerId = window.setTimeout(() => {
            emitRewardCounterEvent({
              phase: 'hit',
              rewardType,
              claimId,
              delta,
            });
          }, hitAt);

          progressTimersRef.current.push(timerId);
        });
      });
    },
    [emitRewardCounterEvent, user?.balance?.amount, user?.reputation],
  );

  const handleClaim = (
    userQuestId: string,
    questId: string,
    questType: QuestType,
    rewardSources: QuestRewardSource[],
    claimRotationId: string,
  ) => {
    const startProgress = animatedLevelProgress ?? levelProgress;
    const startLevel = animatedLevel ?? level;

    setAnimatingClaimRotationId(claimRotationId);
    claimAnimationRotationIdRef.current = claimRotationId;
    setClaimedStampRotationIds((current) =>
      current.filter((id) => id !== claimRotationId),
    );
    claimProgressSnapshotRef.current = startProgress;
    claimLevelSnapshotRef.current = startLevel;
    setAnimatedLevel(startLevel);
    setAnimatedLevelProgress(startProgress);

    claimQuestReward(
      { userQuestId, questId, questType },
      {
        onSuccess: (claimedDashboard) => {
          const claimId = `quest-claim-${Date.now().toString()}`;
          const nextFlights = buildQuestRewardFlights(rewardSources);

          if (!nextFlights.length) {
            setAnimatedLevel(null);
            setAnimatedLevelProgress(null);
            setAnimatingClaimRotationId(null);
            claimProgressSnapshotRef.current = null;
            claimLevelSnapshotRef.current = null;
            claimAnimationRotationIdRef.current = null;
            scheduleClaimedStampReveal(claimRotationId);
            return;
          }

          setRewardFlights(nextFlights);
          const initialProgress =
            claimProgressSnapshotRef.current ?? levelProgress;
          const initialLevel = claimLevelSnapshotRef.current ?? level;
          const finalProgress = getLevelProgress(claimedDashboard.level);
          const finalLevel = claimedDashboard.level.level;

          scheduleLevelProgressByHits({
            flights: nextFlights,
            finalProgress,
            startProgress: initialProgress,
            finalLevel,
            startLevel: initialLevel,
          });
          scheduleRewardCounterByHits({
            claimId,
            flights: nextFlights,
            rewardSources,
          });
          claimProgressSnapshotRef.current = null;
          claimLevelSnapshotRef.current = null;
        },
        onError: () => {
          claimProgressSnapshotRef.current = null;
          claimLevelSnapshotRef.current = null;
          claimAnimationRotationIdRef.current = null;
          clearProgressTimers();
          setAnimatedLevel(null);
          setAnimatedLevelProgress(null);
          setAnimatingClaimRotationId(null);
        },
      },
    );
  };

  useEffect(() => {
    return () => {
      clearProgressTimers();
      clearClaimedStampTimers();
    };
  }, [clearClaimedStampTimers, clearProgressTimers]);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          asChild
          tooltip={{
            content: 'Quests',
            side: 'bottom',
          }}
        >
          <Button
            variant={triggerButtonVariant}
            size={triggerButtonSize}
            className={classNames('relative !p-0', !compact && '!rounded-full')}
            aria-label={
              showLevelSystem
                ? `Quests, level ${renderedLevel}, ${Math.round(
                    renderedLevelProgress,
                  )}% progress`
                : 'Quests'
            }
          >
            {showLevelSystem ? (
              <span
                className={classNames(
                  'relative inline-flex items-center justify-center',
                  triggerVisualClassName,
                )}
              >
                <svg
                  width={triggerVisualSize}
                  height={triggerVisualSize}
                  viewBox={`0 0 ${triggerVisualSize} ${triggerVisualSize}`}
                  fill="none"
                  className="-rotate-90"
                  aria-hidden
                >
                  <circle
                    cx={triggerVisualSize / 2}
                    cy={triggerVisualSize / 2}
                    r={triggerProgressRadius}
                    strokeWidth={triggerProgressStroke}
                    className="stroke-border-subtlest-tertiary"
                  />
                  <circle
                    cx={triggerVisualSize / 2}
                    cy={triggerVisualSize / 2}
                    r={triggerProgressRadius}
                    strokeWidth={triggerProgressStroke}
                    strokeLinecap="round"
                    strokeDasharray={triggerProgressCircumference}
                    strokeDashoffset={
                      triggerProgressCircumference *
                      (1 - renderedLevelProgress / 100)
                    }
                    className="stroke-accent-cabbage-default transition-[stroke-dashoffset] duration-100 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
                  />
                </svg>
                <span
                  data-reward-target={QuestRewardType.Xp}
                  className={classNames(
                    'absolute font-bold text-text-primary',
                    triggerLevelClassName,
                  )}
                >
                  {renderedLevel}
                </span>
              </span>
            ) : (
              <span
                className={classNames(
                  'inline-flex items-center justify-center',
                  triggerVisualClassName,
                )}
              >
                <TourIcon size={compact ? IconSize.Small : IconSize.Large} />
              </span>
            )}
            {claimableCount > 0 && (
              <Bubble
                className={classNames(
                  compact
                    ? '-right-1 -top-1 px-0.5'
                    : '-right-1.5 -top-1.5 px-1',
                )}
              >
                {claimableCount}
              </Bubble>
            )}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          className="w-[min(22rem,calc(100vw-2rem))] !p-0"
          scrollableClassName="max-h-[var(--radix-dropdown-menu-content-available-height)]"
        >
          <QuestDropdownPanel
            showLevelSystem={showLevelSystem}
            renderedLevel={renderedLevel}
            data={data}
            isPending={isPending}
            isError={isError}
            claimingQuestId={claimingQuestId}
            animatingClaimRotationId={animatingClaimRotationId ?? undefined}
            claimedStampRotationIds={claimedStampRotationIdSet}
            onClaim={handleClaim}
          />
        </DropdownMenuContent>
      </DropdownMenu>
      {rewardFlights.length > 0 && (
        <QuestRewardFlightLayer
          flights={rewardFlights}
          onDone={clearRewardFlights}
        />
      )}
      {levelFireworkParticles.length > 0 && (
        <QuestLevelFireworkLayer
          particles={levelFireworkParticles}
          onDone={clearLevelFireworkParticles}
        />
      )}
    </>
  );
};

export default QuestButton;
