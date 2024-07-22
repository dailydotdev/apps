import { useCallback, useMemo } from 'react';
import { Source } from '../../graphql/sources';
import { Origin } from '../../lib/log';
import { useToastNotification } from '../useToastNotification';
import useTagAndSource from '../useTagAndSource';
import useFeedSettings from '../useFeedSettings';
import { useSourceActionsNotify } from './useSourceActionsNotify';

export type UseSourceActionsFollowProps = {
  source: Source;
};

export interface UseSourceActionsFollow {
  isFollowing: boolean;
  toggleFollow: () => void;
}

export function useSourceActionsFollow(
  props: UseSourceActionsFollowProps,
): UseSourceActionsFollow {
  const { source } = props;
  const { displayToast } = useToastNotification();

  const { feedSettings } = useFeedSettings();
  const isFollowing = useMemo(() => {
    return !!feedSettings?.includeSources?.find(({ id }) => source?.id === id);
  }, [feedSettings, source]);

  const { haveNotifications, isReady, onNotify } = useSourceActionsNotify({
    source,
  });
  const { onFollowSource, onUnfollowSource } = useTagAndSource({
    origin: Origin.SourcePage,
  });

  const toggleFollow = useCallback(async () => {
    // Unfollow path
    if (isFollowing) {
      // have to remove notifications first
      if (haveNotifications && isReady) {
        await onNotify();
      }

      const { successful } = await onUnfollowSource({
        source,
        requireLogin: true,
      });
      if (successful) {
        displayToast(`⛔️ You are now unsubscribed to ${source.name}`);
      }
      return;
    }

    // follow path
    const { successful } = await onFollowSource({ source, requireLogin: true });
    if (successful) {
      displayToast(`✅ You are now subscribed to ${source.name}`);
    }
  }, [
    displayToast,
    haveNotifications,
    isFollowing,
    isReady,
    onFollowSource,
    onNotify,
    onUnfollowSource,
    source,
  ]);

  return {
    isFollowing,
    toggleFollow,
  };
}
