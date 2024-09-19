import React, { ReactElement } from 'react';
import classNames from 'classnames';
import {
  ContentPreferenceStatus,
  ContentPreferenceType,
} from '../../graphql/contentPreference';
import { ButtonVariant } from '../buttons/Button';
import { useContentPreference } from '../../hooks/contentPreference/useContentPreference';
import SourceActionsNotify from '../sources/SourceActions/SourceActionsNotify';
import SourceActionsFollow from '../sources/SourceActions/SourceActionsFollow';

export type FollowButtonProps = {
  className?: string;
  userId: string;
  status?: ContentPreferenceStatus;
  type: ContentPreferenceType;
  entityName: string;
};

export const FollowButton = ({
  className,
  userId,
  entityName,
  status: currentStatus,
  type,
}: FollowButtonProps): ReactElement => {
  const { follow, unfollow, subscribe, unsubscribe } = useContentPreference();

  const onButtonClick = async () => {
    if (!currentStatus) {
      await follow({
        id: userId,
        entity: type,
        entityName,
      });
    } else {
      await unfollow({
        id: userId,
        entity: type,
        entityName,
      });
    }
  };

  const onNotifyClick = async () => {
    if (currentStatus !== ContentPreferenceStatus.Subscribed) {
      await subscribe({
        id: userId,
        entity: type,
        entityName,
      });
    } else {
      await unsubscribe({
        id: userId,
        entity: type,
        entityName,
      });
    }
  };

  return (
    <div className={classNames('inline-flex gap-2', className)}>
      <SourceActionsFollow
        isSubscribed={!!currentStatus}
        isFetching={false}
        variant={ButtonVariant.Secondary}
        onClick={onButtonClick}
      />
      {!!currentStatus && (
        <SourceActionsNotify
          haveNotificationsOn={
            currentStatus === ContentPreferenceStatus.Subscribed
          }
          onClick={onNotifyClick}
        />
      )}
    </div>
  );
};
