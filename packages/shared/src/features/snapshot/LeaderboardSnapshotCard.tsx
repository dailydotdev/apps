import type { ReactElement } from 'react';
import React, { forwardRef } from 'react';
import colors from '../../styles/colors';
import { largeNumberFormat } from '../../lib';
import { SnapshotFrame } from './SnapshotFrame';
import {
  SnapshotStat,
  SnapshotStatRow,
  SnapshotStatValue,
} from './SnapshotStats';
import { SnapshotLevelRing } from './SnapshotLevelRing';

const MUTED = colors.salt['90'];
const DIVIDER = colors.pepper['10'];

/** Gold, silver and bronze, matching the leaderboard's own top-rank palette. */
const RANK_COLORS = [
  colors.cheese['40'],
  colors.salt['90'],
  colors.bacon['40'],
];

export interface LeaderboardSnapshotCardProps {
  board: string;
  rank: number;
  name: string;
  handle: string;
  image?: string;
  score: number;
  level: number;
  levelProgress: number;
  reputation: number;
  seed?: string;
}

function LeaderboardSnapshotCardComponent(
  {
    board,
    rank,
    name,
    handle,
    image,
    score,
    level,
    levelProgress,
    reputation,
    seed,
  }: LeaderboardSnapshotCardProps,
  ref: React.Ref<HTMLDivElement>,
): ReactElement {
  const rankColor = RANK_COLORS[rank - 1] ?? colors.cabbage['10'];

  return (
    <SnapshotFrame ref={ref} seed={seed ?? handle}>
      <div className="flex flex-1 flex-col items-center gap-6 text-center">
        <div
          className="inline-flex items-center gap-3 rounded-16"
          style={{
            padding: '10px 24px',
            background: 'rgba(255, 255, 255, 0.06)',
            border: `1px solid ${DIVIDER}`,
          }}
        >
          <span
            className="font-bold"
            style={{ color: rankColor, fontSize: 34, lineHeight: 1 }}
          >
            #{rank}
          </span>
          <span
            className="uppercase"
            style={{ color: MUTED, fontSize: 22, letterSpacing: 1.5 }}
          >
            {board}
          </span>
        </div>

        {image && (
          <img
            src={image}
            alt=""
            crossOrigin="anonymous"
            className="rounded-32 object-cover"
            style={{
              width: 216,
              height: 216,
              border: `3px solid ${rankColor}`,
            }}
          />
        )}

        <div className="flex flex-col gap-1">
          <span
            className="font-bold text-white"
            style={{ fontSize: 54, lineHeight: 1.1 }}
          >
            {name}
          </span>
          <span style={{ color: MUTED, fontSize: 28 }}>{handle}</span>
        </div>

        <SnapshotStatRow>
          <SnapshotStat
            label="XP"
            value={
              <SnapshotStatValue>
                {largeNumberFormat(score) ?? score}
              </SnapshotStatValue>
            }
          />
          <SnapshotStat
            label="Level"
            value={<SnapshotLevelRing level={level} progress={levelProgress} />}
          />
          <SnapshotStat
            label="Reputation"
            value={
              <SnapshotStatValue>
                {largeNumberFormat(reputation) ?? reputation}
              </SnapshotStatValue>
            }
          />
        </SnapshotStatRow>
      </div>
    </SnapshotFrame>
  );
}

export const LeaderboardSnapshotCard = forwardRef(
  LeaderboardSnapshotCardComponent,
);
