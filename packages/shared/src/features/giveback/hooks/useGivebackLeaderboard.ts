import { useMemo } from 'react';
import { useAuthContext } from '../../../contexts/AuthContext';
import { fallbackImages } from '../../../lib/config';
import type { GivebackLeaderboardEntry } from '../types';

const GIVEBACK_CURRENCY = 'USD';

// Illustrative standings shown until the backend exposes a real leaderboard
// endpoint. Ranks and amounts are placeholder; the viewer's own row (rank 4) is
// stitched in from their real profile so the "your rank" recap feels personal.
const placeholderPeers: Omit<
  GivebackLeaderboardEntry,
  'currency' | 'isCurrentUser'
>[] = [
  {
    id: 'lb-1',
    rank: 1,
    name: 'Ana Pereira',
    image: fallbackImages.avatar,
    contributionAmount: 320,
  },
  {
    id: 'lb-2',
    rank: 2,
    name: 'Marco Reyes',
    image: fallbackImages.avatar,
    contributionAmount: 245,
  },
  {
    id: 'lb-3',
    rank: 3,
    name: 'Priya Nair',
    image: fallbackImages.avatar,
    contributionAmount: 180,
  },
  {
    id: 'lb-5',
    rank: 5,
    name: 'Kenji Watanabe',
    image: fallbackImages.avatar,
    contributionAmount: 90,
  },
];

const CURRENT_USER_RANK = 4;
const CURRENT_USER_AMOUNT = 120;

interface UseGivebackLeaderboard {
  leaderboard: GivebackLeaderboardEntry[];
}

// TODO(giveback): replace the placeholder standings with a real leaderboard
// query once the backend endpoint lands. The component is data-source agnostic,
// so only this hook needs to change.
export const useGivebackLeaderboard = (): UseGivebackLeaderboard => {
  const { user } = useAuthContext();

  const leaderboard = useMemo<GivebackLeaderboardEntry[]>(() => {
    const peers: GivebackLeaderboardEntry[] = placeholderPeers.map((entry) => ({
      ...entry,
      currency: GIVEBACK_CURRENCY,
    }));

    if (!user) {
      return peers;
    }

    const currentUser: GivebackLeaderboardEntry = {
      id: user.id,
      rank: CURRENT_USER_RANK,
      name: user.name || user.username || 'You',
      image: user.image || fallbackImages.avatar,
      contributionAmount: CURRENT_USER_AMOUNT,
      currency: GIVEBACK_CURRENCY,
      isCurrentUser: true,
    };

    return [...peers, currentUser].sort((a, b) => a.rank - b.rank);
  }, [user]);

  return { leaderboard };
};
