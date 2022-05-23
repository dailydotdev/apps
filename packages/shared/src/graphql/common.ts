import request from 'graphql-request';
import { QueryKey, UseInfiniteQueryOptions } from 'react-query';
import { UserShortProfile } from '../lib/user';
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

export const DEFAULT_UPVOTES_PER_PAGE = 50;

export interface Upvote {
  user: UserShortProfile;
  createdAt: Date;
}

export interface UpvotesData {
  upvotes: Connection<Upvote>;
}

export interface RequestQueryParams {
  [key: string]: unknown;
  first: number;
}

export interface RequestQuery<T> {
  queryKey: QueryKey;
  query: string;
  params?: RequestQueryParams;
  options?: UseInfiniteQueryOptions<T>;
}

export type RequestDataConnection<TEntity, TKey extends string> = Record<
  TKey,
  Connection<TEntity>
>;

export const REQUEST_PROTOCOL_KEY = 'request-protocol';
export interface RequestProtocol {
  requestMethod?: typeof request;
  fetchMethod?: typeof fetch;
}

export const isQueryKeySame = (left: QueryKey, right: QueryKey): boolean => {
  if (typeof left !== typeof right) {
    return false;
  }

  if (typeof left === 'string' && typeof right === 'string') {
    return left === right;
  }

  if (Array.isArray(left) && Array.isArray(right)) {
    if (left.length !== right.length) {
      return false;
    }

    return left.every((key, i) => key === right[i]);
  }

  return false;
};
