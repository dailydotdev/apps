import { useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import usePersistentContext from '../../../hooks/usePersistentContext';
import type { SentimentTopEntity } from './graphql';
import { topSentimentEntitiesOptions } from './queries';
import { ARENA_GROUP_IDS } from '../arena/config';

const ENTRYPOINT_GROUP_ID = ARENA_GROUP_IDS.llms;
const ENTRYPOINT_CACHE_KEY = `agents:leaderboard:entrypoint:${ENTRYPOINT_GROUP_ID}`;

interface UseAgentsLeaderboardEntrypoint {
  topEntity: SentimentTopEntity | null;
}

export const useAgentsLeaderboardEntrypoint =
  (): UseAgentsLeaderboardEntrypoint => {
    const [cachedTopEntities, setCachedTopEntities] = usePersistentContext<
      SentimentTopEntity[]
    >(ENTRYPOINT_CACHE_KEY, []);

    const { data: fetchedTopEntities, isFetched } = useQuery({
      ...topSentimentEntitiesOptions({
        groupId: ENTRYPOINT_GROUP_ID,
        limit: 1,
      }),
    });

    useEffect(() => {
      if (!isFetched || !fetchedTopEntities) {
        return;
      }

      setCachedTopEntities(fetchedTopEntities).catch(() => {
        // Failing to persist should not block the current render path.
      });
    }, [fetchedTopEntities, isFetched, setCachedTopEntities]);

    const topEntity = useMemo(
      () => fetchedTopEntities?.[0] ?? cachedTopEntities?.[0] ?? null,
      [cachedTopEntities, fetchedTopEntities],
    );

    return { topEntity };
  };
