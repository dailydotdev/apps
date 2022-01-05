import { useContext } from 'react';
import { Features, isFeaturedEnabled } from '../lib/featureManagement';
import AuthContext from '../contexts/AuthContext';
import AnalyticsContext from '../contexts/AnalyticsContext';
import useMutateFilters from './useMutateFilters';
import { Source } from '../graphql/sources';
import AlertContext from '../contexts/AlertContext';
import FeaturesContext from '../contexts/FeaturesContext';

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
  onFollowTags: (params: TagActionArguments) => void;
  onUnfollowTags: (params: TagActionArguments) => void;
  onBlockTags: (params: TagActionArguments) => Promise<boolean>;
  onUnblockTags: (params: TagActionArguments) => Promise<unknown>;
  onFollowSource: (params: SourceActionArguments) => Promise<unknown>;
  onUnfollowSource: (params: SourceActionArguments) => Promise<unknown>;
}

export default function useTagAndSource({
  origin,
  postId,
}: UseTagAndSourceProps): UseTagAndSource {
  const { flags } = useContext(FeaturesContext);
  const shouldShowMyFeed = isFeaturedEnabled(Features.MyFeedOn, flags);
  const { alerts, updateAlerts } = useContext(AlertContext);
  const { user, showLogin } = useContext(AuthContext);
  const { trackEvent } = useContext(AnalyticsContext);
  const shouldShowLogin = (requireLogin?: boolean) =>
    (!shouldShowMyFeed && !user) || (requireLogin && !user);
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
      return false;
    }
    trackEvent({
      event_name: `follow${category ? ' all' : ''}`,
      target_type: 'tag',
      target_id: category || tags[0],
      extra: JSON.stringify({ origin }),
    });
    if (alerts?.filter && user) {
      updateAlerts({ filter: false });
    }
    await followTags({ tags });
    return true;
  };

  const onUnfollowTags = async ({
    tags,
    category,
    requireLogin,
  }: TagActionArguments) => {
    if (shouldShowLogin(requireLogin)) {
      showLogin(origin);
      return false;
    }
    trackEvent({
      event_name: `unfollow${category ? ' all' : ''}`,
      target_type: 'tag',
      target_id: category || tags[0],
      extra: JSON.stringify({ origin }),
    });
    await unfollowTags({ tags });
    return true;
  };

  const onBlockTags = async ({ tags, requireLogin }: TagActionArguments) => {
    if (shouldShowLogin(requireLogin)) {
      showLogin(origin);
      return false;
    }

    trackEvent({
      event_name: 'block',
      target_type: 'tag',
      target_id: tags[0],
      extra: JSON.stringify({ origin, post_id: postId }),
    });
    await blockTag({ tags });
    return true;
  };

  const onUnblockTags = async ({ tags, requireLogin }: TagActionArguments) => {
    if (shouldShowLogin(requireLogin)) {
      showLogin(origin);
      return false;
    }
    trackEvent({
      event_name: 'unblock',
      target_type: 'tag',
      target_id: tags[0],
      extra: JSON.stringify({ origin, post_id: postId }),
    });
    await unblockTag({ tags });
    return true;
  };

  const onFollowSource = async ({
    source,
    requireLogin,
  }: SourceActionArguments) => {
    if (shouldShowLogin(requireLogin)) {
      showLogin(origin);
      return false;
    }
    trackEvent({
      event_name: 'follow',
      target_type: 'source',
      target_id: source?.id,
      extra: JSON.stringify({ origin, post_id: postId }),
    });
    await followSource({ source });
    return true;
  };

  const onUnfollowSource = async ({
    source,
    requireLogin,
  }: SourceActionArguments) => {
    if (shouldShowLogin(requireLogin)) {
      showLogin(origin);
      return false;
    }
    trackEvent({
      event_name: 'unfollow',
      target_type: 'source',
      target_id: source?.id,
      extra: JSON.stringify({ origin, post_id: postId }),
    });
    await unfollowSource({ source });
    return true;
  };

  return {
    onFollowTags,
    onUnfollowTags,
    onBlockTags,
    onUnblockTags,
    onFollowSource,
    onUnfollowSource,
  };
}
