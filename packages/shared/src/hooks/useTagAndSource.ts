import { useContext } from 'react';
import AuthContext from '../contexts/AuthContext';
import AnalyticsContext from '../contexts/AnalyticsContext';
import useMutateFilters from './useMutateFilters';
import { Source } from '../graphql/sources';
import AlertContext from '../contexts/AlertContext';

export interface TagActionArguments {
  tags: Array<string>;
  category?: string;
}

export interface SourceActionArguments {
  source: Source;
}

interface UseTagAndSourceProps {
  origin?: string;
  postId?: string;
}

interface UseTagAndSource {
  onFollowTags: ({ tags, category }: TagActionArguments) => void;
  onUnfollowTags: ({ tags, category }: TagActionArguments) => void;
  onBlockTags: ({ tags }: TagActionArguments) => Promise<unknown>;
  onUnblockTags: ({ tags }: TagActionArguments) => Promise<unknown>;
  onFollowSource: ({ source }: SourceActionArguments) => Promise<unknown>;
  onUnfollowSource: ({ source }: SourceActionArguments) => Promise<unknown>;
}

export default function useTagAndSource({
  origin,
  postId,
}: UseTagAndSourceProps): UseTagAndSource {
  const { alerts, updateAlerts } = useContext(AlertContext);
  const { user } = useContext(AuthContext);
  const { trackEvent } = useContext(AnalyticsContext);
  const {
    followTags,
    unfollowTags,
    blockTag,
    unblockTag,
    followSource,
    unfollowSource,
  } = useMutateFilters(user);

  const onFollowTags = async ({ tags, category }: TagActionArguments) => {
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
  };

  const onUnfollowTags = async ({ tags, category }: TagActionArguments) => {
    trackEvent({
      event_name: `unfollow${category ? ' all' : ''}`,
      target_type: 'tag',
      target_id: category || tags[0],
      extra: JSON.stringify({ origin }),
    });
    await unfollowTags({ tags });
  };

  const onBlockTags = async ({ tags }: TagActionArguments) => {
    trackEvent({
      event_name: 'block',
      target_type: 'tag',
      target_id: tags[0],
      extra: JSON.stringify({ origin, post_id: postId }),
    });
    await blockTag({ tags });
  };

  const onUnblockTags = async ({ tags }: TagActionArguments) => {
    trackEvent({
      event_name: 'unblock',
      target_type: 'tag',
      target_id: tags[0],
      extra: JSON.stringify({ origin, post_id: postId }),
    });
    await unblockTag({ tags });
  };

  const onFollowSource = async ({ source }: SourceActionArguments) => {
    trackEvent({
      event_name: 'follow',
      target_type: 'source',
      target_id: source?.id,
      extra: JSON.stringify({ origin, post_id: postId }),
    });
    await followSource({ source });
  };

  const onUnfollowSource = async ({ source }: SourceActionArguments) => {
    trackEvent({
      event_name: 'unfollow',
      target_type: 'source',
      target_id: source?.id,
      extra: JSON.stringify({ origin, post_id: postId }),
    });
    await unfollowSource({ source });
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
