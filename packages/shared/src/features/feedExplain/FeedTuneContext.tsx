import type { ReactNode } from 'react';
import { useCallback, useMemo, useSyncExternalStore } from 'react';
import { createContextProvider } from '@kickass-coderz/react';
import type { InfiniteData, QueryKey } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';
import type { FeedItemData } from '../../graphql/feed';
import { getFeedApiItemPost } from '../../graphql/feed';
import type { Post } from '../../graphql/posts';
import { safeContextHookExport } from '../../lib/func';
import { useFeedTuneState } from './useFeedTuneState';

/** Where Tune moved a card: new on the page, or places up (+) or down (-). */
export type TuneMovement = 'new' | number;

interface FeedTuneContextValue {
  /** Set while the feed shows a draft, against the page it replaced. */
  getMovement: (postId: string) => TuneMovement | undefined;
  /** The preview's first page is on its way. */
  isLoading: boolean;
  /** The preview's first page failed to load. */
  isError: boolean;
  /** Fetches the failed preview again. */
  retry: () => void;
  /** Changes were made since the preview, so its movement is not current. */
  isOutdated: boolean;
  /** How the draft moved the page, in one line. */
  summary?: string;
  /** The posts on the page Tune compares against, for the reader to steer. */
  posts: Post[];
}

interface FeedTuneProviderProps {
  /** The feed's own query, the page Tune compares against. */
  baseQueryKey?: QueryKey;
  /** The feed's query with the draft, once there is one. */
  previewQueryKey?: QueryKey;
  children?: ReactNode;
}

const noPosts: Post[] = [];

// Follows the query cache, only while there is a query to follow.
const useQueryCacheSubscribe = (queryKey: QueryKey | undefined) => {
  const client = useQueryClient();
  const hasQuery = !!queryKey;
  return useCallback(
    (onChange: () => void) =>
      hasQuery ? client.getQueryCache().subscribe(onChange) : () => undefined,
    [client, hasQuery],
  );
};

// The first page a feed query holds, followed without fetching it: the feed
// fetches its own pages, and Tune only compares them.
const useFirstPage = (queryKey: QueryKey | undefined): Post[] | undefined => {
  const client = useQueryClient();
  const subscribe = useQueryCacheSubscribe(queryKey);
  const data = useSyncExternalStore(
    subscribe,
    () =>
      queryKey
        ? client.getQueryData<InfiniteData<FeedItemData>>(queryKey)
        : undefined,
    () => undefined,
  );

  return useMemo(
    () =>
      data &&
      (data.pages[0]?.page.edges ?? []).flatMap(({ node }) => {
        const post = getFeedApiItemPost(node);
        return post ? [post] : [];
      }),
    [data],
  );
};

// Whether a feed query failed, followed the same way as its first page.
const useHasFailed = (queryKey: QueryKey | undefined): boolean => {
  const client = useQueryClient();
  const subscribe = useQueryCacheSubscribe(queryKey);
  return useSyncExternalStore(
    subscribe,
    () => !!queryKey && client.getQueryState(queryKey)?.status === 'error',
    () => false,
  );
};

const describeMovement = (
  before: Map<string, number>,
  after: Post[],
): string => {
  const ids = new Set(after.map(({ id }) => id));
  const incoming = after.filter(({ id }) => !before.has(id)).length;
  const moved = after.filter(
    ({ id }, index) => before.has(id) && before.get(id) !== index,
  ).length;
  const left = [...before.keys()].filter((id) => !ids.has(id)).length;
  const parts = [
    incoming && `${incoming} new ${incoming === 1 ? 'post' : 'posts'}`,
    moved && `${moved} moved`,
    left && `${left} left the page`,
  ].filter(Boolean);
  return parts.length ? `${parts.join(', ')}.` : 'Nothing moved on the page.';
};

const [FeedTuneProvider, useFeedTuneContextHook] = createContextProvider(
  ({
    baseQueryKey,
    previewQueryKey,
  }: FeedTuneProviderProps): FeedTuneContextValue => {
    const base = useFirstPage(baseQueryKey) ?? noPosts;
    const preview = useFirstPage(previewQueryKey);
    const hasFailed = useHasFailed(previewQueryKey);
    const client = useQueryClient();
    const { pendingCount } = useFeedTuneState();
    const before = useMemo(
      () => new Map(base.map(({ id }, index) => [id, index])),
      [base],
    );
    const after = useMemo(
      () => new Map((preview ?? noPosts).map(({ id }, index) => [id, index])),
      [preview],
    );

    const getMovement = useCallback(
      (postId: string): TuneMovement | undefined => {
        const index = after.get(postId);
        if (index === undefined) {
          return undefined;
        }
        const was = before.get(postId);
        return was === undefined ? 'new' : was - index;
      },
      [after, before],
    );
    const retry = useCallback(() => {
      if (previewQueryKey) {
        client.resetQueries({ queryKey: previewQueryKey });
      }
    }, [client, previewQueryKey]);

    return useMemo(
      () => ({
        getMovement,
        isLoading: !!previewQueryKey && !preview && !hasFailed,
        isError: !preview && hasFailed,
        retry,
        isOutdated: !!preview && pendingCount > 0,
        summary: preview ? describeMovement(before, preview) : undefined,
        posts: base,
      }),
      [
        getMovement,
        previewQueryKey,
        preview,
        hasFailed,
        retry,
        pendingCount,
        before,
        base,
      ],
    );
  },
  { errorMessage: 'ContextNotFound' },
);

const useFeedTuneContext = safeContextHookExport(
  useFeedTuneContextHook,
  'ContextNotFound',
  {
    getMovement: () => undefined,
    isLoading: false,
    isError: false,
    retry: () => undefined,
    isOutdated: false,
    posts: noPosts,
  },
);

export { FeedTuneProvider, useFeedTuneContext };
