import { useQuery } from '@tanstack/react-query';
import { useAuthContext } from '../../contexts/AuthContext';
import type {
  LeaderboardPosition,
  LeaderboardType,
} from '../../graphql/leaderboard';
import {
  isLeaderboardPositionSupported,
  leaderboardPositionQueryOptions,
} from '../../graphql/leaderboard';
import { formatLeaderboardCap, formatLeaderboardRank } from './boards';

/** How leaderboardPosition answers for you: a rank, past the cap, or nothing yet. */
export type LeaderboardRankState = 'ranked' | 'capped' | 'empty';

export const getLeaderboardRankState = (
  position?: LeaderboardPosition | null,
): LeaderboardRankState => {
  if (!position || position.score <= 0) {
    return 'empty';
  }

  return position.rank === null ? 'capped' : 'ranked';
};

/** "#842", or "100K+" past the counted range. */
export const getLeaderboardRankLabel = (
  position: LeaderboardPosition,
): string =>
  position.rank === null
    ? formatLeaderboardCap(position.cappedAt)
    : formatLeaderboardRank(position.rank);

interface UseLeaderboardPosition {
  position?: LeaderboardPosition | null;
  state: LeaderboardRankState;
  isLoading: boolean;
  isError: boolean;
}

/** Your rank on one board, where production can answer for it. */
export const useLeaderboardPosition = (
  type: LeaderboardType,
): UseLeaderboardPosition => {
  const { user, isAuthReady } = useAuthContext();
  const enabled = isAuthReady && !!user && isLeaderboardPositionSupported(type);
  const { data, isPending, isError } = useQuery({
    ...leaderboardPositionQueryOptions(user, type),
    enabled,
  });

  return {
    position: data,
    state: getLeaderboardRankState(data),
    isLoading: enabled && isPending,
    isError,
  };
};
