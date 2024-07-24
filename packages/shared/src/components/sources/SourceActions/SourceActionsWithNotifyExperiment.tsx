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
  blockProps?: SourceActionsButton;
  hideBlock?: boolean;
  followProps?: SourceActionsButton;
  hideFollow?: boolean;
  notifyProps?: SourceActionsButton;
  hideNotify?: boolean;
}

export const SourceActionsWithNotifyExperiment = ({
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
    haveNotificationsOn,
    toggleNotify,
  } = useSourceActions({
    source,
  });

  return (
    <div className="inline-flex flex-row gap-2">
      {!hideFollow && !isBlocked && (
        <SourceActionsFollow
          isFetching={false}
          isSubscribed={isFollowing}
          onClick={toggleFollow}
          variant={ButtonVariant.Primary}
          {...followProps}
        />
      )}
      {!hideNotify && isFollowing && (
        <SourceActionsNotify
          haveNotificationsOn={haveNotificationsOn}
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
  );
};

export default SourceActionsWithNotifyExperiment;
