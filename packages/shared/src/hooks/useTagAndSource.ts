import { useCallback, useContext } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import AuthContext from '../contexts/AuthContext';
import LogContext from '../contexts/LogContext';
import useMutateFilters from './useMutateFilters';
import { Source } from '../graphql/sources';
import AlertContext from '../contexts/AlertContext';
import { BooleanPromise } from '../components/filters/common';
import { generateQueryKey } from '../lib/query';
import useDebounce from './useDebounce';
import { SharedFeedPage } from '../components/utilities';
import { LogEvent, Origin } from '../lib/log';
import { AuthTriggersType } from '../lib/auth';

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

  const [invalidateQueries] = useDebounce(() => {
    if (!shouldInvalidateQueries) {
      return;
    }

    queryClient.invalidateQueries(
      generateQueryKey(SharedFeedPage.MyFeed, user),
    );
  }, 100);

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
        extra: JSON.stringify({ origin }),
      });
      if (alerts?.filter && user && shouldUpdateAlerts) {
        updateAlerts({ filter: false, myFeed: 'created' });
      }
      await followTags({ tags });

      invalidateQueries();

      return { successful: true };
    },
    [
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
        extra: JSON.stringify({ origin }),
      });
      await unfollowTags({ tags });

      invalidateQueries();

      return { successful: true };
    },
    [
      logEvent,
      shouldShowLogin,
      origin,
      showLogin,
      unfollowTags,
      invalidateQueries,
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
        extra: JSON.stringify({ origin, post_id: postId }),
      });
      await blockTag({ tags });

      invalidateQueries();

      return { successful: true };
    },
    [
      logEvent,
      shouldShowLogin,
      origin,
      showLogin,
      blockTag,
      postId,
      invalidateQueries,
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
        extra: JSON.stringify({ origin, post_id: postId }),
      });
      await unblockTag({ tags });

      invalidateQueries();

      return { successful: true };
    },
    [
      logEvent,
      shouldShowLogin,
      origin,
      showLogin,
      unblockTag,
      postId,
      invalidateQueries,
    ],
  );

  const onUnblockSource = useCallback(
    async ({ source, requireLogin }: SourceActionArguments) => {
      if (shouldShowLogin(requireLogin)) {
        showLogin({ trigger: origin as AuthTriggersType });
        return { successful: false };
      }
      logEvent({
        event_name: LogEvent.UnblockSource,
        target_type: 'source',
        target_id: source?.id,
        extra: JSON.stringify({ origin, post_id: postId }),
      });

      await unblockSource({ source });

      invalidateQueries();

      return { successful: true };
    },
    [
      logEvent,
      shouldShowLogin,
      origin,
      showLogin,
      unblockSource,
      postId,
      invalidateQueries,
    ],
  );

  const onBlockSource = useCallback(
    async ({ source, requireLogin }: SourceActionArguments) => {
      if (shouldShowLogin(requireLogin)) {
        showLogin({ trigger: origin as AuthTriggersType });
        return { successful: false };
      }

      logEvent({
        event_name: LogEvent.BlockSource,
        target_type: 'source',
        target_id: source?.id,
        extra: JSON.stringify({ origin, post_id: postId }),
      });
      await blockSource({ source });

      invalidateQueries();

      return { successful: true };
    },
    [
      logEvent,
      shouldShowLogin,
      origin,
      showLogin,
      blockSource,
      postId,
      invalidateQueries,
    ],
  );

  const onFollowSource = useCallback(
    async ({ source, requireLogin }: SourceActionArguments) => {
      if (shouldShowLogin(requireLogin)) {
        showLogin({ trigger: origin as AuthTriggersType });
        return { successful: false };
      }

      logEvent({
        event_name: LogEvent.FollowSource,
        target_type: 'source',
        target_id: source?.id,
        extra: JSON.stringify({ origin, post_id: postId }),
      });

      await followSource({ source });

      invalidateQueries();

      return { successful: true };
    },
    [
      logEvent,
      shouldShowLogin,
      origin,
      showLogin,
      followSource,
      postId,
      invalidateQueries,
    ],
  );

  const onUnfollowSource = useCallback(
    async ({ source, requireLogin }: SourceActionArguments) => {
      if (shouldShowLogin(requireLogin)) {
        showLogin({ trigger: origin as AuthTriggersType });
        return { successful: false };
      }

      logEvent({
        event_name: LogEvent.UnfollowSource,
        target_type: 'source',
        target_id: source?.id,
        extra: JSON.stringify({ origin, post_id: postId }),
      });

      await unfollowSource({ source });

      invalidateQueries();

      return { successful: true };
    },
    [
      shouldShowLogin,
      logEvent,
      origin,
      postId,
      unfollowSource,
      invalidateQueries,
      showLogin,
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
