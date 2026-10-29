import { queryOptions } from '@tanstack/react-query';
import type { LoggedUser } from '../../lib/user';
import { generateQueryKey, RequestKey, StaleTime } from '../../lib/query';
import { getFeedControls, getFeedProfile } from './graphql';

type QueryUser = Pick<LoggedUser, 'id'> | undefined;

export const feedProfileQueryKey = (user: QueryUser, version: number) =>
  generateQueryKey(RequestKey.FeedProfile, user, version);

// The weights For You ranks on, for the topics a card explanation doesn't
// name (it carries only the best match).
export const feedProfileQueryOptions = (user: QueryUser, version: number) =>
  queryOptions({
    queryKey: feedProfileQueryKey(user, version),
    queryFn: () => getFeedProfile(version),
    staleTime: StaleTime.FeedSettings,
    enabled: !!user?.id,
  });

export const feedControlsQueryKey = (user: QueryUser) =>
  generateQueryKey(RequestKey.FeedControls, user);

// The topic and source levels the reader set, and the two switches.
export const feedControlsQueryOptions = (user: QueryUser) =>
  queryOptions({
    queryKey: feedControlsQueryKey(user),
    queryFn: getFeedControls,
    staleTime: StaleTime.FeedSettings,
    enabled: !!user?.id,
  });
