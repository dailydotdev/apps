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
  ButtonColor,
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
  UserIcon,
  VIcon,
} from '../../../components/icons';
import {
  ProfilePicture,
  ProfileImageSize,
} from '../../../components/ProfilePicture';
import { useAuthContext } from '../../../contexts/AuthContext';
import type { LoggedUser } from '../../../lib/user';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent } from '../../../lib/log';
import { useGivebackContribution } from '../hooks/useGivebackContribution';
import { useContributionRewards } from '../hooks/useContributionRewards';
import { useContributionUserRewards } from '../hooks/useContributionUserRewards';
import { useClaimContributionReward } from '../hooks/useClaimContributionReward';
import { useContributionCausePicker } from '../hooks/useContributionCausePicker';
import { useContributionActions } from '../hooks/useContributionActions';
import { ContributionRewardType } from '../types';
import { formatDonationAmount } from '../utils';
import { GivebackMeterShine } from './GivebackMeterShine';
import { GivebackTabHeading } from './GivebackTabHeading';

// Joins up to three cause names into a natural list ("a, b, and c"), so the
// impact headline names exactly who the visitor's actions are funding.
const formatCauseNames = (names: string[]): string | null => {
  const shown = names.slice(0, 3);
  if (shown.length === 0) {
    return null;
  }
  if (shown.length === 1) {
    return shown[0];
  }
  const head = shown.slice(0, -1).join(', ');
  const tail = shown[shown.length - 1];
  const suffix = names.length > 3 ? ', and more' : '';
  return `${head}, and ${tail}${suffix}`;
};

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

// Contrast-first, branded palette so color carries meaning, not decoration:
//   • markers are calm surface tiles by default (high contrast on the dark page)
//   • green is only a "done" check accent, never a saturated fill
//   • cabbage (brand) is the single live accent: you, your next goal, claimable
//   • the summit alone gets a brand gradient fill so it reads as "the big one"
//   • locked stays muted/dimmed
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

