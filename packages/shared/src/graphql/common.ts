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

export interface Upvote {
  user: UserShortProfile;
}
