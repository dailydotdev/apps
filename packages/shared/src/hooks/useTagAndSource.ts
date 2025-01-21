import { useCallback, useContext } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import AuthContext from '../contexts/AuthContext';
import LogContext from '../contexts/LogContext';
import useMutateFilters from './useMutateFilters';
import type { Source } from '../graphql/sources';
import AlertContext from '../contexts/AlertContext';
import type { BooleanPromise } from '../components/filters/common';
import { generateQueryKey, RequestKey } from '../lib/query';
import useDebounceFn from './useDebounceFn';
import { SharedFeedPage } from '../components/utilities';
import type { Origin } from '../lib/log';
import { LogEvent } from '../lib/log';
import type { AuthTriggersType } from '../lib/auth';
import { ContentPreferenceType } from '../graphql/contentPreference';

export interface TagActionArguments {
  tags: Array<string>;
  category?: string;
  requireLogin?: boolean;
}

export interface SourceActionArguments {
  source: Source;
  requireLogin?: boolean;
}

interface UseTagAndSourceProps {
  origin?: Origin;
  postId?: string;
  shouldInvalidateQueries?: boolean;
  shouldUpdateAlerts?: boolean;
  shouldFilterLocally?: boolean;
  feedId?: string;
}

interface UseTagAndSource {
  onFollowTags: (params: TagActionArguments) => BooleanPromise;
  onUnfollowTags: (params: TagActionArguments) => BooleanPromise;
  onBlockTags: (params: TagActionArguments) => BooleanPromise;
  onUnblockTags: (params: TagActionArguments) => BooleanPromise;
  onUnblockSource: (params: SourceActionArguments) => BooleanPromise;
  onBlockSource: (params: SourceActionArguments) => BooleanPromise;
  onUnfollowSource: (params: SourceActionArguments) => BooleanPromise;
  onFollowSource: (params: SourceActionArguments) => BooleanPromise;
}

