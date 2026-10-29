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

/** Where Tune moved a card: new on the page, or places up (+) or down (-). */
export type TuneMovement = 'new' | number;

export interface TunePageSource {
  id: string;
  name: string;
  /** What a follow or level gives its posts now, 1 without one. */
  factor: number;
  /** A card on the page was ranked with the reader following it. */
  isFollowed: boolean;
}

/** An author on the page, with the same fields keyed by user id. */
export type TunePageAuthor = TunePageSource;

interface FeedTuneContextValue {
  /** Set while the feed shows a draft, against the page it replaced. */
  getMovement: (postId: string) => TuneMovement | undefined;
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

// The first page a feed query holds, followed without fetching it: the feed
// fetches its own pages, and Tune only compares them.
const useFirstPage = (queryKey: QueryKey | undefined): CachedPost[] => {
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
      (data?.pages[0]?.page.edges ?? []).flatMap(({ node }) => {
        const post = getFeedApiItemPost(node);
        return post ? [post as CachedPost] : [];
      }),
    [data],
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
    const base = useFirstPage(baseQueryKey);
    const preview = useFirstPage(previewQueryKey);
    const before = useMemo(
      () => new Map(base.map(({ id }, index) => [id, index])),
      [base],
    );
    const after = useMemo(
      () => new Map(preview.map(({ id }, index) => [id, index])),
      [preview],
    );
    const isPreviewing = !!previewQueryKey && preview.length > 0;

    const getMovement = useCallback(
      (postId: string): TuneMovement | undefined => {
        const index = after.get(postId);
        if (!isPreviewing || index === undefined) {
          return undefined;
        }
        const was = before.get(postId);
        return was === undefined ? 'new' : was - index;
      },
      [after, before, isPreviewing],
    );
    const sources = useMemo(() => {
      const byId = new Map<string, TunePageSource>();
      base.forEach(({ source, explain }) => {
        if (source?.id && source.name && !isSourceUserSource(source)) {
          byId.set(source.id, {
            id: source.id,
            name: source.name,
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
        summary: isPreviewing ? describeMovement(before, preview) : undefined,
        sources,
        authors,
      }),
      [getMovement, isPreviewing, before, preview, sources, authors],
    );
  },
  { errorMessage: 'ContextNotFound' },
);

const useFeedTuneContext = safeContextHookExport(
  useFeedTuneContextHook,
  'ContextNotFound',
  { getMovement: () => undefined, sources: [], authors: [] },
);

export { FeedTuneProvider, useFeedTuneContext };
