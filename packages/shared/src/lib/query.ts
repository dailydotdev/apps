import { InfiniteData, QueryClient, QueryKey } from 'react-query';
import { Connection } from '../graphql/common';
import { LoggedUser } from './user';

export type MutateFunc<T> = (variables: T) => Promise<(() => void) | undefined>;

export const generateQueryKey = (
  name: string | RequestKey,
  user: Pick<LoggedUser, 'id'> | null,
  ...additional: unknown[]
): unknown[] => {
  return [name, user?.id ?? 'anonymous', ...additional];
};

export enum RequestKey {
  Bookmarks = 'bookmarks',
}

export type HasConnection<
  TEntity,
  TKey extends keyof TEntity = keyof TEntity,
> = Partial<Record<TKey, Connection<unknown>>>;

interface UpdateCacheProps<
  T extends HasConnection<T>,
  K extends keyof T = keyof T,
> {
  prop: K;
  queryKey: QueryKey;
  client: QueryClient;
  condition: (param: T[K]['edges'][0]) => boolean;
}

export const filterCache = <T extends HasConnection<T>>({
  client,
  prop,
  queryKey,
  condition,
}: UpdateCacheProps<T>): InfiniteData<T> => {
  return client.setQueryData<InfiniteData<T>>(queryKey, (feed) => {
    if (!feed) return null;

    return {
      ...feed,
      pages: feed?.pages?.map((edge) => ({
        ...edge,
        [prop]: {
          ...edge[prop],
          edges: edge[prop].edges.filter(condition),
        },
      })),
    };
  });
};
