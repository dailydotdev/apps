import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { useMutation } from '@tanstack/react-query';
import type { ContentPreferenceType } from '../../graphql/contentPreference';
import { ContentPreferenceStatus } from '../../graphql/contentPreference';
import { ButtonVariant } from '../buttons/Button';
import { useContentPreference } from '../../hooks/contentPreference/useContentPreference';
import SourceActionsNotify from '../sources/SourceActions/SourceActionsNotify';
import type { CopyType } from '../sources/SourceActions/SourceActionsFollow';
import SourceActionsFollow from '../sources/SourceActions/SourceActionsFollow';
import type { Origin } from '../../lib/log';
import { useIsSpecialUser } from '../../hooks/auth/useIsSpecialUser';
import useShowFollowAction from '../../hooks/useShowFollowAction';

export type FollowButtonProps = {
  className?: string;
  entityId: string;
  status?: ContentPreferenceStatus;
  type: ContentPreferenceType;
  entityName: string;
  feedId?: string;
  origin?: Origin;
  variant?: ButtonVariant;
  followedVariant?: ButtonVariant;
  buttonClassName?: string;
  showSubscribe?: boolean;
  copyType?: CopyType;
  alwaysShow?: boolean;
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
  followedVariant = ButtonVariant.Subtle,
  buttonClassName,
  showSubscribe = true,
  copyType,
  alwaysShow = false,
}: FollowButtonProps): ReactElement => {
  const { follow, unfollow, subscribe, unsubscribe } = useContentPreference();
  const { showActionBtn } = useShowFollowAction({
    entityId,
    entityType: type,
  });
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

  if (
    useIsSpecialUser({ userId: entityId }) ||
    (!showActionBtn && !alwaysShow)
  ) {
    return null;
  }

  const isFollowing = [
    ContentPreferenceStatus.Subscribed,
    ContentPreferenceStatus.Follow,
  ].includes(currentStatus);

  return (
    <div className={classNames('relative z-1 inline-flex gap-2', className)}>
      <SourceActionsFollow
        className={buttonClassName}
        isSubscribed={isFollowing}
        isFetching={isLoading}
        variant={variant}
        followedVariant={followedVariant}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onButtonClick();
        }}
        copyType={copyType}
      />
      {isFollowing && showSubscribe && (
        <SourceActionsNotify
          haveNotificationsOn={
            currentStatus === ContentPreferenceStatus.Subscribed
          }
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onNotifyClick();
          }}
          disabled={isLoading}
        />
      )}
    </div>
  );
};
