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

type HudStat = {
  icon: ReactElement;
  label: string;
  value: string;
};

const HudStatTile = ({
  icon,
  label,
  value,
  className,
}: HudStat & { className?: string }): ReactElement => (
  <div
    className={classNames(
      'flex flex-col gap-1 rounded-14 bg-background-subtle p-4',
      className,
    )}
  >
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

// Off-token purples, so these stay inline rather than fighting the
// no-custom-color rule with arbitrary classes.
const levelPanelStyle = {
  backgroundColor: '#2A0B3D',
  backgroundImage: [
    'radial-gradient(circle at 14% 22%, rgba(230,105,251,0.32), transparent 58%)',
    'radial-gradient(circle at 94% 86%, rgba(122,63,255,0.30), transparent 62%)',
    'repeating-linear-gradient(115deg, rgba(255,255,255,0.05) 0 1px, transparent 1px 14px)',
    'radial-gradient(rgba(255,255,255,0.10) 1px, transparent 1px)',
  ].join(', '),
  backgroundSize: 'auto, auto, auto, 16px 16px',
};

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

  const stats: HudStat[] = [
    {
      icon: (
        <HotIcon
          secondary
          size={IconSize.Size16}
          className="text-accent-bun-default"
        />
      ),
      label: 'Streak',
      value: streakValue,
    },
    {
      icon: (
        <StarIcon
          secondary
          size={IconSize.Size16}
          className="text-accent-cheese-default"
        />
      ),
      label: 'Longest',
      value: longestValue,
    },
    ...(achievements
      ? [
          {
            icon: (
              <MedalBadgeIcon
                size={IconSize.Size16}
                className="text-accent-cheese-default"
              />
            ),
            label: 'Badges',
            value: `${achievements.unlocked}/${achievements.total}`,
          },
        ]
      : []),
    {
      icon: (
        <ReputationLightningIcon
          secondary
          size={IconSize.Size16}
          className="text-accent-onion-default"
        />
      ),
      label: 'Total XP',
      value: isPending ? '...' : totalXp.toLocaleString(),
    },
  ];

  return (
    <div className="grid gap-2 rounded-20 border border-border-subtlest-tertiary p-2 tablet:grid-cols-2">
      <div
        className="flex flex-col justify-center gap-2 overflow-hidden rounded-14 p-4 tablet:px-5"
        style={levelPanelStyle}
      >
        {/* The number stands alone, so the chip carries the meaning for
            screen readers. */}
        <div
          className="mb-2 flex size-18 shrink-0 items-center justify-center rounded-16 border-4 border-white bg-white text-accent-cabbage-default"
          aria-label={`Level ${level}`}
        >
          <Typography
            type={TypographyType.Mega2}
            bold
            // Centering the em box leaves digits sitting low: the box
            // reserves descender space the glyphs never use.
            className="-translate-y-[0.75px] !font-black tabular-nums !leading-none"
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
      <div className="grid grid-cols-2 gap-2">
        {stats.map((stat, index) => (
          <HudStatTile
            key={stat.label}
            {...stat}
            className={classNames(
              // An odd stat count would otherwise leave a hole in the 2x2.
              stats.length % 2 === 1 &&
                index === stats.length - 1 &&
                'col-span-2',
            )}
          />
        ))}
      </div>
    </div>
  );
};
