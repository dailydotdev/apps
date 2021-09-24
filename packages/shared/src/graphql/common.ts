import { UpvoterProfile } from '../lib/user';
// GraphQL Relay pagination types

export type ConnectionCursor = string;

export interface PageInfo {
  __typename?: string;
  startCursor?: ConnectionCursor | null;
  endCursor?: ConnectionCursor | null;
  hasPreviousPage?: boolean | null;
  hasNextPage?: boolean | null;
}

export interface Connection<T> {
  __typename?: string;
  edges: Array<Edge<T>>;
  pageInfo: PageInfo;
}

export interface Edge<T> {
  __typename?: string;
  node: T;
  cursor?: ConnectionCursor;
}

export type HasConnection<
  TEntity,
  TKey extends keyof Connection<TEntity>,
> = Record<TKey, Connection<TEntity>>;

export const DEFAULT_UPVOTES_PER_PAGE = 50;

export interface Upvote {
  user: UpvoterProfile;
  createdAt: Date;
}
