import type { ReactElement } from 'react';
import React from 'react';
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
import { useGivebackContext } from '../GivebackContext';
import { useGivebackNav } from '../GivebackNavContext';
import { formatDonationAmount, getGoalProgressPercentage } from '../utils';

// Circular level meter that wraps the level number, filling toward the next
// level. Uses the same stroke technique as the shared ProgressCircle.
const LevelProgressRing = ({
  level,
  percentage,
}: {
  level: number;
  percentage: number;
}): ReactElement => {
  const size = 46;
  const stroke = 4;
  const radius = size / 2 - stroke / 2 - 1;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(100, Math.max(0, percentage));
  const strokeDashoffset = circumference * (1 - clamped / 100);

  return (
    <div
      className="relative inline-flex shrink-0 items-center justify-center"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`Level ${level}, ${Math.round(percentage)}% to next level`}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className="stroke-border-subtlest-tertiary"
          strokeWidth={stroke}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className="stroke-brand-default transition-[stroke-dashoffset] duration-700 ease-out"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          fill="transparent"
        />
      </svg>
      <span
        aria-hidden
        className="absolute font-bold leading-none text-accent-cabbage-default typo-caption1"
      >
        Lv {level}
      </span>
    </div>
  );
};

// Persistent personal-progress bar. Deliberately spare: your level, the exact
// amount you've unlocked (the same earned total the board and "Your
// contribution" card show), one explicit next step, and the CTA — nothing else
// competing for attention in the thumb zone.
export const GivebackFundingBar = (): ReactElement => {
  const { campaign, levels, userProfile, leaderboard, donationAccounting } =
    useGivebackContext();
  const { setActiveTab } = useGivebackNav();

  // Money unlocked = the same earned total (unlocked minus rejected) shown
  // everywhere else, so the bar never disagrees with the page.
  const earned =
    donationAccounting.unlockedDonationAmount -
    donationAccounting.rejectedDonationAmount;

  // Level fills are gated by the validated (approved) amount, matching the
  // journey logic elsewhere.
  const approved = userProfile.approvedContributionAmount;
  const currentLevel =
    levels.find((level) => level.levelNumber === userProfile.currentLevel) ??
    levels[0];
  const nextLevel = levels.find(
    (level) => level.requiredApprovedAmount > approved,
  );
  const levelFloor = currentLevel.requiredApprovedAmount;
  const levelPercentage = nextLevel
    ? getGoalProgressPercentage(
        approved - levelFloor,
        nextLevel.requiredApprovedAmount - levelFloor,
      )
    : 100;
  const amountToNextLevel = nextLevel
    ? Math.max(0, nextLevel.requiredApprovedAmount - approved)
    : 0;

  // The single explicit next step: the exact amount that overtakes the next
  // person on the board (the closest, most motivating goal).
  const currentUser = leaderboard.find((entry) => entry.isCurrentUser);
  const aboveUser = currentUser
    ? leaderboard.find((entry) => entry.rank === currentUser.rank - 1)
    : undefined;
  const gapToNext =
    aboveUser && currentUser
      ? aboveUser.contributionAmount - currentUser.contributionAmount
      : 0;

  const renderNextStep = (): ReactElement => {
    if (aboveUser && currentUser) {
      return (
        <>
          <span className="font-bold text-accent-avocado-default">
            {formatDonationAmount(gapToNext, currentUser.currency)}
          </span>{' '}
          to pass{' '}
          <span className="font-bold text-text-primary">{aboveUser.name}</span>{' '}
          and reach #{aboveUser.rank}
        </>
      );
    }

    if (nextLevel) {
      return (
        <>
          <span className="font-bold text-accent-avocado-default">
            {formatDonationAmount(amountToNextLevel, campaign.currency)}
          </span>{' '}
          to reach {nextLevel.name}
        </>
      );
    }

    return <>You&apos;re #1. Hold the crown.</>;
  };

  return (
    <div className="pointer-events-none sticky bottom-0 z-3">
      <div className="bg-background-default/80 pointer-events-auto relative mx-auto w-full max-w-6xl border-t border-border-subtlest-secondary px-4 py-3 backdrop-blur-xl tablet:rounded-t-16 tablet:border-x">
        {/* Brand hairline along the top edge, matching the sticky tabs bar. */}
        <div
          aria-hidden
          className="via-accent-cabbage-default/40 pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent to-transparent"
        />

        <FlexRow className="items-center justify-between gap-4">
          <FlexRow className="min-w-0 flex-1 items-center gap-3">
            <LevelProgressRing
              level={currentLevel.levelNumber}
              percentage={levelPercentage}
            />

            <FlexCol className="min-w-0 gap-0.5">
              <FlexRow className="min-w-0 items-baseline gap-1.5">
                <Typography
                  tag={TypographyTag.Span}
                  type={TypographyType.Callout}
                  bold
                  className="shrink-0 tabular-nums text-status-success"
                >
                  {formatDonationAmount(earned, campaign.currency)}
                </Typography>
                <Typography
                  tag={TypographyTag.Span}
                  type={TypographyType.Caption1}
                  color={TypographyColor.Tertiary}
                  className="truncate"
                >
                  unlocked
                  <span className="hidden tablet:inline"> for your causes</span>
                </Typography>
              </FlexRow>

              <Typography
                tag={TypographyTag.Span}
                type={TypographyType.Caption1}
                color={TypographyColor.Tertiary}
                className="truncate"
              >
                {renderNextStep()}
              </Typography>
            </FlexCol>
          </FlexRow>

          <Button
            type="button"
            variant={ButtonVariant.Primary}
            size={ButtonSize.Medium}
            onClick={() => setActiveTab('actions')}
            className="shrink-0"
          >
            Take action
          </Button>
        </FlexRow>
      </div>
    </div>
  );
};
