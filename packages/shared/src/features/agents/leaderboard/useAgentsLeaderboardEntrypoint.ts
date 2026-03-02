import { useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import usePersistentContext from '../../../hooks/usePersistentContext';
import type { SentimentTopEntity } from './graphql';
import { topSentimentEntitiesOptions } from './queries';

const getEntrypointCacheKey = (groupId: string): string =>
  `agents:leaderboard:entrypoint:${groupId}`;

interface UseAgentsLeaderboardEntrypointProps {
  groupId: string;
}

interface UseAgentsLeaderboardEntrypoint {
  topEntity: SentimentTopEntity | null;
}

export const useAgentsLeaderboardEntrypoint = ({
  groupId,
}: UseAgentsLeaderboardEntrypointProps): UseAgentsLeaderboardEntrypoint => {
  const [cachedTopEntities, setCachedTopEntities] = usePersistentContext<
    SentimentTopEntity[]
  >(getEntrypointCacheKey(groupId), []);

  const { data: fetchedTopEntities, isFetched } = useQuery({
    ...topSentimentEntitiesOptions({ groupId, limit: 1 }),
    enabled: !!groupId,
  });

  useEffect(() => {
    if (!isFetched || !fetchedTopEntities) {
      return;
    }

    setCachedTopEntities(fetchedTopEntities).catch(() => {
      // Failing to persist should not block the current render path.
    });
  }, [fetchedTopEntities, isFetched, setCachedTopEntities]);

  const topEntity = useMemo(() => {
    if (fetchedTopEntities?.length) {
      return fetchedTopEntities[0];
    }

    if (cachedTopEntities?.length) {
      return cachedTopEntities[0];
    }

    return null;
  }, [cachedTopEntities, fetchedTopEntities]);

  return { topEntity };
};
