import type { ReactElement } from 'react';
import React, { forwardRef } from 'react';
import colors from '../../styles/colors';
import { SnapshotFrame } from './SnapshotFrame';
import type { SnapshotIdentityProps } from './SnapshotIdentity';
import { SnapshotIdentity } from './SnapshotIdentity';

const MUTED = colors.salt['90'];
const DIVIDER = colors.pepper['10'];

export interface StreakSnapshotCardProps {
  user: Omit<SnapshotIdentityProps, 'label'>;
  days: number;
  milestone?: string;
  longestStreak: number;
  totalReadingDays: number;
  seed?: string;
}

function StreakSnapshotCardComponent(
  {
    user,
    days,
    milestone,
    longestStreak,
    totalReadingDays,
    seed,
  }: StreakSnapshotCardProps,
  ref: React.Ref<HTMLDivElement>,
): ReactElement {
  return (
    <SnapshotFrame ref={ref} seed={seed ?? `streak-${days}`} watermark="🔥">
      <div className="flex flex-1 flex-col">
        <SnapshotIdentity {...user} label="Reading streak" />

        <div className="flex flex-1 flex-col justify-center">
          <span
            className="font-bold text-white"
            style={{
              fontSize: 168,
              lineHeight: 0.95,
              letterSpacing: '-0.03em',
            }}
          >
            {days}
          </span>
          <span
            className="font-bold text-white"
            style={{ fontSize: 46, lineHeight: 1.1 }}
          >
            day reading streak
          </span>
          {milestone && (
            <span
              className="mt-3"
              style={{ color: colors.cabbage['10'], fontSize: 30 }}
            >
              {milestone}
            </span>
          )}
        </div>

        <div
          className="flex items-center gap-8"
          style={{ paddingTop: 26, borderTop: `1px solid ${DIVIDER}` }}
        >
          <span style={{ color: MUTED, fontSize: 26 }}>
            Longest streak {longestStreak}
          </span>
          <span style={{ color: MUTED, fontSize: 26 }}>
            Total reading days {totalReadingDays}
          </span>
        </div>
      </div>
    </SnapshotFrame>
  );
}

export const StreakSnapshotCard = forwardRef(StreakSnapshotCardComponent);
