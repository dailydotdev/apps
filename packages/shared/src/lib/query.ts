import {
  InfiniteData,
  QueryClient,
  QueryClientConfig,
  QueryKey,
} from 'react-query';
import cloneDeep from 'lodash.clonedeep';
import { Connection } from '../graphql/common';
import { EmptyObjectLiteral } from './kratos';
import { LoggedUser } from './user';
import { FeedData, Post, ReadHistoryPost } from '../graphql/posts';
import { ReadHistoryInfiniteData } from '../hooks/useInfiniteReadingHistory';

export type MutateFunc<T> = (variables: T) => Promise<(() => void) | undefined>;

export const generateQueryKey = (
  name: string | RequestKey,
  user: Pick<LoggedUser, 'id'> | null,
  ...additional: unknown[]
): unknown[] => {
  return [name, user?.id ?? 'anonymous', ...additional];
};

export const generateStorageKey = (
  key: RequestKey,
  ...params: string[]
): string =>
  (generateQueryKey(key, null, ...params) as Array<string>).join(':');

export enum RequestKey {
  Providers = 'providers',
  Bookmarks = 'bookmarks',
  PostComments = 'post_comments',
  PostCommentsMutations = 'post_comments_mutations',
  Actions = 'actions',
  Squad = 'squad',
  Search = 'search',
  SearchHistory = 'searchHistory',
  ReadingHistory = 'readingHistory',
  ReferralCampaigns = 'referral_campaigns',
  ContextMenu = 'context_menu',
  NotificationPreference = 'notification_preference',
  Banner = 'latest_banner',
  Auth = 'auth',
  CurrentSession = 'current_session',
}

export type HasConnection<
  TEntity,
  TKey extends keyof TEntity = keyof TEntity,
> = Partial<Record<TKey, Connection<unknown>>>;

interface InfiniteCacheProps<
  TEntity extends HasConnection<TEntity>,
  TKey extends keyof TEntity = keyof TEntity,
> {
  prop: TKey;
  queryKey: QueryKey;
  client: QueryClient;
}

export const filterInfiniteCache = <
  TEntity extends HasConnection<TEntity>,
  TKey extends keyof TEntity = keyof TEntity,
  TData extends TEntity[TKey]['edges'][0] = TEntity[TKey]['edges'][0],
  TReturn extends InfiniteData<TEntity> = InfiniteData<TEntity>,
>(
  { client, prop, queryKey }: InfiniteCacheProps<TEntity>,
  condition: (param: TData) => boolean,
): TReturn => {
  return client.setQueryData<TReturn>(queryKey, (data) => {
    if (!data) {
      return null;
    }

    return {
      ...data,
      pages: data?.pages?.map((edge) => ({
        ...edge,
        [prop]: {
          ...edge[prop],
          edges: edge[prop].edges.filter(condition),
        },
      })),
    };
  });
};

interface UpdateInfiniteCacheProps<
  TEntity extends HasConnection<TEntity>,
  TData extends TEntity[TKey]['edges'][0]['node'],
  TKey extends keyof TEntity = keyof TEntity,
> extends InfiniteCacheProps<TEntity, TKey> {
  page: number;
  edge: number;
  entity: Partial<TData>;
}

export const updateInfiniteCache = <
  TEntity extends HasConnection<TEntity>,
  TKey extends keyof TEntity = keyof TEntity,
  TData extends TEntity[TKey]['edges'][0]['node'] = TEntity[TKey]['edges'][0]['node'],
  TReturn extends InfiniteData<TEntity> = InfiniteData<TEntity>,
>({
  client,
  prop,
  queryKey,
  page,
  edge,
  entity,
}: UpdateInfiniteCacheProps<TEntity, TData>): TReturn => {
  return client.setQueryData<TReturn>(queryKey, (data) => {
    if (!data) {
      return null;
    }

    const updated = { ...data };
    const item = updated.pages[page][prop].edges[edge]
      .node as EmptyObjectLiteral;
    updated.pages[page][prop].edges[edge].node = { ...item, ...entity };

    return updated;
  });
};

export const defaultQueryClientConfig: QueryClientConfig = {
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: process.env.NODE_ENV !== 'development',
    },
  },
};

export const updateCachedPage = (
  feedQueryKey: unknown[],
  queryClient: QueryClient,
  pageIndex: number,
  manipulate: (page: Connection<Post>) => Connection<Post>,
): void => {
  queryClient.setQueryData<InfiniteData<FeedData>>(
    feedQueryKey,
    (currentData) => {
      const { pages } = currentData;
      const currentPage = cloneDeep(pages[pageIndex]);
      currentPage.page = manipulate(currentPage.page);
      const newPages = [
        ...pages.slice(0, pageIndex),
        currentPage,
        ...pages.slice(pageIndex + 1),
      ];
      return { pages: newPages, pageParams: currentData.pageParams };
    },
  );
};

export const updateCachedPagePost =
  (feedQueryKey: unknown[], queryClient: QueryClient) =>
  (pageIndex: number, index: number, post: Post): void => {
    updateCachedPage(feedQueryKey, queryClient, pageIndex, (page) => {
      // eslint-disable-next-line no-param-reassign
      page.edges[index].node = post;
      return page;
    });
  };

export const removeCachedPagePost =
  (feedQueryKey: unknown[], queryClient: QueryClient) =>
  (pageIndex: number, index: number): void => {
    updateCachedPage(feedQueryKey, queryClient, pageIndex, (page) => {
      // eslint-disable-next-line no-param-reassign
      page.edges.splice(index, 1);
      return page;
    });
  };

export const updateReadingHistoryListPost = ({
  queryKey,
  pageIndex,
  index,
  manipulate,
  queryClient,
}: {
  queryKey: unknown[];
  pageIndex: number;
  index: number;
  manipulate: (post: ReadHistoryPost) => ReadHistoryPost;
  queryClient: QueryClient;
}): (() => void) => {
  const oldData = !!queryClient.getQueryData<ReadHistoryInfiniteData>(queryKey);

  if (!oldData) {
    return () => undefined;
  }

  queryClient.setQueryData<ReadHistoryInfiniteData>(queryKey, (currentData) => {
    const updatedPage = cloneDeep(currentData.pages[pageIndex]);
    const currentPostNode = updatedPage.readHistory.edges[index].node;

    currentPostNode.post = {
      ...currentPostNode.post,
      ...manipulate(currentPostNode.post),
    };

    const updatedPages = [...currentData.pages];
    updatedPages.splice(pageIndex, 1, updatedPage);

    return {
      ...currentData,
      pages: updatedPages,
    };
  });

  return () => {
    queryClient.setQueryData(queryKey, oldData);
  };
};
