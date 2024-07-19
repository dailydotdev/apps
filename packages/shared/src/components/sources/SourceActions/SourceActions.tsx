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

export interface SourceActionsProps {
  source: Source;
  // block action
  blockProps?: SourceActionsButton;
  hideBlock?: boolean;
  // follow action
  followProps?: SourceActionsButton;
  hideFollow?: boolean;
  // notify action
  notifyProps?: SourceActionsButton;
  hideNotify?: boolean;
}

export const SourceActions = ({
  blockProps,
  followProps,
  hideBlock = false,
  hideFollow = false,
  hideNotify = false,
  source,
  notifyProps,
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

  return (
    <>
      <div className="inline-flex flex-row gap-2">
        {!hideFollow && !isBlocked && (
          <SourceActionsFollow
            isFetching={false}
            isSubscribed={isFollowing}
            onClick={toggleFollow}
            variant={
              isFollowing ? ButtonVariant.Tertiary : ButtonVariant.Primary
            }
            {...followProps}
          />
        )}
        {!hideNotify && isFollowing && (
          <SourceActionsNotify
            haveNotifications={haveNotifications}
            onClick={toggleNotify}
            {...notifyProps}
          />
        )}
        {!hideBlock && !isFollowing && (
          <SourceActionsBlock
            isBlocked={isBlocked}
            onClick={toggleBlock}
            {...blockProps}
          />
        )}
      </div>
    </>
  );
};

export default SourceActions;
