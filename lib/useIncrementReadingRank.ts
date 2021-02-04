import { useQueryClient } from 'react-query';
import { useContext } from 'react';
import AuthContext from '../components/AuthContext';
import { getRankQueryKey } from './useReadingRank';
import { MyRankData } from '../graphql/users';
import { STEPS_PER_RANK } from './rank';

type ReturnType = {
  incrementReadingRank: () => MyRankData;
};

const MAX_PROGRESS = STEPS_PER_RANK[STEPS_PER_RANK.length - 1];

export default function useIncrementReadingRank(): ReturnType {
  const { user } = useContext(AuthContext);
  const queryClient = useQueryClient();

  return {
    incrementReadingRank: () =>
      queryClient.setQueryData<MyRankData>(
        getRankQueryKey(user),
        (currentRank) => {
          if (
            !currentRank ||
            currentRank.rank.readToday ||
            currentRank.rank.progressThisWeek === MAX_PROGRESS ||
            (!user && currentRank.rank.progressThisWeek === STEPS_PER_RANK[0])
          ) {
            return currentRank;
          }
          const rank = currentRank.rank.currentRank;
          const progress = currentRank.rank.progressThisWeek + 1;
          return {
            rank: {
              readToday: true,
              currentRank: progress >= STEPS_PER_RANK[rank] ? rank + 1 : rank,
              progressThisWeek: progress,
              lastReadTime: new Date(),
            },
          };
        },
      ),
  };
}
