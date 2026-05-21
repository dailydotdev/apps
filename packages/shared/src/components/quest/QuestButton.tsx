import classNames from 'classnames';
import type { CSSProperties, ReactElement } from 'react';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useRouter } from 'next/router';
import { useQueryClient } from '@tanstack/react-query';
import { Popover, PopoverTrigger } from '@radix-ui/react-popover';
import {
  Button,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from '../buttons/Button';
import { Bubble } from '../tooltips/utils';
import { IconSize } from '../Icon';
import { DevPlusIcon, TourIcon } from '../icons';
import type {
  QuestDashboard,
  QuestLevel,
  QuestType,
  UserQuest,
} from '../../graphql/quests';
import {
  QuestRewardType,
  QUEST_ROTATION_UPDATE_SUBSCRIPTION,
  QUEST_UPDATE_SUBSCRIPTION,
} from '../../graphql/quests';
import { useClaimQuestReward } from '../../hooks/useClaimQuestReward';
import { useMarkQuestRotationsViewed } from '../../hooks/useMarkQuestRotationsViewed';
import { useQuestDashboard } from '../../hooks/useQuestDashboard';
import { usePlusSubscription } from '../../hooks/usePlusSubscription';
import { useAuthContext } from '../../contexts/AuthContext';
import { useLogContext } from '../../contexts/LogContext';
import { useSettingsContext } from '../../contexts/SettingsContext';
import { plusUrl, webappUrl } from '../../lib/constants';
import { agentsHighlightsPath } from '../../lib/links';
import { generateQueryKey, RequestKey } from '../../lib/query';
import useSubscription from '../../hooks/useSubscription';
import Link from '../utilities/Link';
import { AuthTriggers } from '../../lib/auth';
import { LogEvent, TargetId, TargetType } from '../../lib/log';
import { RootPortal } from '../tooltips/Portal';
import { QUEST_REWARD_COUNTER_EVENT } from '../../lib/questRewardAnimation';
import type { QuestRewardCounterEventDetail } from '../../lib/questRewardAnimation';
import { PopoverContent } from '../popover/Popover';
import { Tooltip } from '../tooltip/Tooltip';
import { useScrollFade } from '../../hooks/useScrollFade';
import {
  QuestCard,
  QUEST_CLAIMED_STAMP_ANIMATION_MS,
  QUEST_CLAIMED_STAMP_REVEAL_DELAY_MS,
  type QuestDestination,
} from './QuestCard';
import {
  QuestRewardFlightLayer,
  buildQuestRewardFlights,
  getQuestRewardHitAt,
  QUEST_REWARD_LAYER_Z_INDEX,
  type QuestRewardFlight,
  type QuestRewardSource,
} from './QuestRewardAnimations';

export type { QuestDestination } from './QuestCard';

const getLevelProgress = (level: QuestLevel) => {
  const totalForLevel = level.xpInLevel + level.xpToNextLevel;

  if (!totalForLevel) {
    return 0;
  }

  return Math.min(100, (level.xpInLevel / totalForLevel) * 100);
};

type ClaimableQuestSnapshot = {
  rotationId: string;
  questId: string;
  questType: QuestType;
  userQuestId: string | null;
  locked: boolean;
  claimable: boolean;
};

const getQuestClaimableSnapshots = (
  dashboard?: QuestDashboard,
): Map<string, ClaimableQuestSnapshot> => {
  const snapshots = new Map<string, ClaimableQuestSnapshot>();

  if (!dashboard) {
    return snapshots;
  }

  [
    ...dashboard.daily.regular,
    ...dashboard.daily.plus,
    ...dashboard.weekly.regular,
    ...dashboard.weekly.plus,
    ...dashboard.milestone,
  ].forEach((quest) => {
    snapshots.set(quest.rotationId, {
      rotationId: quest.rotationId,
      questId: quest.quest.id,
      questType: quest.quest.type,
      userQuestId: quest.userQuestId ?? null,
      locked: quest.locked,
      claimable: quest.claimable,
    });
  });

  return snapshots;
};

const QUEST_LEVEL_PROGRESS_SIZE = 40;
const QUEST_LEVEL_PROGRESS_STROKE = 4;
const QUEST_LEVEL_FIREWORK_PARTICLE_COUNT = 18;
const QUEST_LEVEL_FIREWORK_BURST_DELAY_MS = 120;
const QUEST_LEVEL_FIREWORK_PARTICLE_DURATION_MS = 780;
const QUEST_LEVEL_FIREWORK_PRIMARY_BURST_RADIUS = 48;
const QUEST_LEVEL_FIREWORK_SECONDARY_BURST_RADIUS = 38;
const QUEST_LEVEL_FIREWORK_DISTANCE_VARIATION_STEPS = 5;
const QUEST_LEVEL_FIREWORK_DISTANCE_STEP_PX = 4;
const QUEST_LEVEL_FIREWORK_BURST_DISTANCE_OFFSET_PX = 3;
const QUEST_LEVEL_PROGRESS_SPIKE_SETTLE_MS = 90;

type QuestRewardFlightLayerState = {
  claimRotationId: string;
  flights: QuestRewardFlight[];
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

const HOT_TAKES_MODAL_PATH = '/?openModal=hottakes';

const getQuestDestination = (
  quest: UserQuest['quest'],
): QuestDestination | null => {
  if (quest.eventType === 'post_share') {
    if (quest.description === 'Create a shared link post') {
      return { label: 'Create post', path: '/squads/create' };
    }

    return { label: 'Feed', path: '/' };
  }

  switch (quest.eventType) {
    case 'read_post':
    case 'post_upvote':
    case 'award_given':
    case 'share_post_click':
    case 'comment_upvote':
    case 'comment_create':
    case 'bookmark_post':
      return { label: 'Feed', path: '/' };
    case 'brief_read':
      return { label: 'Briefs', path: '/briefing' };
    case 'hot_take_vote':
    case 'hot_take_create':
      return { label: 'Hot takes', path: HOT_TAKES_MODAL_PATH };
    case 'user_follow':
      return { label: 'Leaderboards', path: '/users' };
    case 'view_user_profile':
      return { label: 'Profiles', path: '/users' };
    case 'visit_arena':
      return { label: 'Happening Now', path: agentsHighlightsPath };
    case 'visit_explore_page':
      return { label: 'Explore', path: '/posts' };
    case 'visit_discussions_page':
      return { label: 'Discuss', path: '/discussed' };
    case 'visit_read_it_later_page':
      return { label: 'Later', path: '/bookmarks/later' };
    case 'feedback_submit':
      return { label: 'Feedback', path: '/settings/feedback' };
    case 'squad_join':
      return { label: 'Squads', path: '/squads/discover' };
    default:
      return null;
  }
};

export const QuestSection = ({
  title,
  quests,
  onClaim,
  onDestinationClick,
  showLevelSystem,
  claimingQuestId,
  animatingClaimRotationIds,
  claimedStampRotationIds,
  animatingClaimedStampRotationIds,
  deferredClaimedStampRotationIds,
  emptyLabel = 'No active quests yet.',
  layout = 'stack',
  initialVisibleCount,
  showMoreLabel = 'Show more',
  showLessLabel = 'Show less',
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
  onDestinationClick: (destination: QuestDestination) => void;
  showLevelSystem: boolean;
  claimingQuestId?: string;
  animatingClaimRotationIds: Set<string>;
  claimedStampRotationIds: Set<string>;
  animatingClaimedStampRotationIds: Set<string>;
  deferredClaimedStampRotationIds: Set<string>;
  emptyLabel?: string;
  layout?: 'stack' | 'grid';
  initialVisibleCount?: number;
  showMoreLabel?: string;
  showLessLabel?: string;
}): ReactElement => {
  const [isExpanded, setIsExpanded] = useState(false);
  const canToggleExpanded =
    typeof initialVisibleCount === 'number' &&
    quests.length > initialVisibleCount;
  const visibleQuests =
    canToggleExpanded && !isExpanded
      ? quests.slice(0, initialVisibleCount)
      : quests;

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

      <div
        className={classNames(
          layout === 'grid'
            ? 'grid gap-4 tablet:grid-cols-2'
            : 'flex flex-col gap-2',
        )}
      >
        {visibleQuests.map((quest) => (
          <QuestCard
            key={quest.rotationId}
            quest={quest}
            onClaim={onClaim}
            destination={getQuestDestination(quest.quest)}
            onDestinationClick={onDestinationClick}
            showLevelSystem={showLevelSystem}
            isClaiming={claimingQuestId === quest.userQuestId}
            isClaimAnimating={animatingClaimRotationIds.has(quest.rotationId)}
            showClaimedStamp={claimedStampRotationIds.has(quest.rotationId)}
            animateClaimedStamp={animatingClaimedStampRotationIds.has(
              quest.rotationId,
            )}
            suppressPersistedClaimedStamp={deferredClaimedStampRotationIds.has(
              quest.rotationId,
            )}
          />
        ))}
      </div>

      {canToggleExpanded && (
        <Button
          variant={ButtonVariant.Tertiary}
          size={ButtonSize.Small}
          onClick={() => setIsExpanded((current) => !current)}
          className="w-fit"
          aria-expanded={isExpanded}
        >
          {isExpanded ? showLessLabel : showMoreLabel}
        </Button>
      )}
    </section>
  );
};

function QuestPlusUnlockButton(): ReactElement | null {
  const { isLoggedIn, showLogin } = useAuthContext();
  const { isPlus, logSubscriptionEvent } = usePlusSubscription();

  const onClick = useCallback(
    (e: React.MouseEvent) => {
      if (!isLoggedIn) {
        e.preventDefault();
        showLogin({ trigger: AuthTriggers.Plus });
        return;
      }

      logSubscriptionEvent({
        event_name: LogEvent.UpgradeSubscription,
        target_id: TargetId.QuestDropdown,
      });
    },
    [isLoggedIn, logSubscriptionEvent, showLogin],
  );

  if (isPlus) {
    return null;
  }

  return (
    <Link passHref href={plusUrl}>
      <Button
        tag="a"
        size={ButtonSize.Small}
        color={ButtonColor.Avocado}
        variant={ButtonVariant.Primary}
        className="!flex-none"
        onClick={onClick}
      >
        Unlock
      </Button>
    </Link>
  );
}

const PlusQuestSectionHeader = (): ReactElement => {
  const { isPlus } = usePlusSubscription();

  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <div
        aria-hidden
        className="flex w-full items-center gap-3"
        role="presentation"
      >
        <span className="h-px flex-1 bg-border-subtlest-tertiary" />
        <DevPlusIcon
          secondary
          size={IconSize.Medium}
          className="text-action-plus-default"
        />
        <span className="h-px flex-1 bg-border-subtlest-tertiary" />
      </div>
      {!isPlus && (
        <>
          <p className="max-w-72 text-text-secondary typo-callout">
            Plus users have two additional quest slots
          </p>
          <QuestPlusUnlockButton />
        </>
      )}
    </div>
  );
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
  panelOnly?: boolean;
}

