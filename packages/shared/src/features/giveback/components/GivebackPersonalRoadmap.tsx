import type { ReactElement } from 'react';
import React, { useMemo, useState } from 'react';
import classNames from 'classnames';
import { FlexCol, FlexRow } from '../../../components/utilities';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import {
  ArrowIcon,
  CoreIcon,
  DevPlusIcon,
  GiftIcon,
  LockIcon,
  MedalBadgeIcon,
  StarIcon,
  VIcon,
} from '../../../components/icons';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent } from '../../../lib/log';
import { useGivebackContribution } from '../hooks/useGivebackContribution';
import { useContributionRewards } from '../hooks/useContributionRewards';
import { useContributionUserRewards } from '../hooks/useContributionUserRewards';
import { useClaimContributionReward } from '../hooks/useClaimContributionReward';
import { ContributionRewardType } from '../types';
import { formatDonationAmount } from '../utils';
import { GivebackMeterShine } from './GivebackMeterShine';

// How many upcoming levels to reveal after the one you're on. The ladder can be
// long, so we only ever render a window of it.
const DEFAULT_UPCOMING = 4;

const rewardIconByType: Record<ContributionRewardType, ReactElement> = {
  [ContributionRewardType.Cores]: <CoreIcon />,
  [ContributionRewardType.PlusDays]: <DevPlusIcon />,
  [ContributionRewardType.Call]: <StarIcon />,
  [ContributionRewardType.Privilege]: <MedalBadgeIcon />,
  [ContributionRewardType.Custom]: <GiftIcon />,
};

// A reward tier reshaped into a roadmap node. Every tier grants a reward, so the
// node always has one.
interface RoadmapLevel {
  id: string;
  levelNumber: number;
  requiredApprovedAmount: number;
  reward: {
    id: string;
    type: ContributionRewardType;
    title: string;
    description: string | null;
  };
}

// One state drives every visual cue on a node, so "done", "you are here", and
// "locked" never disagree (RPG / battle-pass clarity).
type NodeState = 'claimed' | 'summit' | 'current' | 'unlocked' | 'locked';

// Every step you've already cleared shares one "completed" green so the trail
// reads as a single continuous path. "Current" stays purple to mark where you
// are, the summit keeps its gold treatment, and locked steps stay muted.
const nodeStyles: Record<NodeState, string> = {
  claimed: 'bg-accent-avocado-default text-white',
  summit:
    'bg-gradient-to-br from-accent-cheese-default to-accent-bacon-default text-white shadow-2',
  current:
    'bg-gradient-to-br from-accent-cabbage-default to-accent-onion-default text-white shadow-2-cabbage',
  unlocked: 'bg-accent-avocado-default text-white',
  locked:
    'border border-border-subtlest-tertiary bg-surface-float text-text-quaternary',
};

type ConnectorFill =
  | { type: 'full' }
  | { type: 'partial'; progress: number }
  | { type: 'muted' };

interface RoadmapNode {
  level: RoadmapLevel;
  isLast: boolean;
  isReached: boolean;
  isCurrent: boolean;
  isNext: boolean;
  isClaimed: boolean;
  connector?: ConnectorFill;
}

const Connector = ({ fill }: { fill: ConnectorFill }): ReactElement => (
  <div className="relative w-1 flex-1">
    <div className="absolute inset-0 rounded-full bg-border-subtlest-tertiary" />
    {fill.type === 'full' && (
      <div className="absolute inset-0 rounded-full bg-accent-avocado-default" />
    )}
    {fill.type === 'partial' && (
      <div
        className="absolute inset-x-0 top-0 rounded-full bg-gradient-to-b from-accent-avocado-default to-accent-cabbage-default"
        style={{ height: `${Math.round(fill.progress * 100)}%` }}
      />
    )}
  </div>
);

interface RailToggleProps {
  icon: ReactElement;
  label: string;
  onClick: () => void;
  connectorBelow?: ConnectorFill;
}

