import {
  InfiniteData,
  QueryClient,
  QueryClientConfig,
  QueryKey,
} from 'react-query';
import { Connection } from '../graphql/common';
import { EmptyObjectLiteral } from './kratos';
import { LoggedUser } from './user';

export type MutateFunc<T> = (variables: T) => Promise<(() => void) | undefined>;

export const generateQueryKey = (
  name: string | RequestKey,
  user: Pick<LoggedUser, 'id'> | null,
  ...additional: QueryKey[]
): QueryKey => {
  return [name, user?.id ?? 'anonymous', ...additional];
};

export const generateStorageKey = (
  key: RequestKey,
  ...params: string[]
): string =>
  (generateQueryKey(key, null, ...params) as Array<string>).join(':');

export enum RequestKey {
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
