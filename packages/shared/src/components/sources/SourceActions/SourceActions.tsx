import React, { ReactElement } from 'react';
import SourceActionsSubscribe from './SourceActionsSubscribe';
import { ButtonVariant } from '../../buttons/common';
import { Source } from '../../../graphql/sources';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useSourceSubscription } from '../../../hooks';
import SourceActionsFollow from './SourceActionsFollow';

interface SourceActionsButton {
  className?: string;
  variant?: ButtonVariant;
}

interface SourceActionsProps {
  source: Pick<Source, 'id'>;

  block?: SourceActionsButton;
  hideBlock?: boolean;

  follow?: {};
  hideFollow?: boolean;

  subscribe?: SourceActionsButton;
  hideSubscribe?: boolean;
}

export const SourceActions = (props: SourceActionsProps): ReactElement => {
  const {
    source,
    subscribe,
    hideSubscribe = false,
    block,
    hideBlock = false,
    follow,
    hideFollow = false,
  } = props;

  const { isLoggedIn } = useAuthContext();
  const { isFollowing, isSubscribed, isReady, onFollowing, onSubscribe } =
    useSourceSubscription({ source });

  return (
    <div className="inline-flex flex-row gap-2">
      {!hideSubscribe && (
        <SourceActionsSubscribe
          isFetching={isLoggedIn && !isReady}
          isSubscribed={isSubscribed}
          onClick={onSubscribe}
          variant={
            isSubscribed ? ButtonVariant.Tertiary : ButtonVariant.Primary
          }
          {...subscribe}
        />
      )}
      {!hideFollow && isSubscribed && (
        <SourceActionsFollow isFollowing={isFollowing} onClick={onFollowing} />
      )}
      {!hideBlock && !isSubscribed && <>Block</>}
    </div>
  );
};

export default SourceActions;