const RailToggle = ({
  icon,
  label,
  onClick,
  connectorBelow,
}: RailToggleProps): ReactElement => (
  <button
    type="button"
    onClick={onClick}
    className="group flex w-full gap-4 text-left"
  >
    <div className="relative flex w-10 shrink-0 flex-col items-center">
      <span className="z-1 flex size-10 items-center justify-center rounded-14 border border-dashed border-border-subtlest-secondary bg-background-default text-text-tertiary transition-colors group-hover:border-accent-cabbage-default group-hover:text-accent-cabbage-default [&_svg]:size-4">
        {icon}
      </span>
      {connectorBelow && <Connector fill={connectorBelow} />}
    </div>
    <div
      className={classNames(
        'flex min-w-0 flex-1 flex-col',
        connectorBelow ? 'pb-8' : 'pb-1',
      )}
    >
      {/* Match the icon's height so the label centers against the node, not the
          full icon + connector run. */}
      <div className="flex h-10 items-center">
        <Typography
          type={TypographyType.Footnote}
          bold
          color={TypographyColor.Tertiary}
          className="transition-colors group-hover:text-text-primary"
        >
          {label}
        </Typography>
      </div>
    </div>
  </button>
);

// Directions the celebration sparkles fly when a reward is claimed, fed to the
// reaction-burst keyframe via CSS custom properties.
const claimSparkles: ReadonlyArray<{ tx: string; ty: string; delay: string }> =
  [
    { tx: '-20px', ty: '-18px', delay: '0ms' },
    { tx: '18px', ty: '-22px', delay: '40ms' },
    { tx: '26px', ty: '2px', delay: '20ms' },
    { tx: '-24px', ty: '6px', delay: '60ms' },
    { tx: '4px', ty: '-26px', delay: '0ms' },
  ];

interface NodeRowProps {
  node: RoadmapNode;
  amountToNext: number;
  segmentProgress: number;
  isClaiming: boolean;
  onClaim: (tierId: string) => void;
  onTakeAction: () => void;
}

