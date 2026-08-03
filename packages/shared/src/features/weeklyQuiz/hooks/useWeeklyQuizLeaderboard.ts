import { useQuery } from '@tanstack/react-query';
import { useAuthContext } from '../../../contexts/AuthContext';
import type { Connection } from '../../../graphql/common';
import { gqlClient } from '../../../graphql/common';
import { fallbackImages } from '../../../lib/config';
import { disabledRefetch } from '../../../lib/func';
import { generateQueryKey, RequestKey, StaleTime } from '../../../lib/query';
import { WEEKLY_QUIZ_LEADERBOARD_QUERY } from '../graphql';
import type { WeeklyQuizLeaderboardEntry } from '../types';
import { WeeklyQuizPeriod } from '../types';
import {
  getDemoLeaderboard,
  getDemoViewerEntry,
  isWeeklyQuizDemo,
} from '../demoMode';

const LEADERBOARD_LIMIT = 20;

type LeaderboardUser = {
  id: string;
  name: string | null;
  username: string | null;
  image: string | null;
  reputation?: number | null;
};

type LeaderboardNode = {
  user: LeaderboardUser;
  correctCount: number;
  totalQuestions: number;
  timeMs: number;
  rank: number;
  isAllTimeSuperstar?: boolean;
};

type WeeklyQuizLeaderboardResponse = {
  weeklyQuizLeaderboard: Connection<LeaderboardNode>;
  weeklyQuizViewerEntry?: {
    correctCount: number;
    totalQuestions: number;
    timeMs: number;
    rank: number;
  } | null;
};

interface UseWeeklyQuizLeaderboard {
  leaderboard: WeeklyQuizLeaderboardEntry[];
  // The signed-in player's own standing, populated only when they rank outside
  // the visible top list — for a pinned "your rank" row beneath the board.
  // Null when anonymous or already present in the list.
  viewerEntry: WeeklyQuizLeaderboardEntry | null;
  isPending: boolean;
}

const toEntry = (
  node: LeaderboardNode,
  currentUserId?: string,
): WeeklyQuizLeaderboardEntry => ({
  id: node.user.id,
  rank: node.rank,
  name: node.user.name || node.user.username || 'Anonymous developer',
  username: node.user.username,
  image: node.user.image || fallbackImages.avatar,
  correctCount: node.correctCount,
  totalQuestions: node.totalQuestions,
  timeMs: node.timeMs,
  isCurrentUser: node.user.id === currentUserId,
  reputation: node.user.reputation ?? undefined,
  isAllTimeSuperstar: node.isAllTimeSuperstar,
});

// The scoreboard, ranked by correct answers first with total time as the
// tiebreak. Locked behind login: we only query for signed-in players, and the
// intro/results screens show a login prompt to everyone else. Pins the viewer's
// own row when they rank outside the visible page (mirrors giveback).
export const useWeeklyQuizLeaderboard = (
  period: WeeklyQuizPeriod = WeeklyQuizPeriod.Weekly,
): UseWeeklyQuizLeaderboard => {
  const { user, isAuthReady } = useAuthContext();
  const demo = isWeeklyQuizDemo();

  const { data, isPending } = useQuery({
    queryKey: generateQueryKey(RequestKey.WeeklyQuizLeaderboard, user, period),
    queryFn: () =>
      gqlClient.request<WeeklyQuizLeaderboardResponse>(
        WEEKLY_QUIZ_LEADERBOARD_QUERY,
        { period, first: LEADERBOARD_LIMIT, withViewerRank: true },
      ),
    enabled: isAuthReady && !!user && !demo,
    staleTime: StaleTime.Default,
    ...disabledRefetch,
  });

  if (demo) {
    return {
      leaderboard: getDemoLeaderboard(period),
      viewerEntry: getDemoViewerEntry(period),
      isPending: false,
    };
  }

  const leaderboard =
    data?.weeklyQuizLeaderboard.edges.map(({ node }) =>
      toEntry(node, user?.id),
    ) ?? [];

  // Expose the viewer's own row separately when they're not already visible in
  // the top list, so the scoreboard can pin it beneath the board.
  const raw = data?.weeklyQuizViewerEntry;
  const isViewerInList = leaderboard.some((entry) => entry.isCurrentUser);
  const viewerEntry: WeeklyQuizLeaderboardEntry | null =
    !user || !raw || isViewerInList
      ? null
      : {
          id: user.id,
          rank: raw.rank,
          name: user.name || user.username || 'You',
          username: user.username,
          image: user.image || fallbackImages.avatar,
          correctCount: raw.correctCount,
          totalQuestions: raw.totalQuestions,
          timeMs: raw.timeMs,
          isCurrentUser: true,
          reputation: user.reputation,
        };

  return { leaderboard, viewerEntry, isPending };
};
