import React, { ReactElement } from 'react';
import classNames from 'classnames';
import classed from '../../../lib/classed';
import { Button } from '../../buttons/Button';
import { Origin } from '../../../lib/analytics';
import BellIcon from '../../icons/Bell';
import { PostHeaderActionsProps } from '../common';
import { PostMenuOptions } from '../PostMenuOptions';
import { useNotificationPreference } from '../../../hooks/notifications';
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
  const { preferences, subscribeNotification, clearNotificationPreference } =
    useNotificationPreference({
      params: post?.id
        ? [
            {
              notificationType: NotificationType.CollectionUpdated,
              referenceId: post.id,
            },
          ]
        : undefined,
    });
  const isSubscribed = !!preferences?.some(
    (item) => item.status === NotificationPreferenceStatus.Subscribed,
  );

  return (
    <Container {...props} className={classNames('gap-2', className)}>
      <Button
        className={classNames(
          'btn',
          isSubscribed ? 'btn-secondary' : 'btn-primary',
        )}
        icon={isSubscribed ? <BellDisabledIcon /> : <BellIcon />}
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
