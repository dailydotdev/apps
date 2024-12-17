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
import SourceActionsFollow, {
  CopyType,
} from '../sources/SourceActions/SourceActionsFollow';
import { Origin } from '../../lib/log';
import { useIsSpecialUser } from '../../hooks/auth/useIsSpecialUser';

export type FollowButtonProps = {
  className?: string;
  entityId: string;
  status?: ContentPreferenceStatus;
  type: ContentPreferenceType;
  entityName: string;
  feedId?: string;
  origin?: Origin;
  variant?: ButtonVariant;
  showSubscribe?: boolean;
  copyType?: CopyType;
};

export const FollowButton = ({
  className,
  entityId,
  entityName,
  status: currentStatus,
  type,
  feedId,
  origin,
  variant = ButtonVariant.Secondary,
  showSubscribe = true,
  copyType,
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
          id: entityId,
          entity: type,
          entityName,
          feedId,
          opts,
        });
      } else {
        await unfollow({
          id: entityId,
          entity: type,
          entityName,
          feedId,
          opts,
        });
      }
    },
  });

  const { mutate: onNotifyClick, isPending: isLoadingNotify } = useMutation({
    mutationFn: async () => {
      if (currentStatus !== ContentPreferenceStatus.Subscribed) {
        await subscribe({
          id: entityId,
          entity: type,
          entityName,
          feedId,
        });
      } else {
        await unsubscribe({
          id: entityId,
          entity: type,
          entityName,
          feedId,
        });
      }
    },
  });

  const isLoading = isLoadingFollow || isLoadingNotify;

  if (useIsSpecialUser({ userId: entityId })) {
    return null;
  }

  return (
    <div className={classNames('inline-flex gap-2', className)}>
      <SourceActionsFollow
        isSubscribed={!!currentStatus}
        isFetching={isLoading}
        variant={variant}
        onClick={(e) => {
          e.preventDefault();
          onButtonClick();
        }}
        copyType={copyType}
      />
      {!!currentStatus && showSubscribe && (
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
