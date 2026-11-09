import type { LogEvent as LogEventData } from '../../hooks/log/useLogQueue';
import type { LeaderboardType } from '../../graphql/leaderboard';
import { LogEvent, TargetType } from '../../lib/log';

/** Where a board's list opened: in place, as a phone sheet, or its own page. */
export type LeaderboardBoardSurface = 'popover' | 'sheet' | 'page';

/** Where on the page a person was pressed. */
export type LeaderboardUserPlacement = 'top reputation' | 'standouts';

export const leaderboardBoardClickEvent = (
  type: LeaderboardType,
  surface: LeaderboardBoardSurface,
): LogEventData => ({
  event_name: LogEvent.Click,
  target_type: TargetType.LeaderboardBoard,
  target_id: type,
  extra: JSON.stringify({ surface }),
});

export const leaderboardRankPickerEvent = (
  type: LeaderboardType,
): LogEventData => ({
  event_name: LogEvent.Click,
  target_type: TargetType.LeaderboardRankPicker,
  target_id: type,
});

export const leaderboardUserClickEvent = ({
  userId,
  placement,
  board,
  rank,
}: {
  userId: string;
  placement: LeaderboardUserPlacement;
  board: LeaderboardType;
  rank: number;
}): LogEventData => ({
  event_name: LogEvent.Click,
  target_type: TargetType.LeaderboardUser,
  target_id: userId,
  extra: JSON.stringify({ placement, board, rank }),
});
