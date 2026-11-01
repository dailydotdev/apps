import type { ReactElement } from 'react';
import React, { forwardRef } from 'react';
import { SnapshotFrame } from '@dailydotdev/shared/src/features/snapshot/SnapshotFrame';
import { SnapshotEyebrow } from '@dailydotdev/shared/src/features/snapshot/SnapshotEyebrow';
import { SnapshotIdentity } from '@dailydotdev/shared/src/features/snapshot/SnapshotIdentity';
import { SnapshotTile } from '@dailydotdev/shared/src/features/snapshot/SnapshotStats';
import colors from '@dailydotdev/shared/src/styles/colors';
import { ME, ME_PROFILE } from './data';

const SNAPSHOT_MUTED = colors.salt['90'];

export interface SnapshotRow {
  rank: number;
  name: string;
  value: string;
  isMe?: boolean;
}

export interface LeaderboardSnapshotCardProps {
  /** "Highest reputation", "Most reading days"… */
  title: string;
  /** A rank past the counted range reads "1K+". */
  rank: string;
  stat: { value: string; label: string };
  /** What the rows under the tiles are. */
  listTitle: string;
  rows: SnapshotRow[];
}

/**
 * The leaderboard's share image, composed from production's snapshot pieces
 * the way the Reading overview card is: the mark with a surface label, who it
 * is, two headline tiles, then the board.s top rows.
 */
export const LeaderboardSnapshotCard = forwardRef(
  function LeaderboardSnapshotCard(
    { title, rank, stat, listTitle, rows }: LeaderboardSnapshotCardProps,
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
          <SnapshotIdentity
            name={ME_PROFILE.name}
            handle={`@${ME_PROFILE.handle}`}
            image={ME.image}
          />
          <div className="flex gap-4">
            <SnapshotTile value={rank} label={title} />
            <SnapshotTile value={stat.value} label={stat.label} />
          </div>
          <div className="flex flex-col gap-3">
            <span style={{ color: SNAPSHOT_MUTED, fontSize: 26 }}>
              {listTitle}
            </span>
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
                    style={{
                      color: row.isMe ? colors.cabbage['10'] : '#FFFFFF',
                      fontSize: 30,
                    }}
                  >
                    {row.name}
                  </span>
                  <span style={{ color: SNAPSHOT_MUTED, fontSize: 26 }}>
                    {row.value}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </SnapshotFrame>
    );
  },
);
