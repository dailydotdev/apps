import { useCallback, useMemo } from 'react';
import useTagAndSource from '../useTagAndSource';
import { Origin } from '../../lib/log';
import useFeedSettings from '../useFeedSettings';
import { Source } from '../../graphql/sources';
import { useSourceSubscription } from './useSourceSubscription';
import { useAuthContext } from '../../contexts/AuthContext';
import { AuthTriggers } from '../../lib/auth';
import { useToastNotification } from '../useToastNotification';

interface UseSourceActionsProps {
  source: Source | Pick<Source, 'id'>;
}

function useSourceBlockActions(props: UseSourceActionsProps) {
  const { source } = props;
  const { feedSettings } = useFeedSettings();
  const { displayToast } = useToastNotification();

  const isBlocked = useMemo(() => {
    if (!feedSettings) {
      return true;
    }
    return (
      feedSettings.excludeSources &&
      feedSettings.excludeSources?.findIndex(
        (excludedSource) => source?.id === excludedSource.id,
      ) >= 0
    );
  }, [feedSettings, source]);

  const { onUnblockSource, onBlockSource } = useTagAndSource({
    origin: Origin.SourcePage,
  });

  const toggleBlock = useCallback(async () => {
    if (!('name' in source)) {
      return;
    }

    if (isBlocked) {
      await onUnblockSource({ source, requireLogin: true });
      displayToast('✅ Source unblocked');
      return;
    }

    await onBlockSource({ source, requireLogin: true });
    displayToast('⛔️ Source is now blocked');
  }, [isBlocked, onBlockSource, onUnblockSource]);

  return {
    isBlocked,
    toggleBlock,
  };
}

export const useSourceActions = (props: UseSourceActionsProps) => {
  const { source } = props;
  const { isBlocked, toggleBlock } = useSourceBlockActions({ source });

  const { isFollowing, haveNotifications, isReady, onFollowing, onNotify } =
    useSourceSubscription({ source });

  const { isLoggedIn, user, showLogin } = useAuthContext();

  const withAuthGuard = useCallback(
    (callback: () => void, ...args: any[]) => {
      if (!isLoggedIn) {
        showLogin({ trigger: AuthTriggers.SourceSubscribe });
        return;
      }

      return callback.bind(null, ...args);
    },
    [isLoggedIn, showLogin],
  );

  return {
    isBlocked,
    toggleBlock: withAuthGuard(toggleBlock),
    isFollowing,
    toggleFollow: withAuthGuard(onFollowing),
    haveNotifications,
    toggleNotify: withAuthGuard(onNotify),
  };
};

export default useSourceActions;
