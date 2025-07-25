import { GraphQLClient } from 'graphql-request';
import type { QueryKey, UseInfiniteQueryOptions } from '@tanstack/react-query';
import type { GraphQLError } from 'graphql-request/dist/types';
import type { PublicProfile, UserShortProfile } from '../lib/user';
import { graphqlUrl } from '../lib/config';
import type { UserTransactionStatus } from './njord';
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
  options?: Omit<Partial<UseInfiniteQueryOptions<T>>, 'select'>;
}

export type RequestDataConnection<TEntity, TKey extends string> = Record<
  TKey,
  Connection<TEntity>
>;

export const REQUEST_PROTOCOL_KEY = ['request-protocol'];
export interface RequestProtocol {
  requestMethod?: typeof gqlClient.request;
  fetchMethod?: typeof fetch;
  isCompanion?: boolean;
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

export enum ApiError {
  Forbidden = 'FORBIDDEN',
  NotFound = 'NOT_FOUND',
  RateLimited = 'RATE_LIMITED',
  BalanceTransactionError = 'BALANCE_TRANSACTION_ERROR',
}

export enum ApiErrorMessage {
  SourcePermissionInviteInvalid = 'SOURCE_PERMISSION_INVITE_INVALID',
}

export const getApiError = (
  error: ApiErrorResult,
  code: ApiError,
): ApiResponseError =>
  error?.response?.errors?.find(({ extensions }) => extensions?.code === code);

interface ApiResponseErrorExtension {
  code: ApiError;
}

export interface ApiUserTransactionErrorExtension
  extends ApiResponseErrorExtension {
  status: UserTransactionStatus;
  balance?: {
    amount: number;
  };
  transactionId: string;
}

export interface ApiResponseError<
  TExtension extends ApiResponseErrorExtension = ApiResponseErrorExtension,
> {
  message: ApiErrorMessage | string;
  extensions: TExtension;
}

interface ApiResponse<
  TExtension extends ApiResponseErrorExtension = ApiResponseErrorExtension,
> {
  errors: ApiResponseError<TExtension>[];
}

export interface ApiErrorResult<
  TExtension extends ApiResponseErrorExtension = ApiResponseErrorExtension,
> {
  response: ApiResponse<TExtension>;
}

export const GARMR_ERROR = 'GARMR_BROKEN_ERROR';
export const DEFAULT_ERROR = 'An error occurred, please try again';

export const errorMessage = {
  profile: {
    invalidUsername: 'Invalid character detected! Only underscores (_) allowed',
    usernameLength: 'Username must be between 3-38 characters',
    invalidHandle: 'Invalid character(s) found in social handle',
    invalidSocialLinks:
      'Please follow the appropriate format to add your links',
  },
};

export interface ReferredUsersData {
  referredUsers: Connection<PublicProfile>;
}

export interface MutationError {
  data: unknown;
  errors: GraphQLError[];
}

export interface ResponseError {
  response: MutationError;
}

GraphQLClient.prototype.unsetHeader = function unsetHeader(name: string) {
  delete this.options.headers?.[name];
  return this;
};

export const gqlClient = new GraphQLClient(graphqlUrl, {
  credentials: 'include',
  fetch: globalThis.fetch,
});

export const gqlRequest: typeof gqlClient.request = (...args) =>
  gqlClient.request(...args);
