import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import type {
  CompanyLeaderboard,
  LeaderboardType,
  UserLeaderboard,
} from '../../graphql/leaderboard';
import { useLogContext } from '../../contexts/LogContext';
import { leaderboardBoardClickEvent } from './leaderboardLog';
import { LEADERBOARD_TILE_ROWS } from './boards';
import { LeaderboardEmptyBoard, LeaderboardTextLink } from './LeaderboardRows';

export interface LeaderboardBoardTileProps<
  T extends UserLeaderboard | CompanyLeaderboard,
> {
  type: LeaderboardType;
  title: string;
  /** The page's rows for the board, up to LEADERBOARD_LIST_LIMIT. */
  items: T[];
  renderRow: (item: T, rank: number) => ReactNode;
  /** Your own row, pinned under the top rows. */
  you?: ReactNode;
}

/**
 * A board's top rows and, where production can rank you, your row. The
 * header's cue opens the board's full ranking on its own page. The rows stay
 * links of their own, so people and crawlers reach the profiles from here.
 */
export function LeaderboardBoardTile<
  T extends UserLeaderboard | CompanyLeaderboard,
>({
  type,
  title,
  items,
  renderRow,
  you,
}: LeaderboardBoardTileProps<T>): ReactElement {
  const { logEvent } = useLogContext();
  const empty = items.length === 0;
  const topRows = items
    .slice(0, you ? LEADERBOARD_TILE_ROWS - 1 : LEADERBOARD_TILE_ROWS)
    .map((item, index) => renderRow(item, index + 1));

  return (
    <div className="flex h-full flex-col gap-1 rounded-16 border border-border-subtlest-tertiary p-3">
      <div className="flex items-start justify-between gap-2 px-1.5 pb-1">
        <span className="truncate font-bold typo-callout">{title}</span>
        {!empty && (
          <LeaderboardTextLink
            href={`/users/${type}`}
            ariaLabel={`${title}, full ranking`}
            onClick={() => logEvent(leaderboardBoardClickEvent(type, 'page'))}
          >
            Full ranking
          </LeaderboardTextLink>
        )}
      </div>
      {empty ? (
        <LeaderboardEmptyBoard />
      ) : (
        <ol className="flex flex-col">
          {topRows}
          {you && (
            <>
              <li
                aria-hidden
                className="my-1 h-px bg-border-subtlest-tertiary"
              />
              {you}
            </>
          )}
        </ol>
      )}
    </div>
  );
}
