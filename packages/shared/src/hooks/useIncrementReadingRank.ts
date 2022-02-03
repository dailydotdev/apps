import { useQueryClient } from 'react-query';
import { useContext } from 'react';
import AuthContext from '../contexts/AuthContext';
import { getRankQueryKey } from './useReadingRank';
import { MyRankData } from '../graphql/users';
import { RANKS } from '../lib/rank';

type ReturnType = {
  incrementReadingRank: () => Promise<MyRankData>;
};

const MAX_PROGRESS = RANKS[RANKS.length - 1].steps;

export default function useIncrementReadingRank(): ReturnType {
  const { user } = useContext(AuthContext);
  const queryClient = useQueryClient();

  return {
    incrementReadingRank: async () => {
      const queryKey = getRankQueryKey(user);
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
              currentRank: progress >= RANKS[rank].steps ? rank + 1 : rank,
              tags: currentRank.rank.tags,
              progressThisWeek: progress,
              lastReadTime: new Date(),
            },
            reads: currentRank.reads,
          };
        },
      );
      await queryClient.invalidateQueries(queryKey);
      return data;
    },
  };
}
