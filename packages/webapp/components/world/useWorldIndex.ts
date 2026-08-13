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
  WorldDomainRankEntry,
  WorldDomainReaders,
  WorldLevelUp,
  WorldNicheSummary,
  WorldRankEntry,
  WorldRankPeriod,
  WorldRankPosition,
} from '../../graphql/worldIndex';
import {
  FOLLOWED_WORLDS_QUERY,
  WORLD_DOMAIN_RANKING_QUERY,
  WORLD_DOMAIN_RANK_POSITION_QUERY,
  WORLD_DOMAIN_READERS_QUERY,
  WORLD_RECENT_LEVEL_UPS_QUERY,
  WORLD_TOPIC_RANKING_QUERY,
  WORLD_TOPIC_RANK_POSITION_QUERY,
  WORLD_TOPIC_READERS_QUERY,
} from '../../graphql/worldIndex';
import type { WorldDomainStyle } from './worldIndexDomains';
import { worldDomains } from './worldIndexDomains';

/** Rankings and counts are the same answer for everyone, and rebuilt nightly. */
const indexStaleTime = StaleTime.OneHour;

export interface WorldDomain extends WorldDomainStyle {
  /** Topics the API places in this domain, in the order it returned them. */
  topics: WorldNicheSummary[];
  readers: number;
}

export interface WorldCatalogue {
  domains: WorldDomain[];
  isPending: boolean;
}

/**
 * The catalogue every other query on the page is keyed by.
 *
 * Topics arrive already grouped, because each one carries its domain now. A
 * domain the API returned no topics for is dropped: an empty tab is worse than
 * one fewer.
 */
export const useWorldCatalogue = (): WorldCatalogue => {
  const topics = useQuery({
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

  const domains = useQuery({
    queryKey: generateQueryKey(RequestKey.WorldDomainReaders),
    queryFn: async () => {
      const res = await gqlClient.request<{
        worldDomainReaders: WorldDomainReaders[];
      }>(WORLD_DOMAIN_READERS_QUERY);

      return res.worldDomainReaders;
    },
    staleTime: indexStaleTime,
  });

  return useMemo(() => {
    const readersOf = new Map(
      (domains.data ?? []).map((row) => [row.domain, row.readers]),
    );

    return {
      domains: worldDomains
        .map((style) => ({
          ...style,
          topics: (topics.data ?? []).filter(
            (topic) => topic.domain === style.id,
          ),
          readers: readersOf.get(style.id) ?? 0,
        }))
        .filter((domain) => domain.topics.length > 0),
      isPending: topics.isPending || domains.isPending,
    };
  }, [topics.data, topics.isPending, domains.data, domains.isPending]);
};

interface UseRanking<T> {
  entries: T[];
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
}): UseRanking<WorldRankEntry> => {
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
 * A whole domain's ranking.
 *
 * Its rows carry no level, because a rung belongs to one topic and a total
 * across a domain sits on none of them.
 */
export const useWorldDomainRanking = ({
  domain,
  period,
  limit,
}: {
  domain?: string;
  period: WorldRankPeriod;
  limit?: number;
}): UseRanking<WorldDomainRankEntry> => {
  const { data, isPending } = useQuery({
    queryKey: generateQueryKey(RequestKey.WorldDomainRanking, undefined, {
      domain,
      period,
      limit,
    }),
    queryFn: async () => {
      const res = await gqlClient.request<{
        worldDomainRanking: WorldDomainRankEntry[];
      }>(WORLD_DOMAIN_RANKING_QUERY, { domain, period, limit });

      return res.worldDomainRanking;
    },
    enabled: !!domain,
    staleTime: indexStaleTime,
  });

  return { entries: data ?? [], isPending: isPending && !!domain };
};

/**
 * Where the viewer stands, which the ranking's own page usually will not hold.
 *
 * Signed in only, and never merged into the ranking: a row that is already
 * there must not be drawn twice.
 */
export const useWorldRankPosition = ({
  nicheId,
  domain,
  period,
}: {
  nicheId?: string;
  domain?: string;
  period: WorldRankPeriod;
}): WorldRankPosition | undefined => {
  const { isLoggedIn } = useAuthContext();
  const byDomain = !!domain;

  const { data } = useQuery({
    queryKey: generateQueryKey(RequestKey.WorldRankPosition, undefined, {
      nicheId,
      domain,
      period,
    }),
    queryFn: async () => {
      if (byDomain) {
        const res = await gqlClient.request<{
          worldDomainRankPosition: WorldRankPosition;
        }>(WORLD_DOMAIN_RANK_POSITION_QUERY, { domain, period });

        return res.worldDomainRankPosition;
      }

      const res = await gqlClient.request<{
        worldTopicRankPosition: WorldRankPosition;
      }>(WORLD_TOPIC_RANK_POSITION_QUERY, { nicheId, period });

      return res.worldTopicRankPosition;
    },
    enabled: isLoggedIn && (byDomain || !!nicheId),
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
