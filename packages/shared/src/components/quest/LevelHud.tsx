import type { ReactElement } from 'react';
import React from 'react';
import {
  Typography,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';
import { ProgressBar } from '../fields/ProgressBar';
import { gameCenterLevelBackground } from '../../lib/image';

type HudStatProps = {
  label: string;
  value: string;
};

const HudStat = ({ label, value }: HudStatProps): ReactElement => (
  <div className="flex items-baseline gap-1.5">
    <Typography type={TypographyType.Subhead} className="text-white opacity-64">
      {label}
    </Typography>
    <Typography type={TypographyType.Callout} bold className="text-white">
      {value}
    </Typography>
  </div>
);

// Off-token purples, so these stay inline rather than fighting the
// no-custom-color rule with arbitrary classes.
const levelPanelStyle = {
  backgroundColor: '#2A0B3D',
  backgroundImage: [
    // A dark wash over the art, so the level, bar and readout keep their
    // contrast wherever the artwork happens to be bright.
    'linear-gradient(100deg, rgba(42,11,61,0.94) 0%, rgba(42,11,61,0.70) 42%, rgba(42,11,61,0.42) 100%)',
    `url("${gameCenterLevelBackground}")`,
  ].join(', '),
  backgroundSize: 'auto, cover',
  backgroundPosition: 'center, 46% 50%',
};

// Frosted glass over the patterned panel: a translucent white wash, a
// lit top edge and a soft border, so the panel's pattern shows through.
const levelBadgeStyle = {
  background:
    'linear-gradient(145deg, rgba(255,255,255,0.42), rgba(255,255,255,0.10))',
  border: '1px solid rgba(255,255,255,0.45)',
};

export interface LevelHudProps {
  name: string;
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
  name,
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

  const stats: HudStatProps[] = [
    {
      label: 'Streak',
      value: streakValue,
    },
    {
      label: 'Longest',
      value: longestValue,
    },
    ...(achievements
      ? [
          {
            label: 'Badges',
            value: `${achievements.unlocked}/${achievements.total}`,
          },
        ]
      : []),
    {
      label: 'Total XP',
      value: isPending ? '...' : totalXp.toLocaleString(),
    },
  ];

  return (
    <div
      className="flex flex-col gap-4 px-4 py-8 tablet:px-8 tablet:py-10"
      style={levelPanelStyle}
    >
      <div className="flex items-center gap-3">
        <div
          className="flex size-14 shrink-0 items-center justify-center rounded-16 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.55),inset_0_-1px_0_rgba(255,255,255,0.12),0_8px_24px_-8px_rgba(0,0,0,0.65)] backdrop-blur-[6px]"
          style={levelBadgeStyle}
          aria-label={`Level ${level}`}
        >
          <Typography
            type={TypographyType.Title2}
            className="w-full text-center !font-black tabular-nums !leading-none"
          >
            {level}
          </Typography>
        </div>
        <Typography
          tag={TypographyTag.H1}
          type={TypographyType.Title1}
          bold
          className="min-w-0 truncate text-white"
        >
          {name}, here&apos;s how you&apos;re doing.
        </Typography>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <ProgressBar
          percentage={levelProgress}
          shouldShowBg
          className={{
            wrapper: 'h-2 rounded-max !bg-[#5A1E75]',
            bar: 'h-full rounded-max',
            barColor: 'bg-[#E669FB]',
          }}
        />
        <div className="flex items-baseline justify-between gap-3">
          <Typography
            type={TypographyType.Subhead}
            bold
            className="tabular-nums text-white"
          >
            {xpInLevel.toLocaleString()} /{' '}
            {(xpInLevel + xpToNextLevel).toLocaleString()}
          </Typography>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        {stats.map((stat) => (
          <HudStat key={stat.label} {...stat} />
        ))}
      </div>
    </div>
  );
};
