import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { gqlClient } from '@dailydotdev/shared/src/graphql/common';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import {
  generateQueryKey,
  RequestKey,
  StaleTime,
} from '@dailydotdev/shared/src/lib/query';
import type {
  IndexedWorld,
  WorldLevelUp,
  WorldNicheSummary,
  WorldRankEntry,
  WorldRankPosition,
  WorldRankPeriod,
} from '../../graphql/worldIndex';
import {
  FOLLOWED_WORLDS_QUERY,
  WORLD_RECENT_LEVEL_UPS_QUERY,
  WORLD_TOPIC_RANKING_QUERY,
  WORLD_TOPIC_RANK_POSITION_QUERY,
  WORLD_TOPIC_READERS_QUERY,
} from '../../graphql/worldIndex';
import type { WorldCategory } from './worldIndexTaxonomy';
import { worldCategories } from './worldIndexTaxonomy';

/** Rankings and counts are the same answer for everyone, and rebuilt nightly. */
const indexStaleTime = StaleTime.OneHour;

export interface WorldCatalogue {
  /** Every topic the index knows, keyed by slug. */
  bySlug: Map<string, WorldNicheSummary>;
  /** Categories that actually have topics behind them. */
  categories: WorldCategory[];
  isPending: boolean;
}

/**
 * The topic catalogue, which every other query on the page is keyed by.
 *
 * The grouping is local taxonomy and the ids are the API's, so the two are
 * joined on the slug here rather than in each consumer. A category whose
 * niches the API does not return is dropped: an empty tab is worse than one
 * fewer.
 */
export const useWorldCatalogue = (): WorldCatalogue => {
  const { data, isPending } = useQuery({
    queryKey: generateQueryKey(RequestKey.WorldTopicReaders),
    queryFn: async () => {
      const res = await gqlClient.request<{
        worldTopicReaders: { niche: WorldNicheSummary; readers: number }[];
      }>(WORLD_TOPIC_READERS_QUERY);

      return res.worldTopicReaders.map(({ niche, readers }) => ({
        ...niche,
        readers,
      }));
    },
    staleTime: indexStaleTime,
  });

  return useMemo(() => {
    const bySlug = new Map((data ?? []).map((niche) => [niche.slug, niche]));

    return {
      bySlug,
      categories: worldCategories.filter((category) =>
        category.topics.some((slug) => bySlug.has(slug)),
      ),
      isPending,
    };
  }, [data, isPending]);
};

interface UseWorldTopicRanking {
  entries: WorldRankEntry[];
  isPending: boolean;
}

export const useWorldTopicRanking = ({
  nicheId,
  period,
  limit,
}: {
  nicheId?: string;
  period: WorldRankPeriod;
  limit?: number;
}): UseWorldTopicRanking => {
  const { data, isPending } = useQuery({
    queryKey: generateQueryKey(RequestKey.WorldTopicRanking, undefined, {
      nicheId,
      period,
      limit,
    }),
    queryFn: async () => {
      const res = await gqlClient.request<{
        worldTopicRanking: WorldRankEntry[];
      }>(WORLD_TOPIC_RANKING_QUERY, { nicheId, period, limit });

      return res.worldTopicRanking;
    },
    enabled: !!nicheId,
    staleTime: indexStaleTime,
  });

  return { entries: data ?? [], isPending: isPending && !!nicheId };
};

/**
 * Where the viewer stands, which the ranking's own page usually will not hold.
 *
 * Signed in only, and never merged into the ranking: a row that is already
 * there must not be drawn twice.
 */
export const useWorldTopicRankPosition = ({
  nicheId,
  period,
}: {
  nicheId?: string;
  period: WorldRankPeriod;
}): WorldRankPosition | undefined => {
  const { isLoggedIn } = useAuthContext();

  const { data } = useQuery({
    queryKey: generateQueryKey(RequestKey.WorldTopicRankPosition, undefined, {
      nicheId,
      period,
    }),
    queryFn: async () => {
      const res = await gqlClient.request<{
        worldTopicRankPosition: WorldRankPosition;
      }>(WORLD_TOPIC_RANK_POSITION_QUERY, { nicheId, period });

      return res.worldTopicRankPosition;
    },
    enabled: isLoggedIn && !!nicheId,
    staleTime: indexStaleTime,
  });

  return data;
};

interface UseWorldSection<T> {
  items: T[];
  isPending: boolean;
}

export const useWorldRecentLevelUps = (
  limit?: number,
): UseWorldSection<WorldLevelUp> => {
  const { data, isPending } = useQuery({
    queryKey: generateQueryKey(RequestKey.WorldRecentLevelUps, undefined, {
      limit,
    }),
    queryFn: async () => {
      const res = await gqlClient.request<{
        worldRecentLevelUps: WorldLevelUp[];
      }>(WORLD_RECENT_LEVEL_UPS_QUERY, { limit });

      return res.worldRecentLevelUps;
    },
    staleTime: indexStaleTime,
  });

  return { items: data ?? [], isPending };
};

export const useFollowedWorlds = (
  limit?: number,
): UseWorldSection<IndexedWorld> => {
  const { user, isLoggedIn } = useAuthContext();

  const { data, isPending } = useQuery({
    queryKey: generateQueryKey(RequestKey.FollowedWorlds, user, { limit }),
    queryFn: async () => {
      const res = await gqlClient.request<{ followedWorlds: IndexedWorld[] }>(
        FOLLOWED_WORLDS_QUERY,
        { limit },
      );

      return res.followedWorlds;
    },
    enabled: isLoggedIn,
    staleTime: indexStaleTime,
  });

  return { items: data ?? [], isPending: isPending && isLoggedIn };
};
