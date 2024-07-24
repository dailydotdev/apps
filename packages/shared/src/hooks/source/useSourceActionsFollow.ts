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

export function useSourceActionsFollow({
  source,
}: UseSourceActionsFollowProps): UseSourceActionsFollow {
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

  const addFollow = useCallback(async () => {
    const { successful } = await onFollowSource({ source, requireLogin: true });
    if (successful) {
      displayToast(`✅ You are now subscribed to ${source.name}`);
    }
  }, [displayToast, onFollowSource]);

  const removeFollow = useCallback(async () => {
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
  }, [displayToast, haveNotifications, isReady, onNotify, onUnfollowSource, ,]);

  const toggleFollow = useCallback(async () => {
    if (isFollowing) {
      await removeFollow();
      return;
    }

    await addFollow();
  }, [isFollowing, removeFollow, addFollow]);

  return {
    isFollowing,
    toggleFollow,
  };
}
