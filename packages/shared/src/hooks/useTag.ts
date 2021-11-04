import { useContext } from 'react';
import AuthContext from '../contexts/AuthContext';
import AnalyticsContext from '../contexts/AnalyticsContext';
import useMutateFilters from './useMutateFilters';

interface ActionArguments {
  tags: Array<string>;
  category?: string;
}

export default function useTag(): {
  onFollow: (tags, category?) => void;
  onUnfollow: (tags, category?) => void;
  onBlock: (tags) => Promise<unknown>;
} {
  const { user, showLogin } = useContext(AuthContext);
  const { trackEvent } = useContext(AnalyticsContext);
  const { followTags, unfollowTags, blockTag } = useMutateFilters(user);

  const onFollow = async ({ tags, category }: ActionArguments) => {
    if (!user) {
      showLogin('filter');
      return;
    }

    trackEvent({
      event_name: `follow${category ? ' all' : ''}`,
      target_type: 'tag',
      target_id: category || tags[0],
    });
    await followTags({ tags });
  };

  const onUnfollow = async ({ tags, category }: ActionArguments) => {
    trackEvent({
      event_name: `unfollow${category ? ' all' : ''}`,
      target_type: 'tag',
      target_id: category || tags[0],
    });
    await unfollowTags({ tags });
  };

  const onBlock = async ({ tags }: ActionArguments) => {
    await blockTag({ tags });
  };

  return {
    onFollow,
    onUnfollow,
    onBlock,
  };
}
