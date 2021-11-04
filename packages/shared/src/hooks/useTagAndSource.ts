import { useContext } from 'react';
import AuthContext from '../contexts/AuthContext';
import AnalyticsContext from '../contexts/AnalyticsContext';
import useMutateFilters from './useMutateFilters';
import { Source } from '../graphql/sources';

interface TagActionArguments {
  tags: Array<string>;
  category?: string;
}

interface SourceActionArguments {
  source: Source;
}

export default function useTagAndSource({ origin }: { origin?: string }): {
  onFollowTags: (tags, category?) => void;
  onUnfollowTags: (tags, category?) => void;
  onBlockTags: (tags) => Promise<unknown>;
  onUnblockTags: (tags) => Promise<unknown>;
  onFollowSource: (source) => Promise<unknown>;
  onUnfollowSource: (source) => Promise<unknown>;
} {
  const { user, showLogin } = useContext(AuthContext);
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
    if (!user) {
      showLogin('filter');
      return;
    }

    trackEvent({
      event_name: `follow${category ? ' all' : ''}`,
      target_type: 'tag',
      target_id: category || tags[0],
      extra: JSON.stringify({ origin }),
    });
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
      extra: JSON.stringify({ origin }),
    });
    await blockTag({ tags });
  };

  const onUnblockTags = async ({ tags }: TagActionArguments) => {
    trackEvent({
      event_name: 'unblock',
      target_type: 'tag',
      target_id: tags[0],
      extra: JSON.stringify({ origin }),
    });
    await unblockTag({ tags });
  };

  const onFollowSource = async ({ source }: SourceActionArguments) => {
    trackEvent({
      event_name: 'unfollow',
      target_type: 'source',
      target_id: source?.id,
      extra: JSON.stringify({ origin }),
    });
    await followSource({ source });
  };

  const onUnfollowSource = async ({ source }: SourceActionArguments) => {
    trackEvent({
      event_name: 'follow',
      target_type: 'source',
      target_id: source?.id,
      extra: JSON.stringify({ origin }),
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
