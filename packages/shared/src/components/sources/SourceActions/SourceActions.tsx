import React, { ReactElement } from 'react';
import { ButtonVariant } from '../../buttons/common';
import { Source } from '../../../graphql/sources';
import { useSourceActions } from '../../../hooks';
import SourceActionsNotify from './SourceActionsNotify';
import SourceActionsBlock from './SourceActionsBlock';
import SourceActionsFollow from './SourceActionsFollow';

interface SourceActionsButton {
  className?: string;
  variant?: ButtonVariant;
}

interface SourceActionsProps {
  source: Source;

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
  const {
    isBlocked,
    toggleBlock,
    isFollowing,
    toggleFollow,
    haveNotifications,
    toggleNotify,
  } = useSourceActions({
    source,
  });

  // todo: add alert for notify confirmation
  return (
    <>
      <div className="inline-flex flex-row gap-2">
        {!hideSubscribe && !isBlocked && (
          <SourceActionsFollow
            isFetching={false}
            isSubscribed={isFollowing}
            onClick={toggleFollow}
            variant={
              isFollowing ? ButtonVariant.Tertiary : ButtonVariant.Primary
            }
            {...subscribe}
          />
        )}
        {!hideFollow && isFollowing && (
          <SourceActionsNotify
            haveNotifications={haveNotifications}
            onClick={toggleNotify}
          />
        )}
        {!hideBlock && !isFollowing && (
          <SourceActionsBlock isBlocked={isBlocked} onClick={toggleBlock} />
        )}
      </div>
    </>
  );
};

export default SourceActions;
