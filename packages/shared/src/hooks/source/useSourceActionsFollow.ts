import { useCallback } from 'react';
import { Source } from '../../graphql/sources';
import { useToggle } from '../useToggle';
import { LogEvent } from '../../lib/log';
import { useToastNotification } from '../useToastNotification';
import { useLogContext } from '../../contexts/LogContext';

export type UseSourceActionsFollowProps = {
  source: Pick<Source, 'id'>;
};

export interface UseSourceActionsFollow {
  isFollowing: boolean;
  onFollowing: () => void;
}

export function useSourceActionsFollow(props: UseSourceActionsFollowProps) {
  const { source } = props;
  const { displayToast } = useToastNotification();
  const { logEvent } = useLogContext();

  const [isFollowing, toggleFollow] = useToggle(false);
  const onFollowing = useCallback(() => {
    const wasFollowing = isFollowing;

    // todo: handle errors (and show it with a toast?)
    toggleFollow();

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
  }, [isFollowing, toggleFollow]);

  return {
    isFollowing,
    toggleFollow,
  };
}
