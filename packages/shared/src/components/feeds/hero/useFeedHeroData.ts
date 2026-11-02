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
 * Every lead each reader was shown in this page session, by reader. The top
 * story follows the live payload, and the feed keeps all of them out of its
 * grid, so a lead that rotates out never drops into a page already painted.
 */
const shownLeads = new Map<string, string[]>();

/**
 * The lead drawn for each reader this page load. Any of the hero's posts can
 * lead, so the top story changes from load to load rather than sitting on the
 * strongest post until it ages out; the draw holds while that post is still in
 * the payload, so a refetch does not swap the card under the reader.
 */
const pickedLeads = new Map<string, string>();

const pickLead = (readerKey: string, posts: Post[]): Post | undefined => {
  if (!posts.length) {
    return undefined;
  }
  const picked = posts.find(({ id }) => id === pickedLeads.get(readerKey));
  if (picked) {
    return picked;
  }
  const lead = posts[Math.floor(Math.random() * posts.length)];
  pickedLeads.set(readerKey, lead.id);
  return lead;
};

/** A fresh session's leads, for tests that render several sessions. */
export const clearShownFeedHeroLeads = (): void => {
  shownLeads.clear();
  pickedLeads.clear();
};

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
  leadPost?: Post;
  /** Every lead shown this session, the current one last. */
  shownLeadIds: string[];
  /**
   * The lead is the live one, not a stale cached copy about to be replaced,
   * so an impression on it counts.
   */
  isLeadFresh: boolean;
  isPending: boolean;
} => {
  const { user, isTokenValid } = useAuthContext();
  const queryKey = useMemo(
    () => generateQueryKey(RequestKey.FeedHero, user),
    [user],
  );
  const isEnabled = isTokenValid && enabled;
  const cached = useMemo(() => readCachedFeedHero(user?.id), [user?.id]);

  const { data, isPending, isFetchedAfterMount, isStale, dataUpdatedAt } =
    useQuery({
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
  const leadPost = pickLead(readerKey, posts);
  const shown = shownLeads.get(readerKey) ?? empty;
  if (leadPost && !shown.includes(leadPost.id)) {
    shownLeads.set(readerKey, [...shown, leadPost.id]);
  }

  return {
    queryKey,
    posts,
    highlights: data?.feedHero?.highlights ?? empty,
    leadPost,
    shownLeadIds: shownLeads.get(readerKey) ?? empty,
    isLeadFresh: isFetchedAfterMount || !isStale,
    isPending,
  };
};