// A straight 3px track between nodes. Cleared segments are green; the live
// segment leading up to you fills in brand cabbage. One color per state, no
// gradients, so the rail reads as a single calm path.
const Connector = ({ fill }: { fill: ConnectorFill }): ReactElement => (
  <div className="relative w-[3px] flex-1">
    <div className="absolute inset-0 bg-border-subtlest-tertiary" />
    {fill.type === 'full' && (
      <div className="absolute inset-0 bg-accent-avocado-default" />
    )}
    {fill.type === 'partial' && (
      <div
        className="absolute inset-x-0 top-0 bg-accent-cabbage-default"
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

// Directions the celebration confetti flies when a reward is claimed, fed to the
// reaction-burst keyframe via CSS custom properties. A fuller spread of brand
// colors makes the claim feel like a genuine "you did it" moment, not a flicker.
const claimSparkles: ReadonlyArray<{
  tx: string;
  ty: string;
  delay: string;
  color: string;
}> = [
  {
    tx: '-34px',
    ty: '-26px',
    delay: '0ms',
    color: 'bg-accent-cabbage-default',
  },
  { tx: '32px', ty: '-30px', delay: '30ms', color: 'bg-accent-cheese-default' },
  { tx: '44px', ty: '-2px', delay: '60ms', color: 'bg-accent-avocado-default' },
  { tx: '-42px', ty: '4px', delay: '20ms', color: 'bg-accent-onion-default' },
  { tx: '8px', ty: '-40px', delay: '10ms', color: 'bg-accent-cheese-default' },
  {
    tx: '-14px',
    ty: '-38px',
    delay: '50ms',
    color: 'bg-accent-cabbage-default',
  },
  { tx: '24px', ty: '26px', delay: '40ms', color: 'bg-accent-avocado-default' },
  { tx: '-26px', ty: '24px', delay: '70ms', color: 'bg-accent-cheese-default' },
];

interface NodeRowProps {
  node: RoadmapNode;
  user: LoggedUser | null;
  amountToNext: number;
  segmentProgress: number;
  isClaiming: boolean;
  onClaim: (tierId: string) => void;
  onTakeAction: () => void;
}

// Rounded rectangles, not circles - the squircle marker echoes daily.dev's
// branding (square avatars, rounded app tiles) and reads as custom-built rather
// than a generic battle-pass dot.
const markerBase =
  'flex size-10 items-center justify-center rounded-12 [&_svg]:size-5';

const NodeRow = ({
  node,
  user,
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

  // The marker is the one cue that tells you, at a glance, what this stop is.
  // Priority matters: "you" (your face) and the summit prize always win, so the
  // trail never shows two competing highlights.
  const renderMarker = (): ReactElement => {
    if (isCurrent) {
      // Your own face marks where you stand - a rounded square (not a circle) to
      // match daily.dev's square avatars.
      return user ? (
        <ProfilePicture
          user={user}
          size={ProfileImageSize.Large}
          rounded={ProfileImageSize.Large}
          className="ring-2 ring-accent-cabbage-default ring-offset-2 ring-offset-background-default"
        />
      ) : (
        <span
          className={classNames(
            markerBase,
            'bg-accent-cabbage-default text-white',
          )}
        >
          <UserIcon />
        </span>
      );
    }
    if (isSummit) {
      // The grand prize: the single boldest tile, a brand gradient with a gift
      // (white on cabbage→onion reads clearly, unlike a flat gold fill).
      return (
        <span
          className={classNames(
            markerBase,
            isReached
              ? 'bg-gradient-to-br from-accent-cabbage-default to-accent-onion-default text-white shadow-2-cabbage'
              : 'border border-accent-cabbage-default bg-accent-cabbage-flat text-accent-cabbage-default',
          )}
        >
          {isClaimed ? <VIcon /> : <GiftIcon />}
        </span>
      );
    }
    if (isClaimed) {
      // Done = a calm surface tile with a green check accent, not a saturated
      // green fill (which washed out the icon).
      return (
        <span
          className={classNames(
            markerBase,
            'border border-border-subtlest-tertiary bg-surface-float text-accent-avocado-default',
          )}
        >
          <VIcon />
        </span>
      );
    }
    if (isReached) {
      // Unlocked, claim pending: cheese (yellow) accent matches the "ready to
      // claim" cue and the Claim button, so claimable reads consistently.
      return (
        <span
          className={classNames(
            markerBase,
            'border-accent-cheese-default/50 border bg-surface-float text-accent-cheese-default',
          )}
        >
          {rewardIconByType[reward.type]}
        </span>
      );
    }
    if (isNext) {
      // The immediate goal: the one filled brand tile, white on cabbage.
      return (
        <span
          className={classNames(
            markerBase,
            'bg-accent-cabbage-default text-white',
          )}
        >
          {rewardIconByType[reward.type]}
        </span>
      );
    }
    return (
      <span
        className={classNames(
          markerBase,
          'opacity-60 border border-border-subtlest-tertiary bg-surface-float text-text-quaternary [&_svg]:size-4',
        )}
      >
        <LockIcon />
      </span>
    );
  };

  // The single right-hand action for this level. Exactly one of: claim the
  // reward, take action toward it, a "done" tick, or a lock - so the column of
  // actions reads cleanly top to bottom.
  const buildActionSlot = (): ReactElement | null => {
    if (canClaim) {
      return (
        <div className="relative">
          {celebrate && (
            <span
              aria-hidden
              className="z-10 pointer-events-none absolute inset-0 motion-reduce:hidden"
            >
              <span className="bg-accent-cheese-default/40 absolute inset-0 rounded-12 blur-md motion-safe:animate-claim-ring" />
              <span className="absolute inset-0 rounded-12 ring-2 ring-accent-cheese-default motion-safe:animate-claim-ring" />
              {claimSparkles.map((sparkle) => (
                <span
                  key={`${sparkle.tx}-${sparkle.ty}`}
                  className={classNames(
                    'absolute left-1/2 top-1/2 size-1.5 rounded-2 opacity-0 motion-safe:animate-reaction-burst',
                    sparkle.color,
                  )}
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
            size={ButtonSize.Small}
            variant={ButtonVariant.Primary}
            color={ButtonColor.Cheese}
            onClick={handleClaim}
            loading={isClaiming}
            icon={!isClaiming ? <GiftIcon /> : undefined}
            className={classNames(
              'relative',
              celebrate && 'motion-safe:animate-reward-pop',
            )}
          >
            Claim reward
          </Button>
        </div>
      );
    }
    if (isNext) {
      // The current goal's action lives below the progress bar, not in the
      // top-right slot, so it never overflows the card on narrow widths.
      return null;
    }
    if (isReached) {
      return (
        <FlexRow className="items-center gap-1 text-accent-avocado-default [&_svg]:size-4">
          <VIcon />
          <Typography bold type={TypographyType.Caption2}>
            Done
          </Typography>
        </FlexRow>
      );
    }
    return (
      <span className="text-text-quaternary [&_svg]:size-4">
        <LockIcon />
      </span>
    );
  };

  const requirementLabel =
    level.requiredApprovedAmount > 0
      ? formatDonationAmount(level.requiredApprovedAmount)
      : 'Free';
  const action = buildActionSlot();

  return (
    <FlexRow className="relative gap-4">
      <div className="relative flex w-10 shrink-0 flex-col items-center">
        <span className="relative z-1 flex size-10 shrink-0 items-center justify-center">
          {(isCurrent || isNext) && (
            <span
              aria-hidden
              className="bg-accent-cabbage-default/25 absolute -inset-1 rounded-16 blur-sm motion-safe:animate-glow-pulse"
            />
          )}
          <span
            className={classNames(
              'relative transition-transform',
              celebrate && isClaimed && 'motion-safe:animate-reward-pop',
            )}
          >
            {renderMarker()}
          </span>
        </span>
        {!isLast && <Connector fill={node.connector ?? { type: 'muted' }} />}
      </div>

      <div className={classNames('min-w-0 flex-1', isLast ? 'pb-1' : 'pb-8')}>
        <FlexCol
          className={classNames(
            'gap-3',
            // The current goal is a tight, clearly-bounded card so the eye lands
            // straight on its action; every other row stays a plain line. Plain
            // subtle border like any regular box.
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
              </FlexRow>
              <Typography
                tag={TypographyTag.Span}
                bold
                type={isNext ? TypographyType.Title3 : TypographyType.Callout}
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
                  className="[text-wrap:pretty]"
                >
                  {reward.description}
                </Typography>
              )}
            </FlexCol>

            {/* Right-hand slot for claim / done / lock. The current goal's
                action sits below the progress bar instead (see isNext). */}
            {action && (
              <div className="flex h-7 shrink-0 items-center">{action}</div>
            )}
          </FlexRow>

          {isNext && (
            <FlexCol className="gap-3">
              <FlexRow className="items-center gap-3">
                <div className="relative h-2 flex-1 overflow-hidden rounded-6 bg-surface-float">
                  <div
                    className="relative h-full overflow-hidden rounded-6 bg-accent-cabbage-default transition-[width] duration-500"
                    style={{ width: `${Math.round(segmentProgress * 100)}%` }}
                  >
                    <GivebackMeterShine
                      percentage={100}
                      radiusClassName="rounded-6"
                    />
                  </div>
                </div>
                <Typography
                  bold
                  type={TypographyType.Caption1}
                  className="shrink-0 tabular-nums text-text-tertiary"
                >
                  {formatDonationAmount(amountToNext)} to go
                </Typography>
              </FlexRow>
              <Button
                type="button"
                size={ButtonSize.Small}
                variant={ButtonVariant.Primary}
                className="w-full tablet:w-fit"
                onClick={onTakeAction}
              >
                Take action
              </Button>
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
  const { user } = useAuthContext();
  const { earnedPoints, isPending } = useGivebackContribution(true);
  const { rewardTiers } = useContributionRewards(true);
  const { claimedRewardIds } = useContributionUserRewards(true);
  const { claim, isPending: isClaiming } = useClaimContributionReward();
  const { causes: pickerCauses, selectedCauseIds } =
    useContributionCausePicker(true);
  const { actions } = useContributionActions(true);
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
          className="[text-wrap:pretty]"
        >
          Reward milestones are on the way. Keep taking action to unlock them.
        </Typography>
      </FlexCol>
    );
  }

  const approved = earnedPoints;
  const actionsTaken = actions.reduce(
    (sum, action) => sum + action.userCompletions,
    0,
  );
  const selectedNames = pickerCauses
    .filter((cause) => selectedCauseIds.includes(cause.id))
    .map((cause) => cause.title);
  const causeNames = formatCauseNames(selectedNames);
  const hasImpact = approved > 0;
  const total = levels.length;
  const nextIndex = levels.findIndex(
    (level) => level.requiredApprovedAmount > approved,
  );
  // "You're here" rides the goal you're climbing toward (the next unreached
  // level), so the face marker, the highlighted card and the progress bar all
  // land on one row — not split across the last-cleared and next levels. Once
  // every level is reached, focus the summit.
  const focusIndex = nextIndex === -1 ? total - 1 : nextIndex;
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

  // Progress within the current segment (last reached → next level). With
  // nothing reached yet the segment starts at 0, not the first tier's threshold
  // (otherwise the denominator collapses to 0 and the bar sticks at 0%).
  const previousAmount =
    reachedCount > 0 ? levels[reachedCount - 1].requiredApprovedAmount : 0;
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
      <FlexCol className="gap-8">
        <FlexCol className="gap-5">
          <GivebackTabHeading
            title={
              hasImpact ? (
                <>
                  You turned {actionsTaken}{' '}
                  {actionsTaken === 1 ? 'action' : 'actions'} into{' '}
                  <span className="bg-gradient-to-r from-accent-avocado-default via-accent-cabbage-default to-accent-cheese-default bg-clip-text text-transparent">
                    {formatDonationAmount(approved)}
                  </span>{' '}
                  for causes you love
                </>
              ) : (
                <>
                  Turn your everyday actions into{' '}
                  <span className="bg-gradient-to-r from-accent-avocado-default via-accent-cabbage-default to-accent-cheese-default bg-clip-text text-transparent">
                    real donations
                  </span>
                </>
              )
            }
            description={
              hasImpact && causeNames
                ? `Headed to ${causeNames}. Every action you take adds more, and it never costs you a thing.`
                : 'Every action you take sends real money to the causes you back. daily.dev funds it all, so you never pay a cent. Take your first one.'
            }
          />

          <FlexCol className="gap-3">
            <FlexRow className="flex-wrap items-center gap-3">
              <Button
                type="button"
                size={ButtonSize.Medium}
                variant={ButtonVariant.Primary}
                onClick={handleTakeAction}
              >
                Take action
              </Button>
              <Typography
                tag={TypographyTag.Span}
                type={TypographyType.Caption1}
                color={TypographyColor.Tertiary}
                className="tabular-nums"
              >
                {nextLevel
                  ? `${formatDonationAmount(amountToNext)} to your next reward`
                  : 'Every reward unlocked'}
              </Typography>
            </FlexRow>
            {claimableCount > 0 && (
              // A status note, not a tappable control: no pill background, just
              // the gift glyph + cheese text pointing down to the ladder.
              <FlexRow className="items-center gap-1.5 text-accent-cheese-default [&_svg]:size-4">
                <GiftIcon />
                <Typography bold type={TypographyType.Footnote}>
                  {claimableCount} {claimableCount === 1 ? 'reward' : 'rewards'}{' '}
                  ready to claim below
                </Typography>
              </FlexRow>
            )}
          </FlexCol>
        </FlexCol>

        <FlexCol className="max-w-2xl gap-4">
          <Typography
            tag={TypographyTag.Span}
            type={TypographyType.Caption1}
            color={TypographyColor.Tertiary}
            bold
            className="uppercase tracking-wider"
          >
            Rewards you unlock along the way
          </Typography>

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
                user={user ?? null}
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
      </FlexCol>
    </section>
  );
};
