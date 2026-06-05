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
import { VolumeIcon, VolumeOffIcon } from '../../../components/icons';
import { useGivebackContext } from '../GivebackContext';
import { useGivebackNav } from '../GivebackNavContext';
import { useGivebackSound } from '../useGivebackSound';
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

// Persistent personal-progress bar. Keeps your level, contribution and the
// primary "take action" CTA one tap away while you read the rest of the page
// (thumb zone on mobile).
export const GivebackFundingBar = (): ReactElement => {
  const { campaign, levels, userProfile } = useGivebackContext();
  const { setActiveTab } = useGivebackNav();
  const { enabled: soundEnabled, toggle: toggleSound } = useGivebackSound();

  const approved = userProfile.approvedContributionAmount;
  const currentLevel =
    levels.find((level) => level.levelNumber === userProfile.currentLevel) ??
    levels[0];
  const topLevel = levels[levels.length - 1];
  const nextLevel = levels.find(
    (level) => level.requiredApprovedAmount > approved,
  );
  const amountToNext = nextLevel
    ? Math.max(0, nextLevel.requiredApprovedAmount - approved)
    : 0;
  const percentage = getGoalProgressPercentage(
    approved,
    topLevel.requiredApprovedAmount,
  );

  const subline = nextLevel
    ? `${formatDonationAmount(amountToNext, campaign.currency)} to ${
        nextLevel.name
      }. One action gets you closer.`
    : `Top level reached. You're a ${topLevel.name}.`;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-3">
      <div className="bg-background-default/80 pointer-events-auto relative mx-auto w-full max-w-6xl border-t border-border-subtlest-secondary px-4 py-3 backdrop-blur-xl tablet:rounded-t-16 tablet:border-x">
        <FlexRow className="items-center justify-between gap-4">
          <FlexRow className="min-w-0 items-center gap-3">
            <LevelProgressRing
              level={currentLevel.levelNumber}
              percentage={percentage}
            />
            <FlexCol className="min-w-0 gap-0.5">
              <FlexRow className="items-center gap-2">
                <Typography
                  tag={TypographyTag.Span}
                  type={TypographyType.Callout}
                  bold
                >
                  {formatDonationAmount(approved, campaign.currency)}
                </Typography>
                <Typography
                  tag={TypographyTag.Span}
                  type={TypographyType.Caption1}
                  color={TypographyColor.Tertiary}
                >
                  unlocked
                </Typography>
              </FlexRow>
              <Typography
                tag={TypographyTag.Span}
                type={TypographyType.Caption1}
                color={TypographyColor.Tertiary}
                className="truncate"
              >
                {subline}
              </Typography>
            </FlexCol>
          </FlexRow>

          <FlexRow className="shrink-0 items-center gap-2">
            <Button
              type="button"
              variant={ButtonVariant.Tertiary}
              size={ButtonSize.Medium}
              icon={soundEnabled ? <VolumeIcon /> : <VolumeOffIcon />}
              onClick={toggleSound}
              aria-pressed={soundEnabled}
              aria-label={
                soundEnabled
                  ? 'Mute celebration sounds'
                  : 'Unmute celebration sounds'
              }
            />
            <Button
              type="button"
              variant={ButtonVariant.Primary}
              size={ButtonSize.Medium}
              onClick={() => setActiveTab('actions')}
            >
              Take action
            </Button>
          </FlexRow>
        </FlexRow>
      </div>
    </div>
  );
};
