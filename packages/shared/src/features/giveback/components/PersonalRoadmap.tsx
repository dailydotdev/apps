import type { ReactElement } from 'react';
import React, { useState } from 'react';
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
import ConfettiSvg from '../../../svg/ConfettiSvg';
import { useGivebackContext } from '../GivebackContext';
import { useGivebackNav } from '../GivebackNavContext';
import { formatDonationAmount } from '../utils';
import type { GivebackLevel } from '../types';
import { GivebackRewardType } from '../types';
import { GivebackMeterShine } from './GivebackMeterShine';

// How many upcoming levels to reveal after the one you're on. The ladder can be
// arbitrarily long (20+), so we only ever render a window of it.
const DEFAULT_UPCOMING = 4;

const rewardIconByType: Record<GivebackRewardType, ReactElement> = {
  [GivebackRewardType.Cores]: <CoreIcon />,
  [GivebackRewardType.DailyPlus]: <DevPlusIcon />,
  [GivebackRewardType.SwagCoupon]: <GiftIcon />,
  [GivebackRewardType.Badge]: <MedalBadgeIcon />,
  [GivebackRewardType.Other]: <StarIcon />,
};

// One state drives every visual cue on a node, so "done", "you are here", and
// "locked" never disagree (RPG / battle-pass clarity).
type NodeState = 'claimed' | 'summit' | 'current' | 'unlocked' | 'locked';

const nodeStyles: Record<NodeState, string> = {
  claimed: 'bg-accent-avocado-default text-white',
  summit:
    'bg-gradient-to-br from-accent-cheese-default to-accent-bacon-default text-white shadow-2',
  current:
    'bg-gradient-to-br from-accent-cabbage-default to-accent-onion-default text-white shadow-2-cabbage',
  unlocked: 'bg-accent-cabbage-default text-white',
  locked:
    'border border-border-subtlest-tertiary bg-surface-float text-text-quaternary',
};

type ConnectorFill =
  | { type: 'full' }
  | { type: 'partial'; progress: number }
  | { type: 'muted' };

interface RoadmapNode {
  level: GivebackLevel;
  index: number;
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
      <div className="absolute inset-0 rounded-full bg-accent-cabbage-default" />
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
      <span className="z-1 flex size-10 items-center justify-center rounded-full border border-dashed border-border-subtlest-secondary bg-background-default text-text-tertiary transition-colors group-hover:border-accent-cabbage-default group-hover:text-accent-cabbage-default [&_svg]:size-4">
        {icon}
      </span>
      {connectorBelow && <Connector fill={connectorBelow} />}
    </div>
    <div
      className={classNames(
        'flex min-w-0 flex-1 items-center',
        connectorBelow ? 'pb-8' : 'pb-1',
      )}
    >
      <Typography
        type={TypographyType.Footnote}
        bold
        color={TypographyColor.Tertiary}
        className="transition-colors group-hover:text-text-primary"
      >
        {label}
      </Typography>
    </div>
  </button>
);

interface NodeRowProps {
  node: RoadmapNode;
  currency: string;
  amountToNext: number;
  segmentProgress: number;
  onClaim: (rewardId: string) => void;
  onTakeAction: () => void;
}

