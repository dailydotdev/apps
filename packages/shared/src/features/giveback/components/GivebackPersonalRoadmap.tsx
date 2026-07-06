import type { ReactElement } from 'react';
import React, { useMemo, useState } from 'react';
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
import { ArrowIcon, GiftIcon } from '../../../components/icons';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent } from '../../../lib/log';
import { useGivebackContribution } from '../hooks/useGivebackContribution';
import { useContributionRewards } from '../hooks/useContributionRewards';
import { useContributionUserRewards } from '../hooks/useContributionUserRewards';
import { useClaimContributionReward } from '../hooks/useClaimContributionReward';
import { useContributionCausePicker } from '../hooks/useContributionCausePicker';
import { useContributionActions } from '../hooks/useContributionActions';
import { formatDonationAmount } from '../utils';
import { GivebackTabHeading } from './GivebackTabHeading';
import { RailToggle } from './GivebackRoadmapRail';
import { NodeRow } from './GivebackRoadmapNode';
import type {
  ConnectorFill,
  RoadmapLevel,
  RoadmapNode,
} from './givebackRoadmapTypes';
import { GivebackFoundingAward } from './rewards/GivebackFoundingAward';
import { RewardRevealDialog } from './rewards/GivebackRewardReveal';
import { resolveRewardReveal } from './rewards/rewardReveal';

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
  // The tier whose reward reveal is open (set after a successful claim).
  const [revealTierId, setRevealTierId] = useState<string | null>(null);
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
      // Only reveal the reward once the claim has actually landed.
      setRevealTierId(tierId);
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

  const revealTier = revealTierId
    ? rewardTiers.find((tier) => tier.id === revealTierId)
    : undefined;
  const revealLevel = revealTierId
    ? levels.find((level) => level.id === revealTierId)
    : undefined;

  return (
    <>
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
                    ? `${formatDonationAmount(
                        amountToNext,
                      )} to your next reward`
                    : 'Every reward unlocked'}
                </Typography>
              </FlexRow>
              {claimableCount > 0 && (
                // A status note, not a tappable control: no pill background, just
                // the gift glyph + cheese text pointing down to the ladder.
                <FlexRow className="items-center gap-1.5 text-accent-cheese-default [&_svg]:size-4">
                  <GiftIcon />
                  <Typography bold type={TypographyType.Footnote}>
                    {claimableCount}{' '}
                    {claimableCount === 1 ? 'reward' : 'rewards'} ready to claim
                    below
                  </Typography>
                </FlexRow>
              )}
            </FlexCol>
          </FlexCol>

          {/* The founding award is the journey's special first step. It sits above
            the reward ladder and is gated (like the whole tab) behind the
            giveback flag. */}
          <div className="max-w-2xl">
            <GivebackFoundingAward
              initialState={approved > 0 ? 'claimable' : 'intro'}
              onTakeAction={handleTakeAction}
            />
          </div>

          <FlexCol className="max-w-2xl gap-4">
            <Typography
              tag={TypographyTag.Span}
              type={TypographyType.Caption1}
              color={TypographyColor.Tertiary}
              bold
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
      {revealTier && (
        <RewardRevealDialog
          reveal={resolveRewardReveal(revealTier)}
          levelNumber={revealLevel?.levelNumber}
          user={user ?? null}
          onClose={() => setRevealTierId(null)}
        />
      )}
    </>
  );
};
