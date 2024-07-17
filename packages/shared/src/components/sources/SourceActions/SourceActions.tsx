import React, { ReactElement, useCallback } from 'react';
import { ButtonVariant } from '../../buttons/common';
import { Source } from '../../../graphql/sources';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useSourceSubscription } from '../../../hooks';
import SourceActionsFollow from './SourceActionsFollow';
import { AuthTriggers } from '../../../lib/auth';
import { useToggle } from '../../../hooks/useToggle';
import SourceActionsBlock from './SourceActionsBlock';
import SourceActionsSubscribe from './SourceActionsSubscribe';

interface SourceActionsButton {
  className?: string;
  variant?: ButtonVariant;
}

interface SourceActionsProps {
  source: Source | Pick<Source, 'id'>;

  block?: SourceActionsButton;
  hideBlock?: boolean;

  follow?: {};
  hideFollow?: boolean;

  subscribe?: SourceActionsButton;
  hideSubscribe?: boolean;
}

export const SourceActions = ({
  source,
  subscribe,
  hideSubscribe = false,
  block,
  hideBlock = false,
  follow,
  hideFollow = false,
}: SourceActionsProps): ReactElement => {
  const { isLoggedIn, user, showLogin } = useAuthContext();
  const { isFollowing, haveNotifications, isReady, onFollowing, onNotify } =
    useSourceSubscription({ source });

  const [isBlocking, toggleBlock] = useToggle(false);
  const onBlock = useCallback(() => {
    //   if (unfollowingSource) {
    //     await onFollowSource({ source });
    //   } else {
    //     await onUnfollowSource({ source });
    //   }

    toggleBlock();
  }, [toggleBlock]);

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

  return (
    <div className="inline-flex flex-row gap-2">
      {!hideSubscribe && (
        <SourceActionsSubscribe
          isFetching={false}
          isSubscribed={isFollowing}
          onClick={withAuthGuard(onFollowing)}
          variant={isFollowing ? ButtonVariant.Tertiary : ButtonVariant.Primary}
          {...subscribe}
        />
      )}
      {!hideFollow && isFollowing && (
        <SourceActionsFollow
          haveNotifications={haveNotifications}
          onClick={withAuthGuard(onNotify)}
        />
      )}
      {!hideBlock && !isFollowing && (
        <SourceActionsBlock
          isBlocking={isBlocking}
          onClick={withAuthGuard(toggleBlock)}
        />
      )}
    </div>
  );
};

export default SourceActions;
