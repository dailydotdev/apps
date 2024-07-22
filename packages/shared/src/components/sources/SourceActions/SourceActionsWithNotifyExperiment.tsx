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
          acceptedJustNow={haveNotifications}
          acceptOptions={{
            onClick: toggleNotify,
            show: !haveNotifications,
          }}
          className={classNames(
            'w-full max-w-80 typo-footnote',
            haveNotifications
              ? '!border-0 bg-brand-float !p-3'
              : `${notifyProps?.alertClassName} !pt-0`,
          )}
          dismissOptions={{
            show: !haveNotifications,
            onClick: toggleNotifyOpen,
          }}
          imageOptions={{ show: !haveNotifications }}
          message={`Get notified whenever there are new posts from ${source.name}`}
          showTitleOnAccept
          sourceType={NotificationPromptSource.SourceSubscribe}
        />
      )}
    </>
  );
};

export default SourceActionsWithNotifyExperiment;
