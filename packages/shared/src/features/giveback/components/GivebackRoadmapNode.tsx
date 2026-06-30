import type { ReactElement } from 'react';
import React, { useEffect, useState } from 'react';
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
import type { LoggedUser } from '../../../lib/user';
import { ContributionRewardType } from '../types';
import { formatDonationAmount } from '../utils';
import { GivebackMeterShine } from './GivebackMeterShine';
import { Connector } from './GivebackRoadmapRail';
import type { RoadmapNode } from './givebackRoadmapTypes';

const rewardIconByType: Record<ContributionRewardType, ReactElement> = {
  [ContributionRewardType.Cores]: <CoreIcon />,
  [ContributionRewardType.PlusDays]: <DevPlusIcon />,
  [ContributionRewardType.Call]: <StarIcon />,
  [ContributionRewardType.Privilege]: <MedalBadgeIcon />,
  [ContributionRewardType.Custom]: <GiftIcon />,
};

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

// Contrast-first, branded palette so color carries meaning, not decoration:
//   • markers are calm surface tiles by default (high contrast on the dark page)
//   • green is only a "done" check accent, never a saturated fill
//   • cabbage (brand) is the single live accent: you, your next goal, claimable
//   • the summit alone gets a brand gradient fill so it reads as "the big one"
//   • locked stays muted/dimmed
//
// Rounded rectangles, not circles - the squircle marker echoes daily.dev's
// branding (square avatars, rounded app tiles) and reads as custom-built rather
// than a generic battle-pass dot.
const markerBase =
  'flex size-10 items-center justify-center rounded-12 [&_svg]:size-5';

export const NodeRow = ({
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

  // Clear the celebration once it has played so it can replay on a retry (e.g.
  // after a failed claim) and never leaves the reward-pop class stuck on.
  useEffect(() => {
    if (!celebrate) {
      return undefined;
    }
    const timer = setTimeout(() => setCelebrate(false), 700);
    return () => clearTimeout(timer);
  }, [celebrate]);

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
