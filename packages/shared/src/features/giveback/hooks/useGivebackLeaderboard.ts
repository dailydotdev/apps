import { useQuery } from '@tanstack/react-query';
import { useAuthContext } from '../../../contexts/AuthContext';
import type { Connection } from '../../../graphql/common';
import { gqlClient } from '../../../graphql/common';
import { fallbackImages } from '../../../lib/config';
import { disabledRefetch } from '../../../lib/func';
import { generateQueryKey, RequestKey, StaleTime } from '../../../lib/query';
import { CONTRIBUTION_LEADERBOARD_QUERY } from '../graphql';
import type { GivebackLeaderboardEntry } from '../types';

const GIVEBACK_CURRENCY = 'USD';
const LEADERBOARD_LIMIT = 5;

type ContributionLeaderboardUser = {
  id: string;
  name: string | null;
  username: string | null;
  image: string | null;
};

type ContributionLeaderboardResponse = {
  contributionLeaderboard: Connection<{
    user: ContributionLeaderboardUser;
    points: number;
    rank: number;
  }>;
  contributionUserRank?: {
    points: number;
    rank: number;
  } | null;
};

interface UseGivebackLeaderboard {
  leaderboard: GivebackLeaderboardEntry[];
  isPending: boolean;
}

export const useGivebackLeaderboard = (): UseGivebackLeaderboard => {
  const { user, isAuthReady } = useAuthContext();
  const withViewerRank = !!user;

  const { data, isPending } = useQuery({
    queryKey: generateQueryKey(RequestKey.ContributionLeaderboard, user),
    queryFn: () =>
      gqlClient.request<ContributionLeaderboardResponse>(
        CONTRIBUTION_LEADERBOARD_QUERY,
        { first: LEADERBOARD_LIMIT, withViewerRank },
      ),
    enabled: isAuthReady,
    staleTime: StaleTime.Default,
    ...disabledRefetch,
  });

  const leaderboard =
    data?.contributionLeaderboard.edges.map(({ node }) => ({
      id: node.user.id,
      rank: node.rank,
      name: node.user.name || node.user.username || 'Anonymous contributor',
      image: node.user.image || fallbackImages.avatar,
      contributionAmount: node.points,
      currency: GIVEBACK_CURRENCY,
      isCurrentUser: node.user.id === user?.id,
    })) ?? [];

  const viewerRank = data?.contributionUserRank;
  if (!user || !viewerRank || leaderboard.some((entry) => entry.isCurrentUser)) {
    return { leaderboard, isPending };
  }

  return {
    leaderboard: [
      ...leaderboard,
      {
        id: user.id,
        rank: viewerRank.rank,
        name: user.name || user.username || 'You',
        image: user.image || fallbackImages.avatar,
        contributionAmount: viewerRank.points,
        currency: GIVEBACK_CURRENCY,
        isCurrentUser: true,
      },
    ].sort((a, b) => a.rank - b.rank),
    isPending,
  };
};
