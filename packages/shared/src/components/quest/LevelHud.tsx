import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import { IconSize } from '../Icon';
import { ProgressBar } from '../fields/ProgressBar';
import {
  HotIcon,
  MedalBadgeIcon,
  ReputationLightningIcon,
  StarIcon,
} from '../icons';

const HudStatTile = ({
  icon,
  label,
  value,
}: {
  icon: ReactElement;
  label: string;
  value: string;
}): ReactElement => (
  <div className="flex flex-col gap-1 bg-background-default p-4">
    <div className="flex items-center gap-1.5 text-text-tertiary">
      {icon}
      <Typography
        type={TypographyType.Subhead}
        color={TypographyColor.Tertiary}
      >
        {label}
      </Typography>
    </div>
    <Typography type={TypographyType.Title3} bold>
      {value}
    </Typography>
  </div>
);

export interface LevelHudProps {
  level: number;
  levelProgress: number;
  totalXp: number;
  xpInLevel: number;
  xpToNextLevel: number;
  currentStreak: number;
  longestStreak: number;
  achievements?: { unlocked: number; total: number };
  isPending: boolean;
}

export const LevelHud = ({
  level,
  levelProgress,
  totalXp,
  xpInLevel,
  xpToNextLevel,
  currentStreak,
  longestStreak,
  achievements,
  isPending,
}: LevelHudProps): ReactElement => {
  const streakValue = isPending ? '...' : `${currentStreak.toLocaleString()}d`;
  const longestValue = isPending ? '...' : `${longestStreak.toLocaleString()}d`;

  return (
    <div className="overflow-hidden rounded-20 border border-border-subtlest-tertiary">
      <div className="flex flex-col gap-2 bg-[#2A0B3D] p-4 tablet:px-5">
        {/* The number stands alone, so the chip carries the meaning for
            screen readers. */}
        <div
          className="flex size-12 shrink-0 items-center justify-center rounded-12 bg-accent-cabbage-default text-white"
          aria-label={`Level ${level}`}
        >
          <Typography
            type={TypographyType.Title1}
            bold
            className="leading-none text-white"
          >
            {level}
          </Typography>
        </div>
        <ProgressBar
          percentage={levelProgress}
          shouldShowBg
          className={{
            wrapper: 'h-2 rounded-max !bg-[#5A1E75]',
            bar: 'h-full rounded-max',
            barColor: 'bg-[#E669FB]',
          }}
        />
        <Typography
          type={TypographyType.Callout}
          bold
          className="truncate text-white"
        >
          {xpInLevel.toLocaleString()} /{' '}
          {(xpInLevel + xpToNextLevel).toLocaleString()}
        </Typography>
      </div>
      <div
        className={classNames(
          'grid grid-cols-2 gap-px bg-border-subtlest-tertiary',
          achievements ? 'tablet:grid-cols-4' : 'tablet:grid-cols-3',
        )}
      >
        <HudStatTile
          icon={
            <HotIcon
              secondary
              size={IconSize.Size16}
              className="text-accent-bun-default"
            />
          }
          label="Streak"
          value={streakValue}
        />
        <HudStatTile
          icon={
            <StarIcon
              secondary
              size={IconSize.Size16}
              className="text-accent-cheese-default"
            />
          }
          label="Longest"
          value={longestValue}
        />
        {achievements ? (
          <HudStatTile
            icon={
              <MedalBadgeIcon
                size={IconSize.Size16}
                className="text-accent-cheese-default"
              />
            }
            label="Badges"
            value={`${achievements.unlocked}/${achievements.total}`}
          />
        ) : null}
        <HudStatTile
          icon={
            <ReputationLightningIcon
              secondary
              size={IconSize.Size16}
              className="text-accent-onion-default"
            />
          }
          label="Total XP"
          value={isPending ? '...' : totalXp.toLocaleString()}
        />
      </div>
    </div>
  );
};
