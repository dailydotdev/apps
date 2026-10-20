import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { QueryKey } from '@tanstack/react-query';
import type { Post } from '../../../graphql/posts';
import { gqlClient } from '../../../graphql/common';
import type { FeedHeroData } from '../../../graphql/feed';
import { FEED_HERO_QUERY, baseFeedSupportedTypes } from '../../../graphql/feed';
import type { PostHighlight } from '../../../graphql/highlights';
import { useAuthContext } from '../../../contexts/AuthContext';
import { generateQueryKey, RequestKey, StaleTime } from '../../../lib/query';
import { useCachedTokenRecovery } from '../../../hooks/useCachedTokenRecovery';

const empty: never[] = [];

/**
 * The hero's one query, shared by the hero section and the top story and
 * Happening Now widgets, so the rail fetches the headlines once however the
 * reader arranged them. Vote and bookmark patch this key through
 * `useFeedHeroPostActions`.
 */
export const useFeedHeroData = ({
  enabled = true,
}: { enabled?: boolean } = {}): {
  queryKey: QueryKey;
  posts: Post[];
  highlights: PostHighlight[];
  isPending: boolean;
} => {
  const { user, isTokenValid } = useAuthContext();
  const queryKey = useMemo(
    () => generateQueryKey(RequestKey.FeedHero, user),
    [user],
  );
  const isEnabled = isTokenValid && enabled;

  const { data, isPending } = useQuery({
    queryKey,
    queryFn: () =>
      gqlClient.request<FeedHeroData>(FEED_HERO_QUERY, {
        loggedIn: !!user,
        supportedTypes: baseFeedSupportedTypes,
      }),
    enabled: isEnabled,
    // The same window `majorHeadlinesQueryOptions` gives the in-feed card, so
    // the two surfaces the experiment compares are equally fresh.
    staleTime: StaleTime.OneMinute,
  });
  useCachedTokenRecovery({ queryKey, enabled: isEnabled });

  return {
    queryKey,
    posts: data?.feedHero?.posts ?? empty,
    highlights: data?.feedHero?.highlights ?? empty,
    isPending,
  };
};
