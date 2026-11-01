import type { ReactNode } from 'react';
import { useCallback, useMemo, useSyncExternalStore } from 'react';
import { createContextProvider } from '@kickass-coderz/react';
import type { InfiniteData, QueryKey } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';
import type { FeedItemData } from '../../graphql/feed';
import { getFeedApiItemPost } from '../../graphql/feed';
import type { Post } from '../../graphql/posts';
import { isSourceUserSource } from '../../graphql/sources';
import { safeContextHookExport } from '../../lib/func';
import type { FeedItemExplain } from './types';
import {
  getAuthorFactor,
  getAuthorLabel,
  getSourceFactor,
  isAuthorFollowed,
  isSourceFollowed,
} from './describe';
import { useFeedTuneState } from './useFeedTune';

/** Where Tune moved a card: new on the page, or places up (+) or down (-). */
export type TuneMovement = 'new' | number;

interface TunePageEntity {
  id: string;
  name: string;
  image: string;
  /** What a follow or level gives its posts now, 1 without one. */
  factor: number;
  /** A card on the page was ranked with the reader following it. */
  isFollowed: boolean;
}

export interface TunePageSource extends TunePageEntity {
  handle: string;
}

/** An author on the page, keyed by user id. */
export interface TunePageAuthor extends TunePageEntity {
  username?: string;
}

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
  /** The sources and authors on the page, for the reader to steer. */
  sources: TunePageSource[];
  authors: TunePageAuthor[];
}

interface FeedTuneProviderProps {
  /** The feed's own query, the page Tune compares against. */
  baseQueryKey?: QueryKey;
  /** The feed's query with the draft, once there is one. */
  previewQueryKey?: QueryKey;
  children?: ReactNode;
}

type CachedPost = Post & { explain?: FeedItemExplain | null };

const noPosts: CachedPost[] = [];

// The first page a feed query holds, followed without fetching it: the feed
// fetches its own pages, and Tune only compares them.
const useFirstPage = (
  queryKey: QueryKey | undefined,
): CachedPost[] | undefined => {
  const client = useQueryClient();
  const data = useSyncExternalStore(
    (onChange) => client.getQueryCache().subscribe(onChange),
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
        return post ? [post as CachedPost] : [];
      }),
    [data],
  );
};

// Whether a feed query failed, followed the same way as its first page.
const useHasFailed = (queryKey: QueryKey | undefined): boolean => {
  const client = useQueryClient();
  return useSyncExternalStore(
    (onChange) => client.getQueryCache().subscribe(onChange),
    () => !!queryKey && client.getQueryState(queryKey)?.status === 'error',
    () => false,
  );
};

const describeMovement = (
  before: Map<string, number>,
  after: CachedPost[],
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
    const sources = useMemo(() => {
      const byId = new Map<string, TunePageSource>();
      base.forEach(({ source, explain }) => {
        if (source?.id && source.name && !isSourceUserSource(source)) {
          byId.set(source.id, {
            id: source.id,
            name: source.name,
            image: source.image,
            handle: source.handle,
            factor: getSourceFactor(explain),
            isFollowed:
              !!byId.get(source.id)?.isFollowed || isSourceFollowed(explain),
          });
        }
      });
      return [...byId.values()];
    }, [base]);
    const authors = useMemo(() => {
      const byId = new Map<string, TunePageAuthor>();
      base.forEach(({ author, explain }) => {
        if (author?.id && (author.name || author.username)) {
          byId.set(author.id, {
            id: author.id,
            name: getAuthorLabel(author),
            image: author.image,
            username: author.username,
            factor: getAuthorFactor(explain),
            isFollowed:
              !!byId.get(author.id)?.isFollowed || isAuthorFollowed(explain),
          });
        }
      });
      return [...byId.values()];
    }, [base]);

    return useMemo(
      () => ({
        getMovement,
        isLoading: !!previewQueryKey && !preview && !hasFailed,
        isError: !preview && hasFailed,
        retry,
        isOutdated: !!preview && pendingCount > 0,
        summary: preview ? describeMovement(before, preview) : undefined,
        sources,
        authors,
      }),
      [
        getMovement,
        previewQueryKey,
        preview,
        hasFailed,
        retry,
        pendingCount,
        before,
        sources,
        authors,
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
    sources: [],
    authors: [],
  },
);

export { FeedTuneProvider, useFeedTuneContext };
