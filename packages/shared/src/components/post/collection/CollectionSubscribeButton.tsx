import type { ReactElement } from 'react';
import React from 'react';
import {
  checkHasStatusPreference,
  useNotificationPreference,
} from '../../../hooks/notifications';
import { NotificationType } from '../../notifications/utils';
import { NotificationPreferenceStatus } from '../../../graphql/notifications';
import { BellDisabledIcon, BellIcon } from '../../icons';
import type { Post } from '../../../graphql/posts';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';
import { AuthTriggers } from '../../../lib/auth';
import { useAuthContext } from '../../../contexts/AuthContext';

export type CollectionSubscribeButtonProps = {
  post: Post;
  buttonVariant?: ButtonVariant;
};

export const CollectionSubscribeButton = ({
  post,
  buttonVariant = ButtonVariant.Float,
}: CollectionSubscribeButtonProps): ReactElement => {
  const { isLoggedIn, showLogin } = useAuthContext();
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

  const onClick = () => {
    if (!isLoggedIn) {
      showLogin({ trigger: AuthTriggers.CollectionSubscribe });

      return;
    }

    const notificationPreferenceParams = {
      type: NotificationType.CollectionUpdated,
      referenceId: post.id,
    };

    if (isSubscribed) {
      clearNotificationPreference(notificationPreferenceParams);
    } else {
      subscribeNotification(notificationPreferenceParams);
    }
  };

  return (
    <Button
      variant={buttonVariant}
      size={ButtonSize.Small}
      icon={isSubscribed ? <BellDisabledIcon /> : <BellIcon />}
      disabled={isFetching}
      onClick={onClick}
    >
      {isSubscribed ? 'Unsubscribe' : 'Subscribe'}
    </Button>
  );
};
