import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { useMutation } from '@tanstack/react-query';
import {
  ContentPreferenceStatus,
  ContentPreferenceType,
} from '../../graphql/contentPreference';
import { ButtonVariant } from '../buttons/Button';
import { useContentPreference } from '../../hooks/contentPreference/useContentPreference';
import SourceActionsNotify from '../sources/SourceActions/SourceActionsNotify';
import SourceActionsFollow from '../sources/SourceActions/SourceActionsFollow';
import { Origin } from '../../lib/log';
import { useIsSpecialUser } from '../../hooks/auth/useIsSpecialUser';

export type FollowButtonProps = {
  className?: string;
  userId: string;
  status?: ContentPreferenceStatus;
  type: ContentPreferenceType;
  entityName: string;
  origin?: Origin;
};

export const FollowButton = ({
  className,
  userId,
  entityName,
  status: currentStatus,
  type,
  origin,
}: FollowButtonProps): ReactElement => {
  const { follow, unfollow, subscribe, unsubscribe } = useContentPreference();

  const { mutate: onButtonClick, isPending: isLoadingFollow } = useMutation({
    mutationFn: async () => {
      const opts = origin
        ? {
            extra: {
              origin,
            },
          }
        : undefined;

      if (!currentStatus) {
        await follow({
          id: userId,
          entity: type,
          entityName,
          opts,
        });
      } else {
        await unfollow({
          id: userId,
          entity: type,
          entityName,
          opts,
        });
      }
    },
  });

  const { mutate: onNotifyClick, isPending: isLoadingNotify } = useMutation({
    mutationFn: async () => {
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
    },
  });

  const isLoading = isLoadingFollow || isLoadingNotify;

  if (useIsSpecialUser({ userId })) {
    return null;
  }

  return (
    <div className={classNames('inline-flex gap-2', className)}>
      <SourceActionsFollow
        isSubscribed={!!currentStatus}
        isFetching={isLoading}
        variant={ButtonVariant.Secondary}
        onClick={(e) => {
          e.preventDefault();
          onButtonClick();
        }}
      />
      {!!currentStatus && (
        <SourceActionsNotify
          haveNotificationsOn={
            currentStatus === ContentPreferenceStatus.Subscribed
          }
          onClick={(e) => {
            e.preventDefault();
            onNotifyClick();
          }}
          disabled={isLoading}
        />
      )}
    </div>
  );
};
