import { useContext, useMemo } from 'react';
import AuthContext from '../contexts/AuthContext';
import AnalyticsContext from '../contexts/AnalyticsContext';
import useMutateFilters from './useMutateFilters';
import { Source } from '../graphql/sources';
import AlertContext from '../contexts/AlertContext';
import { BooleanPromise } from '../components/filters/common';
import { useMyFeed } from './useMyFeed';

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
  origin?: string;
  postId?: string;
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
}: UseTagAndSourceProps): UseTagAndSource {
  const { shouldShowMyFeed } = useMyFeed();
  const { alerts, updateAlerts } = useContext(AlertContext);
  const { user, showLogin } = useContext(AuthContext);
  const { trackEvent } = useContext(AnalyticsContext);
  const shouldShowLogin = (requireLogin?: boolean) => {
    if (user) {
      return false;
    }

    if (!shouldShowMyFeed) {
      return true;
    }

    return requireLogin;
  };

  const {
    followTags,
    unfollowTags,
    blockTag,
    unblockTag,
    followSource,
    unfollowSource,
  } = useMutateFilters(user);

  const onFollowTags = async ({
    tags,
    category,
    requireLogin,
  }: TagActionArguments) => {
    if (shouldShowLogin(requireLogin)) {
      showLogin(origin);
      return { successful: false };
    }
    trackEvent({
      event_name: `follow${category ? ' all' : ''}`,
      target_type: 'tag',
      target_id: category || tags[0],
      extra: JSON.stringify({ origin }),
    });
    if (alerts?.filter && user) {
      updateAlerts({ filter: false, myFeed: 'created' });
    }
    await followTags({ tags });
    return { successful: true };
  };

  const onUnfollowTags = async ({
    tags,
    category,
    requireLogin,
  }: TagActionArguments) => {
    if (shouldShowLogin(requireLogin)) {
      showLogin(origin);
      return { successful: false };
    }
    trackEvent({
      event_name: `unfollow${category ? ' all' : ''}`,
      target_type: 'tag',
      target_id: category || tags[0],
      extra: JSON.stringify({ origin }),
    });
    await unfollowTags({ tags });
    return { successful: true };
  };

  const onBlockTags = async ({ tags, requireLogin }: TagActionArguments) => {
    if (shouldShowLogin(requireLogin)) {
      showLogin(origin);
      return { successful: false };
    }

    trackEvent({
      event_name: 'block',
      target_type: 'tag',
      target_id: tags[0],
      extra: JSON.stringify({ origin, post_id: postId }),
    });
    await blockTag({ tags });
    return { successful: true };
  };

  const onUnblockTags = async ({ tags, requireLogin }: TagActionArguments) => {
    if (shouldShowLogin(requireLogin)) {
      showLogin(origin);
      return { successful: false };
    }
    trackEvent({
      event_name: 'unblock',
      target_type: 'tag',
      target_id: tags[0],
      extra: JSON.stringify({ origin, post_id: postId }),
    });
    await unblockTag({ tags });
    return { successful: true };
  };

  const onFollowSource = async ({
    source,
    requireLogin,
  }: SourceActionArguments) => {
    if (shouldShowLogin(requireLogin)) {
      showLogin(origin);
      return { successful: false };
    }
    trackEvent({
      event_name: 'follow',
      target_type: 'source',
      target_id: source?.id,
      extra: JSON.stringify({ origin, post_id: postId }),
    });
    await followSource({ source });
    return { successful: true };
  };

  const onUnfollowSource = async ({
    source,
    requireLogin,
  }: SourceActionArguments) => {
    if (shouldShowLogin(requireLogin)) {
      showLogin(origin);
      return { successful: false };
    }
    trackEvent({
      event_name: 'unfollow',
      target_type: 'source',
      target_id: source?.id,
      extra: JSON.stringify({ origin, post_id: postId }),
    });
    await unfollowSource({ source });
    return { successful: true };
  };

  return useMemo(
    () => ({
      onFollowTags,
      onUnfollowTags,
      onBlockTags,
      onUnblockTags,
      onFollowSource,
      onUnfollowSource,
    }),
    [
      onFollowTags,
      onUnfollowTags,
      onBlockTags,
      onUnblockTags,
      onFollowSource,
      onUnfollowSource,
    ],
  );
}
