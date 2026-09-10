import type { ReactElement } from 'react';
import React, { forwardRef } from 'react';
import colors from '../../styles/colors';
import { largeNumberFormat } from '../../lib/numberFormat';
import { SnapshotEyebrow } from './SnapshotEyebrow';
import { SnapshotFrame } from './SnapshotFrame';
import type { SnapshotIdentityProps } from './SnapshotIdentity';
import { SnapshotIdentity } from './SnapshotIdentity';
import { SnapshotTile } from './SnapshotStats';

const MUTED = colors.salt['90'];
const DIVIDER = colors.pepper['10'];

const TILE_SIZE = 104;

export interface UnlockedAchievement {
  name: string;
  image?: string;
  emoji?: string;
}

export interface AchievementsSnapshotCardProps {
  user: SnapshotIdentityProps;
  unlocked: number;
  total: number;
  /** Left out when zero, as is the rarest row when there is nothing in it. */
  points: number;
  achievements: UnlockedAchievement[];
  seed?: string;
}

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
    <SnapshotFrame
      logoAside={<SnapshotEyebrow label="Achievements" />}
      ref={ref}
      seed={seed ?? 'achievements'}
    >
      <div className="flex flex-1 flex-col gap-6">
        <SnapshotIdentity {...user} />

        <div className="flex gap-4">
          <SnapshotTile
            label={`of ${total} unlocked`}
            value={String(unlocked)}
          />
          {points > 0 && (
            <SnapshotTile
              label="Achievement points"
              value={largeNumberFormat(points) ?? String(points)}
            />
          )}
        </div>

        {achievements.length > 0 && (
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
        )}
      </div>
    </SnapshotFrame>
  );
}

export const AchievementsSnapshotCard = forwardRef(
  AchievementsSnapshotCardComponent,
);
