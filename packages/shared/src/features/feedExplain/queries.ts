import { queryOptions } from '@tanstack/react-query';
import type { LoggedUser } from '../../lib/user';
import { generateQueryKey, RequestKey, StaleTime } from '../../lib/query';
import { getFeedControls, getFeedProfile, getFeedTune } from './graphql';
import type { FeedControlsDraft } from './types';

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

// For You generated fresh with a draft of the controls. Never cached by the
// API, so each draft is its own key and only the open one is kept.
export const feedTuneQueryOptions = ({
  user,
  version,
  draft,
}: {
  user: QueryUser;
  version: number;
  draft: FeedControlsDraft;
}) =>
  queryOptions({
    queryKey: generateQueryKey(RequestKey.FeedTune, user, version, draft),
    queryFn: () => getFeedTune({ version, first: 20, draft }),
    staleTime: StaleTime.OneMinute,
    gcTime: 0,
    enabled: !!user?.id,
  });
