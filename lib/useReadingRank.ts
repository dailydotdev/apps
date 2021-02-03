import { LoggedUser } from './user';
import { useContext, useEffect, useState } from 'react';
import AuthContext from '../components/AuthContext';
import { useQuery, useQueryClient } from 'react-query';
import { MY_READING_RANK_QUERY, MyRankData } from '../graphql/users';
import request from 'graphql-request';
import { apiUrl } from './config';
import usePersistentState from './usePersistentState';
import { STEPS_PER_RANK } from './rank';
import { isThisISOWeek, isToday } from 'date-fns';

export const getRankQueryKey = (user?: LoggedUser): string[] => [
  user?.id ?? 'anonymous',
  'rank',
];

type ReturnType = {
  isLoading: boolean;
  rank: number;
  progress: number;
  levelUp: boolean;
  neverShowRankModal: boolean;
  confirmLevelUp: () => Promise<void>;
};

const defaultRank: MyRankData = {
  rank: { progressThisWeek: 0, currentRank: 0, readToday: false },
};

export default function useReadingRank(): ReturnType {
  const { user, tokenRefreshed } = useContext(AuthContext);
  const [levelUp, setLevelUp] = useState(false);
  const queryClient = useQueryClient();

  const neverShowRankModal = true;
  const [cachedRank, setCachedRank, loadedCache] = usePersistentState<
    MyRankData & { userId: string }
  >('rank', null);
  const queryKey = getRankQueryKey(user);
  const { data: remoteRank, isLoading } = useQuery<MyRankData>(
    queryKey,
    () =>
      request(`${apiUrl}/graphql`, MY_READING_RANK_QUERY, {
        id: user.id,
      }),
    {
      enabled: !!user && tokenRefreshed,
      refetchOnWindowFocus: false,
    },
  );

  const cacheRank = (rank: MyRankData = remoteRank) =>
    setCachedRank({ rank: rank.rank, userId: user?.id });

  const updateShownProgress = async () => {
    if (document.visibilityState === 'hidden') {
      document.addEventListener(
        'visibilitychange',
        () => setTimeout(updateShownProgress, 1000),
        { once: true },
      );
    } else {
      if (cachedRank?.rank.currentRank === remoteRank?.rank.currentRank) {
        await cacheRank();
      } else {
        setLevelUp(true);
      }
    }
  };

  useEffect(() => {
    if (remoteRank && loadedCache) {
      if (
        !cachedRank ||
        remoteRank.rank.progressThisWeek < cachedRank.rank.progressThisWeek
      ) {
        cacheRank();
        return;
      }

      // Let the rank update and then show progress animation, slight delay so the user won't miss it
      setTimeout(updateShownProgress, 300);
    }
  }, [remoteRank, loadedCache]);

  // For anonymous users
  useEffect(() => {
    if (loadedCache && tokenRefreshed) {
      if (cachedRank?.userId !== user?.id) {
        // Reset cache on user change
        if (remoteRank) {
          cacheRank();
        } else if (user) {
          setCachedRank(null);
        } else {
          cacheRank(defaultRank);
        }
      } else if (!user) {
        // Check anonymous progress
        let rank = cachedRank ?? defaultRank;
        if (rank.rank.lastReadTime) {
          if (!isThisISOWeek(rank.rank.lastReadTime)) {
            rank = defaultRank;
          } else if (rank.rank.readToday && !isToday(rank.rank.lastReadTime)) {
            rank.rank.readToday = false;
          }
        }
        queryClient.setQueryData<MyRankData>(queryKey, rank);
      }
    }
  }, [user, tokenRefreshed, loadedCache]);

  return {
    isLoading: !(cachedRank || !isLoading),
    rank:
      levelUp && neverShowRankModal
        ? remoteRank?.rank.currentRank
        : cachedRank?.rank.currentRank,
    progress:
      levelUp && neverShowRankModal
        ? STEPS_PER_RANK[remoteRank?.rank.currentRank - 1]
        : cachedRank?.rank.progressThisWeek,
    levelUp,
    neverShowRankModal,
    confirmLevelUp: () => {
      if (user) {
        setLevelUp(false);
        return cacheRank();
      }
      // Limit anonymous users to rank zero
      const rank = queryClient.setQueryData<MyRankData>(
        queryKey,
        (currentRank) => ({
          rank: { ...currentRank.rank, currentRank: 0 },
        }),
      );
      return cacheRank(rank);
    },
  };
}
