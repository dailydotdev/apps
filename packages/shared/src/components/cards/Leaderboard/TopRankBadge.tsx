import type { ReactElement } from 'react';
import React from 'react';
import { MedalBadgeIcon } from '../../icons/MedalBadge';
import { IconSize } from '../../Icon';
import { TOP_RANK_STYLES } from './common';

const SPARK_COUNT = 5;

interface TopRankBadgeProps {
  rankIndex: number;
}

export function TopRankBadge({ rankIndex }: TopRankBadgeProps): ReactElement {
  const rankStyle = TOP_RANK_STYLES[rankIndex];

  if (!rankStyle) {
    return <span className="w-8 shrink-0" />;
  }

  return (
    <span className="relative flex w-8 shrink-0 items-center justify-center pl-1">
      <span
        className="pointer-events-none absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-40"
        style={{ backgroundColor: rankStyle.glowColor }}
      />
      <span className="leaderboard-medal-wrapper relative transition-transform duration-300">
        <MedalBadgeIcon
          size={IconSize.Small}
          secondary
          className={rankStyle.iconColor}
        />
        <span className="pointer-events-none absolute inset-0">
          {Array.from({ length: SPARK_COUNT }, (_, i) => (
            <span
              key={i}
              className="leaderboard-medal-spark gear-medal-spark absolute left-1/2 top-1/2 h-1 w-1 rounded-full"
            />
          ))}
        </span>
      </span>
    </span>
  );
}
