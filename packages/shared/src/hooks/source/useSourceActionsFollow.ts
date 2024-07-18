import { useCallback } from 'react';
import { Source } from '../../graphql/sources';
import { useToggle } from '../useToggle';
import { LogEvent, Origin } from '../../lib/log';
import { useToastNotification } from '../useToastNotification';
import { useLogContext } from '../../contexts/LogContext';
import useTagAndSource from '../useTagAndSource';

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
  const { logEvent } = useLogContext();

  const [isFollowing, toggleIsFollowing] = useToggle(false);
  const { onFollowSource, onUnfollowSource } = useTagAndSource({
    origin: Origin.SourcePage,
  });

  const toggleFollow = useCallback(() => {
    const wasFollowing = isFollowing;

    // todo: handle errors (and show it with a toast?)
    if (wasFollowing) {
      onUnfollowSource({ source, requireLogin: true });
    } else {
      onFollowSource({ source, requireLogin: true });
    }

    // log for analytics
    logEvent({
      event_name: wasFollowing
        ? LogEvent.UnfollowSource
        : LogEvent.FollowSource,
      target_id: source.id,
    });

    // toast notification
    // todo: update source.id with source.name
    displayToast(
      wasFollowing
        ? `⛔️ You are now unsubscribed to ${source.id}`
        : `✅ You are now subscribed to ${source.id}`,
    );
  }, [isFollowing, toggleIsFollowing]);

  return {
    isFollowing,
    toggleFollow,
  };
}
