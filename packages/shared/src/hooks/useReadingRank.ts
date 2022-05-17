import {
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  useMemo,
} from 'react';
import { useQuery, useQueryClient } from 'react-query';
import request from 'graphql-request';
import { isThisISOWeek, isToday } from 'date-fns';
import { LoggedUser } from '../lib/user';
import AuthContext from '../contexts/AuthContext';
import { MY_READING_RANK_QUERY, MyRankData } from '../graphql/users';
import { apiUrl } from '../lib/config';
import usePersistentState from './usePersistentState';
import AlertContext, { MAX_DATE } from '../contexts/AlertContext';
import SettingsContext from '../contexts/SettingsContext';

export const getRankQueryKey = (user?: LoggedUser): string[] => [
  user?.id ?? 'anonymous',
  'rank',
];

export type Tag = {
  tag: string;
  readingDays: number;
  percentage?: number;
};
export type TopTags = Tag[];
type ReturnType = {
  isLoading: boolean;
  rank: number;
  rankLastWeek: number;
  nextRank: number;
  progress: number;
  tags: TopTags;
  levelUp: boolean;
  shouldShowRankModal: boolean;
  confirmLevelUp: (neverShowRankModal: boolean) => Promise<void>;
  reads: number;
};

const defaultRank: MyRankData = {
  rank: {
    progressThisWeek: 0,
    currentRank: 0,
    tags: [],
    readToday: false,
    rankLastWeek: 0,
  },
  reads: 0,
};

const checkShouldShowRankModal = (
  rankLastSeen: Date,
  lastReadTime: Date,
  loadedAlerts: boolean,
  neverShowRankModal: boolean,
) => {
  if (neverShowRankModal !== null && neverShowRankModal !== undefined) {
    return !neverShowRankModal;
  }

  if (loadedAlerts && !rankLastSeen) {
    return true;
  }

  if (!rankLastSeen) {
    return false;
  }

  return new Date(rankLastSeen) < new Date(lastReadTime);
};

export const RANK_CACHE_KEY = 'rank_v2';

export default function useReadingRank(
  disableNewRankPopup?: boolean,
): ReturnType {
  const { alerts, loadedAlerts, updateAlerts } = useContext(AlertContext);
  const { user, tokenRefreshed, loadedUserFromCache } = useContext(AuthContext);
  const [levelUp, setLevelUp] = useState(false);
  const [showRankPopup, setShowRankPopup] = useState(false);
  const queryClient = useQueryClient();
  const { optOutWeeklyGoal } = useContext(SettingsContext);

  const [cachedRank, setCachedRank, loadedCache] = usePersistentState<
    MyRankData & { userId: string; neverShowRankModal?: boolean }
  >(RANK_CACHE_KEY, null);
  const neverShowRankModal = cachedRank?.neverShowRankModal;
  const queryKey = getRankQueryKey(user);
  const { data: remoteRank } = useQuery<MyRankData>(
    queryKey,
    () =>
      request(`${apiUrl}/graphql`, MY_READING_RANK_QUERY, {
        id: user.id,
        version: 2,
      }),
    {
      enabled: !!user && tokenRefreshed,
      refetchOnWindowFocus: false,
    },
  );

  const cacheRank = (
    rank: MyRankData = remoteRank,
    newNeverShowRankModal = neverShowRankModal,
  ) =>
    setCachedRank({
      rank: rank.rank,
      reads: rank.reads,
      userId: user?.id,
      neverShowRankModal: newNeverShowRankModal,
    });

  const shouldShowRankModal =
    showRankPopup &&
    !optOutWeeklyGoal &&
    checkShouldShowRankModal(
      alerts?.rankLastSeen,
      cachedRank?.rank?.lastReadTime || remoteRank?.rank?.lastReadTime,
      loadedAlerts,
      neverShowRankModal,
    );

  const timeoutRef = useRef<number>();
  const visibilityRef = useRef(null);

  const updateShownProgress = useCallback(async () => {
    if (visibilityRef.current) {
      document.removeEventListener('visibilitychange', visibilityRef.current);
    }
    visibilityRef.current = () => {
      timeoutRef.current = window.setTimeout(updateShownProgress, 1000);
    };

    if (document.visibilityState === 'hidden') {
      document.addEventListener('visibilitychange', visibilityRef.current, {
        once: true,
      });
    } else if (cachedRank?.rank.currentRank === remoteRank?.rank.currentRank) {
      await cacheRank();
    } else {
      setLevelUp(true);
    }
  }, [cachedRank, remoteRank]);

  useEffect(() => {
    if (!disableNewRankPopup) {
      setShowRankPopup(levelUp);
    }
  }, [levelUp]);

  // Cleanup effect to set the unmounting and remove active listeners.
  useEffect(
    () => () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (visibilityRef.current) {
        document.removeEventListener('visibilitychange', visibilityRef.current);
      }
    },
    [],
  );

  // Let the rank update and then show progress animation, slight delay so the user won't miss it
  const displayProgress = () => {
    timeoutRef.current = window.setTimeout(updateShownProgress, 300);
  };

  useEffect(() => {
    if (remoteRank && loadedCache) {
      if (
        !cachedRank ||
        remoteRank.rank.progressThisWeek < cachedRank.rank.progressThisWeek
      ) {
        /* if there is no cache value or it is not the most updated let's set the cache */
        cacheRank();
      } else if (cachedRank && !cachedRank.rank.rankLastWeek) {
        /*
          else if the cache value has data but missing some properties rankLastWeek, let's re-set it
          with that, this can mean the user is on their first week, which should see the progress animation
        */
        cacheRank();
        displayProgress();
      } else {
        /* else - the cache has pre-existing value so we just need to check if we should display the progress */
        displayProgress();
      }
    }
  }, [remoteRank, loadedCache]);

  // For anonymous users
  useEffect(() => {
    if (loadedCache && loadedUserFromCache && tokenRefreshed) {
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
  }, [user, tokenRefreshed, loadedUserFromCache, loadedCache]);

  return useMemo(
    () => ({
      isLoading: !cachedRank,
      rankLastWeek: cachedRank?.rank.rankLastWeek,
      rank: cachedRank?.rank.currentRank,
      nextRank: remoteRank?.rank.currentRank,
      progress: cachedRank?.rank.progressThisWeek,
      tags: cachedRank?.rank.tags,
      reads: remoteRank?.reads,
      levelUp,
      shouldShowRankModal,
      confirmLevelUp: (newNeverShowRankModal) => {
        setLevelUp(false);
        if (user) {
          const lastSeen = newNeverShowRankModal ? MAX_DATE : new Date();
          updateAlerts({ rankLastSeen: lastSeen });
          return cacheRank(remoteRank);
        }
        // Limit anonymous users to rank zero
        const rank = queryClient.setQueryData<MyRankData>(
          queryKey,
          (currentRank) => ({
            rank: { ...currentRank.rank, currentRank: 0 },
            reads: currentRank?.reads,
          }),
        );
        return cacheRank(rank, newNeverShowRankModal);
      },
    }),
    [cachedRank, remoteRank, levelUp, shouldShowRankModal, user, queryKey],
  );
}
