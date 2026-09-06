import type { ReactElement } from 'react';
import React, { forwardRef } from 'react';
import colors from '../../styles/colors';
import { largeNumberFormat } from '../../lib';
import { SnapshotFrame } from './SnapshotFrame';
import type { SnapshotIdentityProps } from './SnapshotIdentity';
import { SnapshotIdentity } from './SnapshotIdentity';

const MUTED = colors.salt['90'];
const DIVIDER = colors.pepper['10'];

const TILE_SIZE = 104;

export interface UnlockedAchievement {
  name: string;
  image?: string;
  emoji?: string;
}

export interface AchievementsSnapshotCardProps {
  user: Omit<SnapshotIdentityProps, 'label'>;
  unlocked: number;
  total: number;
  points: number;
  achievements: UnlockedAchievement[];
  seed?: string;
}

const Tile = ({
  value,
  label,
}: {
  value: string;
  label: string;
}): ReactElement => (
  <div
    className="flex flex-1 flex-col items-center justify-center gap-1 rounded-24"
    style={{
      padding: '20px 16px',
      border: `1px solid ${DIVIDER}`,
      background: 'rgba(255, 255, 255, 0.03)',
    }}
  >
    <span
      className="font-bold text-white"
      style={{ fontSize: 52, lineHeight: 1 }}
    >
      {value}
    </span>
    <span style={{ color: MUTED, fontSize: 24, lineHeight: 1.3 }}>{label}</span>
  </div>
);

function AchievementsSnapshotCardComponent(
  {
    user,
    unlocked,
    total,
    points,
    achievements,
    seed,
  }: AchievementsSnapshotCardProps,
  ref: React.Ref<HTMLDivElement>,
): ReactElement {
  return (
    <SnapshotFrame ref={ref} seed={seed ?? 'achievements'}>
      <div className="flex flex-1 flex-col gap-6">
        <SnapshotIdentity {...user} label="Achievements" />

        <div className="flex gap-4">
          <Tile label={`of ${total} unlocked`} value={String(unlocked)} />
          <Tile
            label="Achievement points"
            value={largeNumberFormat(points) ?? String(points)}
          />
        </div>

        <div className="mt-auto flex flex-col gap-3">
          <span style={{ color: MUTED, fontSize: 26 }}>Rarest unlocked</span>
          <div className="grid grid-cols-5 gap-4">
            {achievements.slice(0, 10).map((achievement) => (
              <span
                key={achievement.name}
                className="flex items-center justify-center overflow-hidden rounded-20"
                style={{
                  width: TILE_SIZE,
                  height: TILE_SIZE,
                  border: `1px solid ${DIVIDER}`,
                  background: 'rgba(255, 255, 255, 0.04)',
                }}
              >
                {achievement.image ? (
                  <img
                    src={achievement.image}
                    alt=""
                    crossOrigin="anonymous"
                    className="block size-full object-cover"
                  />
                ) : (
                  <span style={{ fontSize: 54, lineHeight: 1 }}>
                    {achievement.emoji}
                  </span>
                )}
              </span>
            ))}
          </div>
        </div>
      </div>
    </SnapshotFrame>
  );
}

export const AchievementsSnapshotCard = forwardRef(
  AchievementsSnapshotCardComponent,
);
