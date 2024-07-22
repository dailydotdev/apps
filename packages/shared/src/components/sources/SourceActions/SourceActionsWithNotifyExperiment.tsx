import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { ButtonVariant } from '../../buttons/common';
import { Source } from '../../../graphql/sources';
import { useSourceActions } from '../../../hooks';
import SourceActionsNotify from './SourceActionsNotify';
import SourceActionsBlock from './SourceActionsBlock';
import SourceActionsFollow from './SourceActionsFollow';
import { useToggle } from '../../../hooks/useToggle';
import { EnableNotificationAlert } from '../../notifications/EnableNotification';
import { NotificationPromptSource } from '../../../lib/log';

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
  notifyProps?: SourceActionsButton & { alertClassName?: string };
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
    haveNotifications,
    toggleNotify,
  } = useSourceActions({
    source,
  });

  const [isNotifyOpen, toggleNotifyOpen] = useToggle(false);

  return (
    <>
      <div className="flex flex-row gap-2">
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
            haveNotifications={haveNotifications || isNotifyOpen}
            onClick={haveNotifications ? toggleNotify : toggleNotifyOpen}
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
      {isNotifyOpen && (
        <EnableNotificationAlert
          sourceType={NotificationPromptSource.SourceSubscribe}
          message={`Get notified whenever there are new posts from ${source.name}`}
          acceptedJustNow={haveNotifications}
          accept={{
            onClick: toggleNotify,
          }}
          dismiss={{
            show: true,
            onClick: toggleNotifyOpen,
          }}
          className={classNames(
            'w-full max-w-80 !pt-0 typo-footnote',
            notifyProps?.alertClassName,
          )}
        />
      )}
    </>
  );
};

export default SourceActionsWithNotifyExperiment;
