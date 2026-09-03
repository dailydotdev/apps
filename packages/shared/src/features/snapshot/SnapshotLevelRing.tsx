import type { ReactElement } from 'react';
import React from 'react';
import colors from '../../styles/colors';
import { SNAPSHOT_STAT_HEIGHT } from './SnapshotStats';

interface SnapshotLevelRingProps {
  level: number;
  progress: number;
  size?: number;
  stroke?: number;
  fontSize?: number;
}

export function SnapshotLevelRing({
  level,
  progress,
  size = SNAPSHOT_STAT_HEIGHT,
  stroke = 10,
  fontSize = 40,
}: SnapshotLevelRingProps): ReactElement {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const safeProgress = Math.max(0, Math.min(progress, 100));

  return (
    <span
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        fill="none"
        style={{ transform: 'rotate(-90deg)' }}
        aria-hidden
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          stroke={colors.pepper['30']}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          strokeLinecap="round"
          stroke={colors.avocado['40']}
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - safeProgress / 100)}
        />
      </svg>
      <span
        className="absolute font-bold text-white"
        style={{ fontSize, lineHeight: 1 }}
      >
        {level}
      </span>
    </span>
  );
}