const NodeRow = ({
  node,
  amountToNext,
  segmentProgress,
  isClaiming,
  onClaim,
  onTakeAction,
}: NodeRowProps): ReactElement => {
  const { level, isLast, isReached, isCurrent, isNext, isClaimed } = node;
  const { reward } = level;
  const isSummit = isLast;
  const canClaim = isReached && !isClaimed;
  const [celebrate, setCelebrate] = useState(false);

  const handleClaim = () => {
    setCelebrate(true);
    onClaim(reward.id);
  };

  const getNodeState = (): NodeState => {
    if (isReached && isSummit) {
      return 'summit';
    }
    if (isCurrent) {
      return 'current';
    }
    if (isClaimed) {
      return 'claimed';
    }
    if (isReached) {
      return 'unlocked';
    }
    return 'locked';
  };

  const getNodeIcon = (): ReactElement => {
    if (isClaimed) {
      return <VIcon />;
    }
    if (isReached || isNext) {
      return rewardIconByType[reward.type];
    }
    return <LockIcon />;
  };

  const requirementLabel =
    level.requiredApprovedAmount > 0
      ? formatDonationAmount(level.requiredApprovedAmount)
      : 'Free';

  return (
    <FlexRow className="relative gap-4">
      <div className="relative flex w-10 shrink-0 flex-col items-center">
        <span className="relative z-1 flex size-10 shrink-0 items-center justify-center">
          {isCurrent && (
            <span
              aria-hidden
              className="bg-accent-cabbage-default/25 absolute inset-0 rounded-14 motion-safe:animate-ping"
            />
          )}
          {isNext && (
            <span
              aria-hidden
              className="bg-accent-cabbage-default/30 absolute -inset-1 rounded-16 blur-sm motion-safe:animate-glow-pulse"
            />
          )}
          <span
            className={classNames(
              'relative flex size-10 items-center justify-center rounded-14 transition-colors [&_svg]:size-5',
              nodeStyles[getNodeState()],
              celebrate && isClaimed && 'motion-safe:animate-reward-pop',
            )}
          >
            {getNodeIcon()}
          </span>
          <span
            className={classNames(
              'absolute -bottom-1 -right-1 flex size-4 items-center justify-center rounded-full bg-background-subtle font-bold tabular-nums ring-2 ring-background-default typo-caption2',
              isReached ? 'text-text-secondary' : 'text-text-quaternary',
            )}
          >
            {level.levelNumber}
          </span>
        </span>
        {!isLast && <Connector fill={node.connector ?? { type: 'muted' }} />}
      </div>

      <div className={classNames('min-w-0 flex-1', isLast ? 'pb-1' : 'pb-8')}>
        <FlexCol
          className={classNames(
            'gap-2',
            isNext &&
              'rounded-16 border border-border-subtlest-tertiary bg-surface-float p-4',
          )}
        >
          <FlexRow className="items-start justify-between gap-3">
            <FlexCol className="min-w-0 gap-1">
              <FlexRow className="flex-wrap items-center gap-2">
                <Typography
                  tag={TypographyTag.Span}
                  type={TypographyType.Caption2}
                  color={TypographyColor.Tertiary}
                  bold
                  className="uppercase tracking-wider"
                >
                  Level {level.levelNumber} · {requirementLabel}
                </Typography>
                {isCurrent && (
                  <span className="rounded-6 bg-accent-cabbage-default px-2 py-0.5 font-bold text-white typo-caption2">
                    You&apos;re here
                  </span>
                )}
                {isClaimed && !isCurrent && (
                  <FlexRow className="items-center gap-1 text-accent-avocado-default [&_svg]:size-4">
                    <VIcon />
                    <Typography bold type={TypographyType.Caption2}>
                      Claimed
                    </Typography>
                  </FlexRow>
                )}
              </FlexRow>
              <Typography
                tag={TypographyTag.Span}
                bold
                type={TypographyType.Callout}
                color={
                  isReached || isNext
                    ? TypographyColor.Primary
                    : TypographyColor.Tertiary
                }
              >
                {reward.title}
              </Typography>
              {isNext && reward.description && (
                <Typography
                  type={TypographyType.Caption1}
                  color={TypographyColor.Secondary}
                >
                  {reward.description}
                </Typography>
              )}
            </FlexCol>

            {canClaim ? (
              <div className="relative shrink-0">
                {celebrate && (
                  <span aria-hidden className="pointer-events-none absolute inset-0 z-10">
                    <span className="absolute inset-0 rounded-12 ring-2 ring-accent-avocado-default motion-safe:animate-claim-ring" />
                    {claimSparkles.map((sparkle) => (
                      <span
                        key={`${sparkle.tx}-${sparkle.ty}`}
                        className="absolute left-1/2 top-1/2 size-1.5 rounded-full bg-accent-cheese-default opacity-0 motion-safe:animate-reaction-burst"
                        style={
                          {
                            '--burst-tx': sparkle.tx,
                            '--burst-ty': sparkle.ty,
                            animationDelay: sparkle.delay,
                          } as React.CSSProperties
                        }
                      />
                    ))}
                  </span>
                )}
                <Button
                  type="button"
                  size={ButtonSize.XSmall}
                  variant={ButtonVariant.Primary}
                  onClick={handleClaim}
                  loading={isClaiming}
                  className={classNames(
                    'relative',
                    celebrate && 'motion-safe:animate-reward-pop',
                  )}
                >
                  Claim
                </Button>
              </div>
            ) : (
              !isReached &&
              !isNext && (
                <span className="shrink-0 text-text-quaternary [&_svg]:size-4">
                  <LockIcon />
                </span>
              )
            )}
          </FlexRow>

          {isNext && (
            <FlexCol className="gap-2">
              <div className="relative h-1.5 overflow-hidden rounded-full bg-surface-float">
                <div
                  className="relative h-full overflow-hidden rounded-full bg-gradient-to-r from-accent-avocado-default via-accent-cabbage-default to-accent-cheese-default transition-[width] duration-500"
                  style={{ width: `${Math.round(segmentProgress * 100)}%` }}
                >
                  <GivebackMeterShine
                    percentage={100}
                    radiusClassName="rounded-full"
                  />
                </div>
              </div>
              <FlexRow className="items-center justify-between gap-3">
                <Typography
                  bold
                  type={TypographyType.Caption1}
                  className="tabular-nums text-accent-avocado-default"
                >
                  {formatDonationAmount(amountToNext)} to go
                </Typography>
                <Button
                  type="button"
                  size={ButtonSize.XSmall}
                  variant={ButtonVariant.Primary}
                  onClick={onTakeAction}
                >
                  Take action
                </Button>
              </FlexRow>
            </FlexCol>
          )}
        </FlexCol>
      </div>
    </FlexRow>
  );
};

interface GivebackPersonalRoadmapProps {
  onTakeAction: () => void;
}

