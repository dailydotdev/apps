import { useCallback, useMemo } from 'react';
import useFeedSettings from '../../hooks/useFeedSettings';
import useTagAndSource from '../../hooks/useTagAndSource';
import { useAuthContext } from '../../contexts/AuthContext';
import { AuthTriggers } from '../../lib/auth';
import type { Origin } from '../../lib/log';

interface TagFollowToggle {
  followedTags: Set<string>;
  onToggleFollow: (tag: string) => void;
}

export const useTagFollowToggle = (origin: Origin): TagFollowToggle => {
  const { feedSettings } = useFeedSettings();
  const { user, showLogin } = useAuthContext();
  const { onFollowTags, onUnfollowTags } = useTagAndSource({ origin });

  const followedTags = useMemo(
    () => new Set(feedSettings?.includeTags ?? []),
    [feedSettings?.includeTags],
  );

  const onToggleFollow = useCallback(
    (tag: string): void => {
      if (!user) {
        showLogin({ trigger: AuthTriggers.Filter });
        return;
      }
      if (followedTags.has(tag)) {
        onUnfollowTags({ tags: [tag] });
      } else {
        onFollowTags({ tags: [tag] });
      }
    },
    [user, showLogin, followedTags, onFollowTags, onUnfollowTags],
  );

  return { followedTags, onToggleFollow };
};
