import React, { ReactElement } from 'react';
import classNames from 'classnames';
import classed from '../../../lib/classed';
import { Button } from '../../buttons/Button';
import { Origin } from '../../../lib/analytics';
import BellIcon from '../../icons/Bell';
import { PostHeaderActionsProps } from '../common';
import { PostMenuOptions } from '../PostMenuOptions';
import {
  checkHasStatusPreference,
  useNotificationPreference,
} from '../../../hooks/notifications';
import { NotificationType } from '../../notifications/utils';
import { NotificationPreferenceStatus } from '../../../graphql/notifications';
import BellDisabledIcon from '../../icons/Bell/Disabled';

const Container = classed('div', 'flex flex-row items-center');

export const CollectionPostHeaderActions = ({
  onShare,
  post,
  onClose,
  inlineActions,
  className,
  notificationClassName,
  contextMenuId,
  onRemovePost,
  ...props
}: PostHeaderActionsProps): ReactElement => {
  const {
    preferences,
    subscribeNotification,
    clearNotificationPreference,
    isFetching,
  } = useNotificationPreference({
    params: post?.id
      ? [
          {
            notificationType: NotificationType.CollectionUpdated,
            referenceId: post.id,
          },
        ]
      : undefined,
  });
  const isSubscribed = !!preferences?.some((item) =>
    checkHasStatusPreference(
      item,
      NotificationType.CollectionUpdated,
      post?.id,
      [NotificationPreferenceStatus.Subscribed],
    ),
  );

  return (
    <Container {...props} className={classNames('gap-2', className)}>
      <Button
        className={classNames(
          'btn',
          isSubscribed ? 'btn-secondary' : 'btn-primary',
        )}
        icon={isSubscribed ? <BellDisabledIcon /> : <BellIcon />}
        disabled={isFetching}
        onClick={() => {
          const notificationPreferenceParams = {
            type: NotificationType.CollectionUpdated,
            referenceId: post.id,
          };

          if (isSubscribed) {
            clearNotificationPreference(notificationPreferenceParams);
          } else {
            subscribeNotification(notificationPreferenceParams);
          }
        }}
      >
        {isSubscribed ? 'Unsubscribe' : 'Subscribe'}
      </Button>
      <PostMenuOptions
        onShare={onShare}
        post={post}
        onClose={onClose}
        inlineActions={inlineActions}
        contextMenuId={contextMenuId}
        onRemovePost={onRemovePost}
        origin={Origin.CollectionModal}
      />
    </Container>
  );
};