const NodeRow = ({
  node,
  currency,
  amountToNext,
  segmentProgress,
  onClaim,
  onTakeAction,
}: NodeRowProps): ReactElement => {
  const { level, isLast, isReached, isCurrent, isNext, isClaimed } = node;
  const { reward } = level;
  const isSummit = isLast;
  const isRevealed = isReached || isNext || !reward?.isSecret;
  const canClaim = isReached && !!reward && !isClaimed;
  const [celebrate, setCelebrate] = useState(false);

  const handleClaim = () => {
    if (!reward) {
      return;
    }
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
    if (reward && isRevealed) {
      return rewardIconByType[reward.type];
    }
    return <LockIcon />;
  };

  const title = (() => {
    if (!reward) {
      return level.name;
    }
    return isRevealed ? reward.title : reward.secretTitle;
  })();

  const requirementLabel =
    level.requiredApprovedAmount > 0
      ? formatDonationAmount(level.requiredApprovedAmount, currency)
      : 'Free';

  return (
    <FlexRow className="relative gap-4">
      <div className="relative flex w-10 shrink-0 flex-col items-center">
        {celebrate && (
          <ConfettiSvg
            aria-hidden
            className="z-10 pointer-events-none absolute -top-4 left-1/2 h-20 w-32 -translate-x-1/2"
          />
        )}
        <span className="relative z-1 flex size-10 shrink-0 items-center justify-center">
          {isCurrent && (
            <span
              aria-hidden
              className="bg-accent-cabbage-default/25 absolute inset-0 rounded-full motion-safe:animate-ping"
            />
          )}
          <span
            className={classNames(
              'relative flex size-10 items-center justify-center rounded-full [&_svg]:size-5',
              nodeStyles[getNodeState()],
              isNext && 'motion-safe:animate-glow-pulse',
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
            isNext && 'rounded-16 border border-border-subtlest-tertiary p-4',
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
                  {level.name} · {requirementLabel}
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
                {title}
              </Typography>
              {isNext && reward?.description && !reward.isSecret && (
                <Typography
                  type={TypographyType.Caption1}
                  color={TypographyColor.Secondary}
                >
                  {reward.description}
                </Typography>
              )}
            </FlexCol>

            {canClaim ? (
              <Button
                type="button"
                size={ButtonSize.XSmall}
                variant={ButtonVariant.Primary}
                onClick={handleClaim}
                className={classNames(
                  'shrink-0',
                  celebrate && 'motion-safe:animate-reward-pop',
                )}
              >
                Claim
              </Button>
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
                  className="tabular-nums text-accent-cabbage-default"
                >
                  {formatDonationAmount(amountToNext, currency)} to go
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

export const PersonalRoadmap = (): ReactElement => {
  const { levels, userProfile, campaign } = useGivebackContext();
  const { setActiveTab } = useGivebackNav();
  const approved = userProfile.approvedContributionAmount;
  const { currency } = campaign;
  const total = levels.length;
  const [claimedRewardIds, setClaimedRewardIds] = useState<Set<string>>(
    new Set(),
  );
  const [showCompleted, setShowCompleted] = useState(false);
  const [showAllUpcoming, setShowAllUpcoming] = useState(false);

  const currentLevel =
    levels.find((level) => level.levelNumber === userProfile.currentLevel) ??
    levels[0];
  const focusIndex = Math.max(
    0,
    levels.findIndex((level) => level.levelNumber === currentLevel.levelNumber),
  );
  const topLevel = levels[total - 1];
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
      approved >= level.requiredApprovedAmount &&
      !!level.reward &&
      !claimedRewardIds.has(level.reward.id),
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

  const onClaim = (rewardId: string) =>
    setClaimedRewardIds((prev) => new Set(prev).add(rewardId));

  // Window: current level + the next few. "Show more" extends it; "Show
  // completed" reveals everything you've already cleared above.
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
        index,
        isLast: index === total - 1,
        isReached: approved >= level.requiredApprovedAmount,
        isCurrent: level.levelNumber === currentLevel.levelNumber,
        isNext: level.id === nextLevel?.id,
        isClaimed: !!level.reward && claimedRewardIds.has(level.reward.id),
        connector: getConnector(index),
      };
    });

  const welcomeReward = levels[0]?.reward;
  const isWelcomeClaimed =
    !!welcomeReward && claimedRewardIds.has(welcomeReward.id);

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
            Your journey
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
                {currentLevel.levelNumber}
              </Typography>
            </FlexCol>

            <FlexCol className="min-w-0 flex-1 gap-0.5">
              <Typography
                tag={TypographyTag.H3}
                type={TypographyType.Title3}
                bold
              >
                You&apos;re a {currentLevel.name}
              </Typography>
              <Typography
                tag={TypographyTag.P}
                type={TypographyType.Callout}
                color={TypographyColor.Secondary}
              >
                {nextLevel
                  ? `${formatDonationAmount(
                      amountToNext,
                      currency,
                    )} to go and you're a ${nextLevel.name}.`
                  : `You've reached the top. You're a ${topLevel.name}.`}
              </Typography>
              <Typography
                tag={TypographyTag.Span}
                type={TypographyType.Caption1}
                color={TypographyColor.Tertiary}
                className="tabular-nums"
              >
                Level {currentLevel.levelNumber} of {total} ·{' '}
                {formatDonationAmount(approved, currency)} unlocked
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

        {welcomeReward && (
          <FlexRow className="group items-center gap-4 rounded-16 border border-border-subtlest-tertiary p-4 transition-shadow duration-200 hover:shadow-2">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-16 bg-accent-avocado-flat text-accent-avocado-default transition-transform duration-200 group-hover:-rotate-6 group-hover:scale-110 [&_svg]:size-6">
              <GiftIcon />
            </span>
            <FlexCol className="min-w-0 flex-1 gap-0.5">
              <Typography
                tag={TypographyTag.Span}
                type={TypographyType.Caption2}
                bold
                className="uppercase tracking-wider text-accent-avocado-default"
              >
                Welcome gift · unlocked
              </Typography>
              <Typography bold type={TypographyType.Callout}>
                $10 to your causes, on us
              </Typography>
              <Typography
                type={TypographyType.Caption1}
                color={TypographyColor.Secondary}
              >
                Just for joining and picking the causes you care about. No
                action needed.
              </Typography>
            </FlexCol>
            {isWelcomeClaimed ? (
              <FlexRow className="shrink-0 items-center gap-1 text-accent-avocado-default [&_svg]:size-4">
                <VIcon />
                <Typography bold type={TypographyType.Caption1}>
                  Claimed
                </Typography>
              </FlexRow>
            ) : (
              <Button
                type="button"
                size={ButtonSize.Small}
                variant={ButtonVariant.Primary}
                onClick={() => onClaim(welcomeReward.id)}
                className="shrink-0 shadow-2 transition-transform duration-200 hover:scale-[1.04] active:scale-100 motion-reduce:transform-none"
              >
                Claim $10
              </Button>
            )}
          </FlexRow>
        )}

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
              currency={currency}
              amountToNext={amountToNext}
              segmentProgress={segmentProgress}
              onClaim={onClaim}
              onTakeAction={() => setActiveTab('actions')}
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
