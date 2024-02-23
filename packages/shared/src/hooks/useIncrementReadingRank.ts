import { useQueryClient } from '@tanstack/react-query';
import { useContext, useRef } from 'react';
import AuthContext from '../contexts/AuthContext';
import { getRankQueryKey } from './useReadingRank';
import { MyRankData } from '../graphql/users';
import { getRank, RANKS } from '../lib/rank';
import useDebounce from './useDebounce';
import { RequestKey, generateQueryKey } from '../lib/query';

type ReturnType = {
  incrementReadingRank: () => Promise<MyRankData>;
};

const MAX_PROGRESS = RANKS[RANKS.length - 1].steps;

export default function useIncrementReadingRank(): ReturnType {
  const { user } = useContext(AuthContext);
  const queryKeyRef = useRef<string[]>();
  const userStreakQueryKeyRef = useRef<unknown[]>();
  const queryClient = useQueryClient();
  const [clearQueries] = useDebounce(
    async (readToday = false): Promise<void> => {
      const promises = [];

      if (queryKeyRef.current?.length > 0) {
        promises.push(queryClient.invalidateQueries(queryKeyRef.current));
      }

      if (!readToday && userStreakQueryKeyRef.current?.length > 0) {
        promises.push(
          queryClient.invalidateQueries(userStreakQueryKeyRef.current),
        );
      }

      await Promise.all(promises);
    },
    100,
  );

  return {
    incrementReadingRank: async () => {
      const queryKey = getRankQueryKey(user);
      queryKeyRef.current = queryKey;
      const oldRank = queryClient.getQueryData<MyRankData>(queryKey);

      const userStreakQueryKey = generateQueryKey(RequestKey.UserStreak, user);
      userStreakQueryKeyRef.current = userStreakQueryKey;

      const data = queryClient.setQueryData<MyRankData>(
        queryKey,
        (currentRank) => {
          if (
            !currentRank ||
            currentRank.rank.readToday ||
            currentRank.rank.progressThisWeek === MAX_PROGRESS ||
            (!user && currentRank.rank.progressThisWeek === RANKS[0].steps)
          ) {
            return currentRank;
          }
          const rank = currentRank.rank.currentRank;
          const progress = currentRank.rank.progressThisWeek + 1;
          return {
            rank: {
              rankLastWeek: currentRank.rank.rankLastWeek,
              readToday: true,
              currentRank:
                progress >= RANKS[getRank(rank)].steps ? rank + 1 : rank,
              tags: currentRank.rank.tags,
              progressThisWeek: progress,
              lastReadTime: new Date(),
            },
          };
        },
      );
      clearQueries(oldRank?.rank?.readToday ?? true);
      return data;
    },
  };
}
