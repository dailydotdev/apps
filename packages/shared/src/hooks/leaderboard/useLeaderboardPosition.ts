import { useQuery } from '@tanstack/react-query';
import { useAuthContext } from '../../contexts/AuthContext';
import { gqlClient } from '../../graphql/common';
import type {
  LeaderboardPosition,
  LeaderboardType,
} from '../../graphql/leaderboard';
import { LEADERBOARD_POSITION_QUERY } from '../../graphql/leaderboard';
import { generateQueryKey, RequestKey, StaleTime } from '../../lib/query';

interface UseLeaderboardPositionProps {
  type: LeaderboardType;
  enabled: boolean;
}

interface UseLeaderboardPosition {
  position: LeaderboardPosition | null;
  isPending: boolean;
}

// The API resolves the position for the *viewer*, so there is no user argument.
// `position` is null both while disabled and when the backend has no row for
// the viewer; callers must treat a null `position.rank` (viewer sits past
// `cappedAt`) as "no rank" rather than rendering a number.
export const useLeaderboardPosition = ({
  type,
  enabled,
}: UseLeaderboardPositionProps): UseLeaderboardPosition => {
  const { user } = useAuthContext();

  const { data, isPending } = useQuery({
    queryKey: generateQueryKey(RequestKey.LeaderboardPosition, user, type),
    queryFn: async () => {
      const res = await gqlClient.request<{
        leaderboardPosition: LeaderboardPosition | null;
      }>(LEADERBOARD_POSITION_QUERY, { type });

      return res.leaderboardPosition;
    },
    enabled,
    staleTime: StaleTime.Default,
  });

  return { position: data ?? null, isPending: enabled && isPending };
};