export default function useTagAndSource({
  origin,
  postId,
  shouldInvalidateQueries = true,
  shouldUpdateAlerts = true,
  feedId,
  shouldFilterLocally = false,
}: UseTagAndSourceProps): UseTagAndSource {
  const queryClient = useQueryClient();
  const { alerts, updateAlerts } = useContext(AlertContext);
  const { user, showLogin } = useContext(AuthContext);
  const { logEvent } = useContext(LogContext);
  const shouldShowLogin = useCallback(
    (requireLogin?: boolean) => (user ? false : requireLogin),
    [user],
  );

  const {
    followTags,
    unfollowTags,
    blockTag,
    unblockTag,
    unblockSource,
    blockSource,
    followSource,
    unfollowSource,
  } = useMutateFilters(user, feedId, shouldFilterLocally);

  const [invalidateQueries] = useDebounceFn(() => {
    if (!shouldInvalidateQueries) {
      return;
    }

    queryClient.invalidateQueries({
      queryKey: generateQueryKey(SharedFeedPage.MyFeed, user),
    });
  }, 100);

  const invalidateContentPreferences = useCallback(
    ({
      entity,
      subQuery,
    }: {
      entity: ContentPreferenceType;
      subQuery: RequestKey;
    }) => {
      queryClient.invalidateQueries({
        queryKey: generateQueryKey(
          RequestKey.ContentPreference,
          user,
          subQuery,
          {
            feedId: feedId || user?.id,
            entity,
          },
        ),
      });
    },
    [queryClient, user, feedId],
  );

  const onFollowTags = useCallback(
    async ({ tags, category, requireLogin }: TagActionArguments) => {
      if (shouldShowLogin(requireLogin)) {
        showLogin({ trigger: origin as AuthTriggersType });
        return { successful: false };
      }
      logEvent({
        event_name: `follow${category ? ' all' : ''}`,
        target_type: 'tag',
        target_id: category || tags[0],
        extra: JSON.stringify({ origin, feed_id: feedId }),
      });
      if (alerts?.filter && user && shouldUpdateAlerts) {
        updateAlerts({ filter: false, myFeed: 'created' });
      }
      await followTags({ tags });

      invalidateQueries();

      invalidateContentPreferences({
        entity: ContentPreferenceType.Keyword,
        subQuery: RequestKey.UserFollowing,
      });

      return { successful: true };
    },
    [
      feedId,
      logEvent,
      shouldShowLogin,
      origin,
      updateAlerts,
      user,
      showLogin,
      followTags,
      alerts?.filter,
      invalidateQueries,
      shouldUpdateAlerts,
      invalidateContentPreferences,
    ],
  );

  const onUnfollowTags = useCallback(
    async ({ tags, category, requireLogin }: TagActionArguments) => {
      if (shouldShowLogin(requireLogin)) {
        showLogin({ trigger: origin as AuthTriggersType });
        return { successful: false };
      }
      logEvent({
        event_name: `unfollow${category ? ' all' : ''}`,
        target_type: 'tag',
        target_id: category || tags[0],
        extra: JSON.stringify({ origin, feed_id: feedId }),
      });
      await unfollowTags({ tags });

      invalidateQueries();

      invalidateContentPreferences({
        entity: ContentPreferenceType.Keyword,
        subQuery: RequestKey.UserFollowing,
      });

      return { successful: true };
    },
    [
      feedId,
      logEvent,
      shouldShowLogin,
      origin,
      showLogin,
      unfollowTags,
      invalidateQueries,
      invalidateContentPreferences,
    ],
  );

  const onBlockTags = useCallback(
    async ({ tags, requireLogin }: TagActionArguments) => {
      if (shouldShowLogin(requireLogin)) {
        showLogin({ trigger: origin as AuthTriggersType });
        return { successful: false };
      }

      logEvent({
        event_name: LogEvent.BlockTag,
        target_type: 'tag',
        target_id: tags[0],
        extra: JSON.stringify({ origin, post_id: postId, feed_id: feedId }),
      });
      await blockTag({ tags });

      invalidateQueries();

      invalidateContentPreferences({
        entity: ContentPreferenceType.Keyword,
        subQuery: RequestKey.UserBlocked,
      });

      return { successful: true };
    },
    [
      feedId,
      logEvent,
      shouldShowLogin,
      origin,
      showLogin,
      blockTag,
      postId,
      invalidateQueries,
      invalidateContentPreferences,
    ],
  );

  const onUnblockTags = useCallback(
    async ({ tags, requireLogin }: TagActionArguments) => {
      if (shouldShowLogin(requireLogin)) {
        showLogin({ trigger: origin as AuthTriggersType });
        return { successful: false };
      }
      logEvent({
        event_name: LogEvent.UnblockTag,
        target_type: 'tag',
        target_id: tags[0],
        extra: JSON.stringify({ origin, post_id: postId, feed_id: feedId }),
      });
      await unblockTag({ tags });

      invalidateQueries();

      invalidateContentPreferences({
        entity: ContentPreferenceType.Keyword,
        subQuery: RequestKey.UserBlocked,
      });

      return { successful: true };
    },
    [
      feedId,
      logEvent,
      shouldShowLogin,
      origin,
      showLogin,
      unblockTag,
      postId,
      invalidateQueries,
      invalidateContentPreferences,
    ],
  );

  const onUnblockSource = useCallback(
    async ({ source, requireLogin }: SourceActionArguments) => {
      if (shouldShowLogin(requireLogin)) {
        showLogin({ trigger: origin as AuthTriggersType });
        return { successful: false };
      }
      logEvent({
        event_name: LogEvent.Unblock,
        target_type: 'source',
        target_id: source?.id,
        extra: JSON.stringify({ origin, post_id: postId, feed_id: feedId }),
      });

      await unblockSource({ source });

      invalidateQueries();

      invalidateContentPreferences({
        entity: ContentPreferenceType.Source,
        subQuery: RequestKey.UserBlocked,
      });

      return { successful: true };
    },
    [
      feedId,
      logEvent,
      shouldShowLogin,
      origin,
      showLogin,
      unblockSource,
      postId,
      invalidateQueries,
      invalidateContentPreferences,
    ],
  );

  const onBlockSource = useCallback(
    async ({ source, requireLogin }: SourceActionArguments) => {
      if (shouldShowLogin(requireLogin)) {
        showLogin({ trigger: origin as AuthTriggersType });
        return { successful: false };
      }

      logEvent({
        event_name: LogEvent.Block,
        target_type: 'source',
        target_id: source?.id,
        extra: JSON.stringify({ origin, post_id: postId, feed_id: feedId }),
      });
      await blockSource({ source });

      invalidateQueries();

      invalidateContentPreferences({
        entity: ContentPreferenceType.Source,
        subQuery: RequestKey.UserBlocked,
      });

      return { successful: true };
    },
    [
      feedId,
      logEvent,
      shouldShowLogin,
      origin,
      showLogin,
      blockSource,
      postId,
      invalidateQueries,
      invalidateContentPreferences,
    ],
  );

  const onFollowSource = useCallback(
    async ({ source, requireLogin }: SourceActionArguments) => {
      if (shouldShowLogin(requireLogin)) {
        showLogin({ trigger: origin as AuthTriggersType });
        return { successful: false };
      }

      logEvent({
        event_name: LogEvent.Follow,
        target_type: 'source',
        target_id: source?.id,
        extra: JSON.stringify({ origin, post_id: postId, feed_id: feedId }),
      });

      await followSource({ source });

      invalidateQueries();

      invalidateContentPreferences({
        entity: ContentPreferenceType.Source,
        subQuery: RequestKey.UserFollowing,
      });

      return { successful: true };
    },
    [
      feedId,
      logEvent,
      shouldShowLogin,
      origin,
      showLogin,
      followSource,
      postId,
      invalidateQueries,
      invalidateContentPreferences,
    ],
  );

  const onUnfollowSource = useCallback(
    async ({ source, requireLogin }: SourceActionArguments) => {
      if (shouldShowLogin(requireLogin)) {
        showLogin({ trigger: origin as AuthTriggersType });
        return { successful: false };
      }

      logEvent({
        event_name: LogEvent.Unfollow,
        target_type: 'source',
        target_id: source?.id,
        extra: JSON.stringify({ origin, post_id: postId, feed_id: feedId }),
      });

      await unfollowSource({ source });

      invalidateQueries();

      invalidateContentPreferences({
        entity: ContentPreferenceType.Source,
        subQuery: RequestKey.UserFollowing,
      });

      return { successful: true };
    },
    [
      feedId,
      shouldShowLogin,
      logEvent,
      origin,
      postId,
      unfollowSource,
      invalidateQueries,
      showLogin,
      invalidateContentPreferences,
    ],
  );

  return {
    onFollowTags,
    onUnfollowTags,
    onBlockTags,
    onUnblockTags,
    onBlockSource,
    onUnblockSource,
    onFollowSource,
    onUnfollowSource,
  };
}
