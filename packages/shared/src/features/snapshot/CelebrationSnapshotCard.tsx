import type { ReactElement } from 'react';
import React, { forwardRef } from 'react';
import colors from '../../styles/colors';
import { largeNumberFormat } from '../../lib/numberFormat';
import { SnapshotEyebrow } from './SnapshotEyebrow';
import { SnapshotFrame } from './SnapshotFrame';
import type { SnapshotIdentityProps } from './SnapshotIdentity';
import { SnapshotIdentity } from './SnapshotIdentity';
import { SnapshotLevelRing } from './SnapshotLevelRing';
import {
  SnapshotStat,
  SnapshotStatRow,
  SnapshotStatValue,
} from './SnapshotStats';

const MUTED = colors.salt['90'];

export interface CelebrationSnapshotCardProps {
  user: SnapshotIdentityProps;
  level: number;
  levelProgress: number;
  totalXp: number;
  questsCompleted: number;
  headline?: string;
  seed?: string;
}

function CelebrationSnapshotCardComponent(
  {
    user,
    level,
    levelProgress,
    totalXp,
    questsCompleted,
    headline,
    seed,
  }: CelebrationSnapshotCardProps,
  ref: React.Ref<HTMLDivElement>,
): ReactElement {
  return (
    <SnapshotFrame
      logoAside={<SnapshotEyebrow label="Level up" />}
      ref={ref}
      seed={seed ?? `level-${level}`}
      watermark="🎉"
    >
      <div className="flex flex-1 flex-col">
        <SnapshotIdentity {...user} />

        <div className="flex flex-1 flex-col items-center justify-center gap-6">
          <SnapshotLevelRing
            fontSize={92}
            level={level}
            progress={levelProgress}
            size={268}
            stroke={20}
          />
          <span
            className="text-center font-bold text-white"
            style={{ fontSize: 54, lineHeight: 1.15 }}
          >
            {headline ?? `Level ${level} reached`}
          </span>
          <span style={{ color: MUTED, fontSize: 28 }}>
            {Math.round(levelProgress)}% of the way to level {level + 1}
          </span>
        </div>

        <SnapshotStatRow>
          <SnapshotStat
            label="Total XP"
            value={
              <SnapshotStatValue>
                {largeNumberFormat(totalXp) ?? totalXp}
              </SnapshotStatValue>
            }
          />
          <SnapshotStat
            label="Quests done"
            value={
              <SnapshotStatValue>
                {largeNumberFormat(questsCompleted) ?? questsCompleted}
              </SnapshotStatValue>
            }
          />
        </SnapshotStatRow>
      </div>
    </SnapshotFrame>
  );
}

export const CelebrationSnapshotCard = forwardRef(
  CelebrationSnapshotCardComponent,
);
