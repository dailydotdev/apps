import type { ReactElement } from 'react';
import React, { forwardRef } from 'react';
import colors from '../../styles/colors';
import { SnapshotEyebrow } from '../snapshot/SnapshotEyebrow';
import { SnapshotFrame } from '../snapshot/SnapshotFrame';
import type { SnapshotIdentityProps } from '../snapshot/SnapshotIdentity';
import { SnapshotIdentity } from '../snapshot/SnapshotIdentity';
import { SnapshotTile } from '../snapshot/SnapshotStats';

const MUTED = colors.salt['90'];

export interface LeaderboardSnapshotRow {
  rank: number;
  name: string;
  value: string;
}

export interface LeaderboardSnapshotCardProps {
  user: SnapshotIdentityProps;
  /** "Highest reputation", "Most reading days"… */
  title: string;
  /** A rank past the counted range reads "100K+". */
  rank: string;
  stat: { value: string; label: string };
  /** What the rows under the tiles are. */
  listTitle: string;
  rows: LeaderboardSnapshotRow[];
}

/**
 * The leaderboard's share image, composed the way the Reading overview card
 * is: the mark with a surface label, who it is, two headline tiles, then the
 * board's top rows.
 */
function LeaderboardSnapshotCardComponent(
  { user, title, rank, stat, listTitle, rows }: LeaderboardSnapshotCardProps,
  ref: React.Ref<HTMLDivElement>,
): ReactElement {
  return (
    <SnapshotFrame
      grow
      ref={ref}
      seed={`leaderboard-${title}`}
      logoAside={<SnapshotEyebrow label="Leaderboard" />}
    >
      <div className="flex flex-1 flex-col gap-6">
        <SnapshotIdentity {...user} />
        <div className="flex gap-4">
          <SnapshotTile value={rank} label={title} />
          <SnapshotTile value={stat.value} label={stat.label} />
        </div>
        <div className="flex flex-col gap-3">
          <span style={{ color: MUTED, fontSize: 26 }}>{listTitle}</span>
          <ol className="flex w-full flex-col gap-4">
            {rows.map((row) => (
              <li key={row.rank} className="flex w-full items-center gap-4">
                <span
                  className="shrink-0 font-bold"
                  style={{
                    color: colors.cabbage['10'],
                    fontSize: 28,
                    width: 56,
                  }}
                >
                  {row.rank}
                </span>
                <span
                  className="min-w-0 flex-1 truncate font-bold"
                  style={{ color: '#FFFFFF', fontSize: 30 }}
                >
                  {row.name}
                </span>
                <span style={{ color: MUTED, fontSize: 26 }}>{row.value}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </SnapshotFrame>
  );
}

export const LeaderboardSnapshotCard = forwardRef(
  LeaderboardSnapshotCardComponent,
);
