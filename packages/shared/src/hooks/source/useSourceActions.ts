import { useCallback } from 'react';
import { Source } from '../../graphql/sources';
import { useAuthContext } from '../../contexts/AuthContext';
import { AuthTriggers } from '../../lib/auth';
import { useSourceActionsBlock } from './useSourceActionsBlock';
import { useSourceActionsNotify } from './useSourceActionsNotify';
import { useSourceActionsFollow } from './useSourceActionsFollow';

interface UseSourceActionsProps {
  source: Source | Pick<Source, 'id'>;
}

export const useSourceActions = (props: UseSourceActionsProps) => {
  const { source } = props;

  const { isBlocked, toggleBlock } = useSourceActionsBlock({ source });
  const { isFollowing, toggleFollow } = useSourceActionsFollow({ source });
  const { haveNotifications, onNotify } = useSourceActionsNotify({
    source,
  });

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
    toggleFollow: withAuthGuard(toggleFollow),
    haveNotifications,
    toggleNotify: withAuthGuard(onNotify),
  };
};

export default useSourceActions;