// The visitor's reward-ladder journey: a battle-pass style rail of every reward
// tier, with the one they're on highlighted, claimed perks marked, and the next
// milestone showing how far to go. Built from the live reward tiers and the
// visitor's own approved points and claims.
export const GivebackPersonalRoadmap = ({
  onTakeAction,
}: GivebackPersonalRoadmapProps): ReactElement => {
  const { logEvent } = useLogContext();
  const { earnedPoints, currentLevel, isPending } =
    useGivebackContribution(true);
  const { rewardTiers } = useContributionRewards(true);
  const { claimedRewardIds } = useContributionUserRewards(true);
  const { claim, isPending: isClaiming } = useClaimContributionReward();
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [showCompleted, setShowCompleted] = useState(true);
  const [showAllUpcoming, setShowAllUpcoming] = useState(false);

  const levels = useMemo<RoadmapLevel[]>(
    () =>
      [...rewardTiers]
        .sort((a, b) => a.thresholdPoints - b.thresholdPoints)
        .map((tier, index) => ({
          id: tier.id,
          levelNumber: index + 1,
          requiredApprovedAmount: tier.thresholdPoints,
          reward: {
            id: tier.id,
            type: tier.rewardType,
            title: tier.title,
            description: tier.description,
          },
        })),
    [rewardTiers],
  );

  const claimedIds = useMemo(
    () => new Set(claimedRewardIds),
    [claimedRewardIds],
  );

  if (isPending) {
    return (
      <div
        role="status"
        aria-label="Loading journey"
        className="h-72 animate-pulse rounded-16 bg-surface-float"
      />
    );
  }

  if (!levels.length) {
    return (
      <FlexCol className="items-center gap-1 rounded-16 border border-dashed border-border-subtlest-tertiary p-8 text-center">
        <Typography bold type={TypographyType.Callout}>
          Your journey starts soon
        </Typography>
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          Reward milestones are on the way. Keep taking action to unlock them.
        </Typography>
      </FlexCol>
    );
  }

  const approved = earnedPoints;
  const total = levels.length;
  const focusIndex = Math.min(total - 1, Math.max(0, currentLevel - 1));
  const nextIndex = levels.findIndex(
    (level) => level.requiredApprovedAmount > approved,
  );
  const nextLevel = nextIndex === -1 ? undefined : levels[nextIndex];
  const amountToNext = nextLevel
    ? Math.max(0, nextLevel.requiredApprovedAmount - approved)
    : 0;
  const reachedCount = levels.filter(
    (level) => approved >= level.requiredApprovedAmount,
  ).length;
  const claimableCount = levels.filter(
    (level) =>
      approved >= level.requiredApprovedAmount && !claimedIds.has(level.id),
  ).length;

  // Progress within the current segment (last reached → next level).
  const previousAmount =
    levels[Math.max(0, reachedCount - 1)].requiredApprovedAmount;
  const segmentDenominator = nextLevel
    ? nextLevel.requiredApprovedAmount - previousAmount
    : 1;
  const segmentProgress = nextLevel
    ? Math.min(1, Math.max(0, (approved - previousAmount) / segmentDenominator))
    : 1;

  const getConnector = (index: number): ConnectorFill | undefined => {
    const next = levels[index + 1];
    if (!next) {
      return undefined;
    }
    if (approved >= next.requiredApprovedAmount) {
      return { type: 'full' };
    }
    if (approved >= levels[index].requiredApprovedAmount) {
      const denom =
        next.requiredApprovedAmount - levels[index].requiredApprovedAmount || 1;
      const progress = Math.min(
        1,
        Math.max(0, (approved - levels[index].requiredApprovedAmount) / denom),
      );
      return { type: 'partial', progress };
    }
    return { type: 'muted' };
  };

  const onClaim = async (tierId: string) => {
    const level = levels.find((item) => item.id === tierId);
    logEvent({
      event_name: LogEvent.ClaimGivebackReward,
      target_id: tierId,
      extra: JSON.stringify({
        reward_type: level?.reward.type,
        threshold: level?.requiredApprovedAmount,
      }),
    });
    setClaimingId(tierId);
    try {
      await claim(tierId);
    } finally {
      setClaimingId(null);
    }
  };

  const handleTakeAction = () => {
    logEvent({
      event_name: LogEvent.ClickGivebackTakeAction,
      extra: JSON.stringify({ origin: 'roadmap' }),
    });
    onTakeAction();
  };

  // Window: current level + the next few. "Show more" extends it; "Show
  // completed" reveals everything already cleared above.
  const upcomingEnd = showAllUpcoming
    ? total - 1
    : Math.min(total - 1, focusIndex + DEFAULT_UPCOMING);
  const visibleStart = showCompleted ? 0 : focusIndex;
  const hiddenUpcoming = total - 1 - upcomingEnd;
  const canCollapseUpcoming = total - 1 > focusIndex + DEFAULT_UPCOMING;

  const visibleNodes: RoadmapNode[] = levels
    .slice(visibleStart, upcomingEnd + 1)
    .map((level) => {
      const index = level.levelNumber - 1;
      return {
        level,
        isLast: index === total - 1,
        isReached: approved >= level.requiredApprovedAmount,
        isCurrent: level.levelNumber === focusIndex + 1,
        isNext: level.id === nextLevel?.id,
        isClaimed: claimedIds.has(level.id),
        connector: getConnector(index),
      };
    });

  return (
    <section id="giveback-roadmap" className="relative w-full scroll-mt-16">
      <FlexCol className="gap-6">
        <FlexCol className="gap-3">
          <Typography
            tag={TypographyTag.Span}
            type={TypographyType.Caption1}
            color={TypographyColor.Tertiary}
            bold
            className="uppercase tracking-wider"
          >
            Your impact
          </Typography>
          <FlexRow className="flex-wrap items-center gap-4">
            <FlexCol className="size-16 shrink-0 items-center justify-center rounded-20 bg-gradient-to-br from-accent-cabbage-default to-accent-onion-default text-white shadow-2-cabbage">
              <Typography
                tag={TypographyTag.Span}
                type={TypographyType.Caption2}
                bold
                className="opacity-80 uppercase tracking-wider"
              >
                Level
              </Typography>
              <Typography
                tag={TypographyTag.Span}
                type={TypographyType.Title1}
                bold
                className="leading-none"
              >
                {focusIndex + 1}
              </Typography>
            </FlexCol>

            <FlexCol className="min-w-0 flex-1 gap-0.5">
              <Typography
                tag={TypographyTag.H3}
                type={TypographyType.Title3}
                bold
              >
                {nextLevel
                  ? `Next up: ${nextLevel.reward.title}`
                  : "You've unlocked every reward"}
              </Typography>
              <Typography
                tag={TypographyTag.P}
                type={TypographyType.Callout}
                color={TypographyColor.Secondary}
              >
                {nextLevel
                  ? `${formatDonationAmount(amountToNext)} to go.`
                  : "You've reached the top of the ladder."}
              </Typography>
              <Typography
                tag={TypographyTag.Span}
                type={TypographyType.Caption1}
                color={TypographyColor.Tertiary}
                className="tabular-nums"
              >
                Level {focusIndex + 1} of {total} ·{' '}
                {formatDonationAmount(approved)} unlocked
              </Typography>
            </FlexCol>

            {claimableCount > 0 && (
              <FlexRow className="items-center gap-1.5 self-start rounded-10 bg-accent-cheese-flat px-3 py-1.5 text-accent-cheese-default">
                <GiftIcon />
                <Typography bold type={TypographyType.Caption1}>
                  {claimableCount} ready to claim
                </Typography>
              </FlexRow>
            )}
          </FlexRow>
        </FlexCol>

        <FlexCol>
          {focusIndex > 0 && (
            <RailToggle
              icon={
                <ArrowIcon
                  className={showCompleted ? 'rotate-180' : undefined}
                />
              }
              label={
                showCompleted
                  ? 'Hide completed levels'
                  : `Show ${focusIndex} completed ${
                      focusIndex === 1 ? 'level' : 'levels'
                    }`
              }
              onClick={() => setShowCompleted((value) => !value)}
              connectorBelow={{ type: 'full' }}
            />
          )}

          {visibleNodes.map((node) => (
            <NodeRow
              key={node.level.id}
              node={node}
              amountToNext={amountToNext}
              segmentProgress={segmentProgress}
              isClaiming={isClaiming && claimingId === node.level.id}
              onClaim={onClaim}
              onTakeAction={handleTakeAction}
            />
          ))}

          {hiddenUpcoming > 0 && (
            <RailToggle
              icon={<ArrowIcon className="rotate-180" />}
              label={`Show ${hiddenUpcoming} more ${
                hiddenUpcoming === 1 ? 'level' : 'levels'
              }`}
              onClick={() => setShowAllUpcoming(true)}
            />
          )}
        </FlexCol>

        {showAllUpcoming && canCollapseUpcoming && (
          <FlexRow className="justify-center">
            <Button
              type="button"
              size={ButtonSize.Small}
              variant={ButtonVariant.Float}
              icon={<ArrowIcon />}
              onClick={() => setShowAllUpcoming(false)}
            >
              Show less
            </Button>
          </FlexRow>
        )}
      </FlexCol>
    </section>
  );
};
