import { useEffect, useMemo } from 'react';
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
import { storageWrapper } from '../../../lib/storageWrapper';
import { generateStorageKey, StorageTopic } from '../../../lib/storage';

const empty: never[] = [];

type CachedFeedHero = { data: FeedHeroData; savedAt: number };

const storageKey = (userId?: string): string =>
  generateStorageKey(StorageTopic.Post, 'feedHero', userId ?? 'anonymous');

const readCachedFeedHero = (userId?: string): CachedFeedHero | undefined => {
  const raw = storageWrapper.getItem(storageKey(userId));
  if (!raw) {
    return undefined;
  }
  try {
    const parsed = JSON.parse(raw) as CachedFeedHero;
    return Array.isArray(parsed?.data?.feedHero?.posts) &&
      typeof parsed.savedAt === 'number'
      ? parsed
      : undefined;
  } catch (err) {
    return undefined;
  }
};

/**
 * The lead post each reader saw first in this page session, by reader. The
 * top story shows it and the feed keeps it out of its grid, so the two agree
 * however often the hero query refreshes; a new lead waits for the next load.
 */
const heldLeads = new Map<string, Post>();

/** A fresh session's leads, for tests that render several sessions. */
export const clearHeldFeedHeroLeads = (): void => heldLeads.clear();

/**
 * The hero's one query, shared by the hero section and the top story and
 * Happening Now widgets, so the rail fetches the headlines once however the
 * reader arranged them. Vote and bookmark patch this key through
 * `useFeedHeroPostActions`.
 *
 * It starts from the last payload this reader got, cached per reader, so the
 * rail paints with its content on the first frame and revalidates in the
 * background for the next load.
 */
export const useFeedHeroData = ({
  enabled = true,
}: { enabled?: boolean } = {}): {
  queryKey: QueryKey;
  posts: Post[];
  highlights: PostHighlight[];
  /** The lead post held for this session (the live copy when it has one). */
  leadPost?: Post;
  isPending: boolean;
} => {
  const { user, isTokenValid } = useAuthContext();
  const queryKey = useMemo(
    () => generateQueryKey(RequestKey.FeedHero, user),
    [user],
  );
  const isEnabled = isTokenValid && enabled;
  const cached = useMemo(() => readCachedFeedHero(user?.id), [user?.id]);

  const { data, isPending, isFetchedAfterMount, dataUpdatedAt } = useQuery({
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
    // Older than the stale time, so the cached copy paints and is refetched.
    initialData: cached?.data,
    initialDataUpdatedAt: cached?.savedAt,
  });
  useCachedTokenRecovery({ queryKey, enabled: isEnabled });

  // What the next load starts from.
  useEffect(() => {
    if (!isFetchedAfterMount || !data?.feedHero) {
      return;
    }
    storageWrapper.setItem(
      storageKey(user?.id),
      JSON.stringify({ data, savedAt: dataUpdatedAt }),
    );
  }, [data, dataUpdatedAt, isFetchedAfterMount, user?.id]);

  const posts = data?.feedHero?.posts ?? empty;
  const readerKey = user?.id ?? 'anonymous';
  if (!heldLeads.has(readerKey) && posts[0]) {
    heldLeads.set(readerKey, posts[0]);
  }
  const held = heldLeads.get(readerKey);
  // The held post by id, so votes and bookmarks on the live copy still show.
  const leadPost = held && (posts.find(({ id }) => id === held.id) ?? held);

  return {
    queryKey,
    posts,
    highlights: data?.feedHero?.highlights ?? empty,
    leadPost,
    isPending,
  };
};