interface QuestDropdownPanelProps {
  showLevelSystem: boolean;
  renderedLevel: number;
  data?: ReturnType<typeof useQuestDashboard>['data'];
  isPending: boolean;
  isError: boolean;
  claimingQuestId?: string;
  animatingClaimRotationIds: Set<string>;
  claimedStampRotationIds: Set<string>;
  animatingClaimedStampRotationIds: Set<string>;
  deferredClaimedStampRotationIds: Set<string>;
  onClaim: (
    userQuestId: string,
    questId: string,
    questType: QuestType,
    rewardSources: QuestRewardSource[],
    claimRotationId: string,
  ) => void;
  onDestinationClick: (destination: QuestDestination) => void;
}

const QuestDropdownPanel = ({
  showLevelSystem,
  renderedLevel,
  data,
  isPending,
  isError,
  claimingQuestId,
  animatingClaimRotationIds,
  claimedStampRotationIds,
  animatingClaimedStampRotationIds,
  deferredClaimedStampRotationIds,
  onClaim,
  onDestinationClick,
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
              onDestinationClick={onDestinationClick}
              claimingQuestId={claimingQuestId}
              animatingClaimRotationIds={animatingClaimRotationIds}
              claimedStampRotationIds={claimedStampRotationIds}
              animatingClaimedStampRotationIds={
                animatingClaimedStampRotationIds
              }
              deferredClaimedStampRotationIds={deferredClaimedStampRotationIds}
              onClaim={onClaim}
            />
            <QuestSection
              title="Weekly"
              quests={data.weekly.regular}
              showLevelSystem={showLevelSystem}
              onDestinationClick={onDestinationClick}
              claimingQuestId={claimingQuestId}
              animatingClaimRotationIds={animatingClaimRotationIds}
              claimedStampRotationIds={claimedStampRotationIds}
              animatingClaimedStampRotationIds={
                animatingClaimedStampRotationIds
              }
              deferredClaimedStampRotationIds={deferredClaimedStampRotationIds}
              onClaim={onClaim}
            />
            {(data.daily.plus.length > 0 || data.weekly.plus.length > 0) && (
              <section className="flex flex-col gap-4">
                <PlusQuestSectionHeader />
                <QuestSection
                  title="Daily"
                  quests={data.daily.plus}
                  showLevelSystem={showLevelSystem}
                  onDestinationClick={onDestinationClick}
                  claimingQuestId={claimingQuestId}
                  animatingClaimRotationIds={animatingClaimRotationIds}
                  claimedStampRotationIds={claimedStampRotationIds}
                  animatingClaimedStampRotationIds={
                    animatingClaimedStampRotationIds
                  }
                  deferredClaimedStampRotationIds={
                    deferredClaimedStampRotationIds
                  }
                  onClaim={onClaim}
                  emptyLabel="No active plus quests yet."
                />
                <QuestSection
                  title="Weekly"
                  quests={data.weekly.plus}
                  showLevelSystem={showLevelSystem}
                  onDestinationClick={onDestinationClick}
                  claimingQuestId={claimingQuestId}
                  animatingClaimRotationIds={animatingClaimRotationIds}
                  claimedStampRotationIds={claimedStampRotationIds}
                  animatingClaimedStampRotationIds={
                    animatingClaimedStampRotationIds
                  }
                  deferredClaimedStampRotationIds={
                    deferredClaimedStampRotationIds
                  }
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
  panelOnly = false,
}: QuestButtonProps): ReactElement => {
  const router = useRouter();
  const { optOutLevelSystem } = useSettingsContext();
  const queryClient = useQueryClient();
  const { user } = useAuthContext();
  const { logEvent } = useLogContext();
  const { data, isPending, isError, dataUpdatedAt } = useQuestDashboard();
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
  const shouldLogClaimableQuestRef = useRef(false);
  const previousClaimableQuestSnapshotsRef = useRef<Map<
    string,
    ClaimableQuestSnapshot
  > | null>(null);
  const previousQuestDashboardUpdatedAtRef = useRef<number | null>(null);
  const handleQuestDashboardRefresh = useCallback(() => {
    shouldLogClaimableQuestRef.current = true;
    invalidateQuestDashboard();
  }, [invalidateQuestDashboard]);

  useSubscription(
    () => ({
      query: QUEST_UPDATE_SUBSCRIPTION,
    }),
    {
      next: handleQuestDashboardRefresh,
    },
    [user?.id],
  );

  useSubscription(
    () => ({
      query: QUEST_ROTATION_UPDATE_SUBSCRIPTION,
    }),
    {
      next: handleQuestDashboardRefresh,
    },
    [user?.id],
  );

  useEffect(() => {
    if (!data) {
      return;
    }

    const currentClaimableQuestSnapshots = getQuestClaimableSnapshots(data);
    const currentQuestDashboardUpdatedAt = dataUpdatedAt;
    const didReceiveFreshQuestDashboard =
      previousQuestDashboardUpdatedAtRef.current !==
      currentQuestDashboardUpdatedAt;

    if (
      shouldLogClaimableQuestRef.current &&
      didReceiveFreshQuestDashboard &&
      previousClaimableQuestSnapshotsRef.current
    ) {
      currentClaimableQuestSnapshots.forEach((quest) => {
        const previousQuest = previousClaimableQuestSnapshotsRef.current?.get(
          quest.rotationId,
        );

        if (!quest.locked && !previousQuest?.claimable && quest.claimable) {
          logEvent({
            event_name: LogEvent.QuestClaimable,
            target_id: quest.questId,
            target_type: TargetType.Quest,
            extra: JSON.stringify({
              questType: quest.questType,
              userQuestId: quest.userQuestId,
              userId: user?.id,
              rotationId: quest.rotationId,
            }),
          });
        }
      });

      shouldLogClaimableQuestRef.current = false;
    }

    previousClaimableQuestSnapshotsRef.current = currentClaimableQuestSnapshots;
    previousQuestDashboardUpdatedAtRef.current = currentQuestDashboardUpdatedAt;
  }, [data, dataUpdatedAt, logEvent, user?.id]);

  const level = data?.level?.level ?? 1;
  const levelProgress = data?.level ? getLevelProgress(data.level) : 0;
  const showLevelSystem = !optOutLevelSystem;
  const { mutate: markQuestRotationsViewed } = useMarkQuestRotationsViewed();
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
  const [rewardFlightLayers, setRewardFlightLayers] = useState<
    QuestRewardFlightLayerState[]
  >([]);
  const [levelFireworkParticles, setLevelFireworkParticles] = useState<
    QuestLevelFireworkParticle[]
  >([]);
  const [animatedLevel, setAnimatedLevel] = useState<number | null>(null);
  const [animatedLevelProgress, setAnimatedLevelProgress] = useState<
    number | null
  >(null);
  const [animatingClaimRotationIds, setAnimatingClaimRotationIds] = useState<
    string[]
  >([]);
  const [claimedStampRotationIds, setClaimedStampRotationIds] = useState<
    string[]
  >([]);
  const [
    animatingClaimedStampRotationIds,
    setAnimatingClaimedStampRotationIds,
  ] = useState<string[]>([]);
  const [deferredClaimedStampRotationIds, setDeferredClaimedStampRotationIds] =
    useState<string[]>([]);
  const progressTimersRef = useRef<number[]>([]);
  const claimedStampTimersRef = useRef<number[]>([]);
  const currentProgressAnimationRotationIdRef = useRef<string | null>(null);
  const renderedLevel = animatedLevel ?? level;
  const renderedLevelProgress = animatedLevelProgress ?? levelProgress;
  const triggerTooltipContent = data?.level
    ? `Total XP: ${data.level.totalXp.toLocaleString('de-DE')}`
    : 'Quests';
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
  const [isOpen, setIsOpen] = useState(false);
  const isAccountOlderThan24Hours =
    !!user?.createdAt &&
    Date.now() - new Date(user.createdAt).getTime() > 24 * 60 * 60 * 1000;
  const hasNewQuestRotations =
    (data?.hasNewQuestRotations ?? false) && isAccountOlderThan24Hours;
  const claimedStampRotationIdSet = useMemo(
    () => new Set(claimedStampRotationIds),
    [claimedStampRotationIds],
  );
  const animatingClaimRotationIdSet = useMemo(
    () => new Set(animatingClaimRotationIds),
    [animatingClaimRotationIds],
  );
  const animatingClaimedStampRotationIdSet = useMemo(
    () => new Set(animatingClaimedStampRotationIds),
    [animatingClaimedStampRotationIds],
  );
  const deferredClaimedStampRotationIdSet = useMemo(
    () => new Set(deferredClaimedStampRotationIds),
    [deferredClaimedStampRotationIds],
  );
  const scrollFadeRef = useScrollFade<HTMLDivElement>();

  useEffect(() => {
    if (!isOpen || !hasNewQuestRotations) {
      return;
    }

    markQuestRotationsViewed();
  }, [hasNewQuestRotations, isOpen, markQuestRotationsViewed]);

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
    const revealTimerId = window.setTimeout(() => {
      setClaimedStampRotationIds((current) => {
        if (current.includes(claimRotationId)) {
          return current;
        }

        return [...current, claimRotationId];
      });
      setAnimatingClaimedStampRotationIds((current) => {
        if (current.includes(claimRotationId)) {
          return current;
        }

        return [...current, claimRotationId];
      });
      setDeferredClaimedStampRotationIds((current) =>
        current.filter((id) => id !== claimRotationId),
      );
      claimedStampTimersRef.current = claimedStampTimersRef.current.filter(
        (activeTimerId) => activeTimerId !== revealTimerId,
      );

      const animationTimerId = window.setTimeout(() => {
        setAnimatingClaimedStampRotationIds((current) =>
          current.filter((id) => id !== claimRotationId),
        );
        claimedStampTimersRef.current = claimedStampTimersRef.current.filter(
          (activeTimerId) => activeTimerId !== animationTimerId,
        );
      }, QUEST_CLAIMED_STAMP_ANIMATION_MS);

      claimedStampTimersRef.current.push(animationTimerId);
    }, QUEST_CLAIMED_STAMP_REVEAL_DELAY_MS);

    claimedStampTimersRef.current.push(revealTimerId);
  }, []);
  const handleRewardFlightLayerDone = useCallback(
    (claimRotationId: string) => {
      setRewardFlightLayers((current) =>
        current.filter((layer) => layer.claimRotationId !== claimRotationId),
      );
      setAnimatingClaimRotationIds((current) =>
        current.filter((id) => id !== claimRotationId),
      );

      if (currentProgressAnimationRotationIdRef.current === claimRotationId) {
        clearProgressTimers();
        setAnimatedLevel(null);
        setAnimatedLevelProgress(null);
        currentProgressAnimationRotationIdRef.current = null;
      }

      scheduleClaimedStampReveal(claimRotationId);
    },
    [clearProgressTimers, scheduleClaimedStampReveal],
  );
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

    setAnimatingClaimRotationIds((current) => {
      if (current.includes(claimRotationId)) {
        return current;
      }

      return [...current, claimRotationId];
    });
    currentProgressAnimationRotationIdRef.current = claimRotationId;
    setClaimedStampRotationIds((current) =>
      current.filter((id) => id !== claimRotationId),
    );
    setAnimatingClaimedStampRotationIds((current) =>
      current.filter((id) => id !== claimRotationId),
    );
    setDeferredClaimedStampRotationIds((current) => {
      if (current.includes(claimRotationId)) {
        return current;
      }

      return [...current, claimRotationId];
    });
    setAnimatedLevel(startLevel);
    setAnimatedLevelProgress(startProgress);

    claimQuestReward(
      { userQuestId, questId, questType },
      {
        onSuccess: (claimedDashboard) => {
          const claimId = `quest-claim-${Date.now().toString()}`;
          const nextFlights = buildQuestRewardFlights(rewardSources);

          if (!nextFlights.length) {
            if (
              currentProgressAnimationRotationIdRef.current === claimRotationId
            ) {
              setAnimatedLevel(null);
              setAnimatedLevelProgress(null);
              currentProgressAnimationRotationIdRef.current = null;
            }
            setAnimatingClaimRotationIds((current) =>
              current.filter((id) => id !== claimRotationId),
            );
            scheduleClaimedStampReveal(claimRotationId);
            return;
          }

          setRewardFlightLayers((current) => [
            ...current.filter(
              (layer) => layer.claimRotationId !== claimRotationId,
            ),
            { claimRotationId, flights: nextFlights },
          ]);
          const finalProgress = getLevelProgress(claimedDashboard.level);
          const finalLevel = claimedDashboard.level.level;

          scheduleLevelProgressByHits({
            flights: nextFlights,
            finalProgress,
            startProgress,
            finalLevel,
            startLevel,
          });
          scheduleRewardCounterByHits({
            claimId,
            flights: nextFlights,
            rewardSources,
          });
        },
        onError: () => {
          setDeferredClaimedStampRotationIds((current) =>
            current.filter((id) => id !== claimRotationId),
          );
          setRewardFlightLayers((current) =>
            current.filter(
              (layer) => layer.claimRotationId !== claimRotationId,
            ),
          );
          setAnimatingClaimRotationIds((current) =>
            current.filter((id) => id !== claimRotationId),
          );
          if (
            currentProgressAnimationRotationIdRef.current === claimRotationId
          ) {
            clearProgressTimers();
            setAnimatedLevel(null);
            setAnimatedLevelProgress(null);
            currentProgressAnimationRotationIdRef.current = null;
          }
        },
      },
    );
  };

  const handleDestinationClick = useCallback(
    async (destination: QuestDestination) => {
      setIsOpen(false);

      if ('href' in destination) {
        if (destination.openInNewTab) {
          window.open(destination.href!, '_blank', 'noopener,noreferrer');
          return;
        }

        window.location.assign(destination.href!);
        return;
      }

      await router.push(`${webappUrl}${destination.path.replace(/^\//, '')}`);
    },
    [router],
  );

  useEffect(() => {
    return () => {
      clearProgressTimers();
      clearClaimedStampTimers();
    };
  }, [clearClaimedStampTimers, clearProgressTimers]);

  if (panelOnly) {
    return (
      <>
        <div ref={scrollFadeRef} className="overflow-y-auto bg-inherit">
          <QuestDropdownPanel
            showLevelSystem={showLevelSystem}
            renderedLevel={renderedLevel}
            data={data}
            isPending={isPending}
            isError={isError}
            claimingQuestId={claimingQuestId}
            animatingClaimRotationIds={animatingClaimRotationIdSet}
            claimedStampRotationIds={claimedStampRotationIdSet}
            animatingClaimedStampRotationIds={
              animatingClaimedStampRotationIdSet
            }
            deferredClaimedStampRotationIds={deferredClaimedStampRotationIdSet}
            onClaim={handleClaim}
            onDestinationClick={handleDestinationClick}
          />
        </div>
        {rewardFlightLayers.map((layer) => (
          <QuestRewardFlightLayer
            key={layer.claimRotationId}
            flights={layer.flights}
            onDone={() => handleRewardFlightLayerDone(layer.claimRotationId)}
          />
        ))}
        {levelFireworkParticles.length > 0 && (
          <QuestLevelFireworkLayer
            particles={levelFireworkParticles}
            onDone={clearLevelFireworkParticles}
          />
        )}
      </>
    );
  }

  return (
    <>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <Tooltip content={triggerTooltipContent} side="bottom">
          <PopoverTrigger asChild>
            <Button
              variant={triggerButtonVariant}
              size={triggerButtonSize}
              className={classNames(
                'relative !p-0',
                !compact && '!rounded-full',
              )}
              aria-haspopup="dialog"
              aria-expanded={isOpen}
              aria-label={
                showLevelSystem
                  ? `Quests, level ${renderedLevel}, ${Math.round(
                      renderedLevelProgress,
                    )}% progress${
                      hasNewQuestRotations ? ', new quests available' : ''
                    }`
                  : `Quests${
                      hasNewQuestRotations ? ', new quests available' : ''
                    }`
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
                      className="stroke-accent-avocado-default transition-[stroke-dashoffset] duration-100 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
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
              {hasNewQuestRotations && !claimableCount && (
                <Bubble
                  aria-hidden
                  data-testid="quest-button-new-indicator"
                  className={classNames(
                    'left-0 top-0 !min-h-0 !min-w-0 !py-0.5 px-1.5 !font-bold lowercase typo-caption2',
                    compact
                      ? '-translate-x-1.5 -translate-y-1'
                      : '-translate-x-2 -translate-y-1.5',
                  )}
                >
                  new
                </Bubble>
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
          </PopoverTrigger>
        </Tooltip>

        <PopoverContent
          className="w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-background-popover !p-0 data-[side=bottom]:mt-1 data-[side=top]:mb-1"
          side="bottom"
          align="end"
          sideOffset={6}
          collisionPadding={24}
          avoidCollisions
          onOpenAutoFocus={(event) => event.preventDefault()}
        >
          <div
            ref={scrollFadeRef}
            className="max-h-[var(--radix-popover-content-available-height)] overflow-y-auto bg-inherit"
          >
            <QuestDropdownPanel
              showLevelSystem={showLevelSystem}
              renderedLevel={renderedLevel}
              data={data}
              isPending={isPending}
              isError={isError}
              claimingQuestId={claimingQuestId}
              animatingClaimRotationIds={animatingClaimRotationIdSet}
              claimedStampRotationIds={claimedStampRotationIdSet}
              animatingClaimedStampRotationIds={
                animatingClaimedStampRotationIdSet
              }
              deferredClaimedStampRotationIds={
                deferredClaimedStampRotationIdSet
              }
              onClaim={handleClaim}
              onDestinationClick={handleDestinationClick}
            />
          </div>
        </PopoverContent>
      </Popover>
      {rewardFlightLayers.map((layer) => (
        <QuestRewardFlightLayer
          key={layer.claimRotationId}
          flights={layer.flights}
          onDone={() => handleRewardFlightLayerDone(layer.claimRotationId)}
        />
      ))}
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
