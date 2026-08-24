import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import { IconSize } from '../Icon';
import {
  HotIcon,
  MedalBadgeIcon,
  ReputationLightningIcon,
  StarIcon,
} from '../icons';

const xpSegmentCount = 10;

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
  xpToNextLevel,
  currentStreak,
  longestStreak,
  achievements,
  isPending,
}: LevelHudProps): ReactElement => {
  const filledSegments = Math.round((levelProgress / 100) * xpSegmentCount);
  const streakValue = isPending ? '...' : `${currentStreak.toLocaleString()}d`;
  const longestValue = isPending ? '...' : `${longestStreak.toLocaleString()}d`;

  return (
    <div className="overflow-hidden rounded-20 border border-border-subtlest-tertiary">
      <div className="flex flex-col gap-3 bg-[#2A0B3D] p-4 tablet:px-5">
        <div className="flex items-center gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-12 shrink-0 flex-col items-center justify-center rounded-12 bg-accent-cabbage-default text-white">
              <Typography
                type={TypographyType.Subhead}
                className="leading-none text-white"
              >
                LVL
              </Typography>
              <Typography
                type={TypographyType.Title3}
                bold
                className="leading-none text-white"
              >
                {level}
              </Typography>
            </div>
            <Typography
              type={TypographyType.Callout}
              bold
              className="truncate text-white"
            >
              {xpToNextLevel.toLocaleString()} XP to level {level + 1}
            </Typography>
          </div>
        </div>
        <div className="flex gap-1" aria-hidden>
          {Array.from({ length: xpSegmentCount }, (_, index) => (
            <span
              key={index}
              className={classNames(
                'h-2 flex-1 rounded-4',
                index < filledSegments ? 'bg-[#E669FB]' : 'bg-[#5A1E75]',
              )}
            />
          ))}
        </div>
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
