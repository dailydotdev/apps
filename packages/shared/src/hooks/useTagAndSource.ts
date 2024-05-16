import { useCallback, useContext } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import AuthContext from '../contexts/AuthContext';
import AnalyticsContext from '../contexts/AnalyticsContext';
import useMutateFilters from './useMutateFilters';
import { Source } from '../graphql/sources';
import AlertContext from '../contexts/AlertContext';
import { BooleanPromise } from '../components/filters/common';
import { generateQueryKey } from '../lib/query';
import useDebounce from './useDebounce';
import { SharedFeedPage } from '../components/utilities';
import { Origin } from '../lib/analytics';
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
  onFollowSource: (params: SourceActionArguments) => BooleanPromise;
  onUnfollowSource: (params: SourceActionArguments) => BooleanPromise;
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
  const { trackEvent } = useContext(AnalyticsContext);
  const shouldShowLogin = useCallback(
    (requireLogin?: boolean) => (user ? false : requireLogin),
    [user],
  );

  const {
    followTags,
    unfollowTags,
    blockTag,
    unblockTag,
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
      trackEvent({
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
      trackEvent,
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
      trackEvent({
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
      trackEvent,
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

      trackEvent({
        event_name: 'block',
        target_type: 'tag',
        target_id: tags[0],
        extra: JSON.stringify({ origin, post_id: postId }),
      });
      await blockTag({ tags });

      invalidateQueries();

      return { successful: true };
    },
    [
      trackEvent,
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
      trackEvent({
        event_name: 'unblock',
        target_type: 'tag',
        target_id: tags[0],
        extra: JSON.stringify({ origin, post_id: postId }),
      });
      await unblockTag({ tags });

      invalidateQueries();

      return { successful: true };
    },
    [
      trackEvent,
      shouldShowLogin,
      origin,
      showLogin,
      unblockTag,
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
      trackEvent({
        event_name: 'follow',
        target_type: 'source',
        target_id: source?.id,
        extra: JSON.stringify({ origin, post_id: postId }),
      });
      await followSource({ source });

      invalidateQueries();

      return { successful: true };
    },
    [
      trackEvent,
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
      trackEvent({
        event_name: 'unfollow',
        target_type: 'source',
        target_id: source?.id,
        extra: JSON.stringify({ origin, post_id: postId }),
      });
      await unfollowSource({ source });

      invalidateQueries();

      return { successful: true };
    },
    [
      trackEvent,
      shouldShowLogin,
      origin,
      showLogin,
      unfollowSource,
      postId,
      invalidateQueries,
    ],
  );

  return {
    onFollowTags,
    onUnfollowTags,
    onBlockTags,
    onUnblockTags,
    onFollowSource,
    onUnfollowSource,
  };
}
