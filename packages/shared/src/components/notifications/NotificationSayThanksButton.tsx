import React from 'react';
import type { ReactElement, MouseEvent } from 'react';
import type { InfiniteData } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';
import type {
  Notification,
  NotificationsData,
} from '../../graphql/notifications';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { VIcon } from '../icons/V';
import { sayThanksForAward } from '../../graphql/njord';
import {
  ToastType,
  useToastNotification,
} from '../../hooks/useToastNotification';
import {
  ApiError,
  DEFAULT_ERROR,
  getApiError,
  type ApiErrorResult,
} from '../../graphql/common';
import { useUpdateQuery } from '../../hooks/useUpdateQuery';

export const NotificationSayThanksButton = ({
  referenceId,
  hasThanks,
}: Pick<Notification, 'referenceId' | 'hasThanks'>): ReactElement => {
  const { displayToast } = useToastNotification();
  const [getNotifications, updateNotifications] = useUpdateQuery<
    InfiniteData<NotificationsData>
  >({ queryKey: ['notifications'] });

  const markThanksSent = () => {
    const notifications = getNotifications();
    if (!notifications) {
      return;
    }

    updateNotifications({
      ...notifications,
      pages: notifications.pages.map((page) => ({
        ...page,
        notifications: {
          ...page.notifications,
          edges: page.notifications.edges.map((edge) =>
            edge.node.referenceId === referenceId
              ? { ...edge, node: { ...edge.node, hasThanks: true } }
              : edge,
          ),
        },
      })),
    });
  };

  const { mutate, isPending } = useMutation({
    mutationFn: () => sayThanksForAward({ transactionId: referenceId }),
    onSuccess: markThanksSent,
    onError: (error: ApiErrorResult) => {
      if (getApiError(error, ApiError.Conflict)) {
        markThanksSent();
        displayToast('You already sent thanks', {
          variant: ToastType.Info,
        });
        return;
      }

      displayToast(DEFAULT_ERROR, { variant: ToastType.Error });
    },
  });

  if (hasThanks) {
    return (
      <Button
        variant={ButtonVariant.Primary}
        size={ButtonSize.Small}
        icon={<VIcon />}
        disabled
        className="pointer-events-none mt-3"
      >
        Thanks sent
      </Button>
    );
  }

  return (
    <Button
      variant={ButtonVariant.Tertiary}
      size={ButtonSize.Small}
      loading={isPending}
      className="-ml-3.5 mt-3 flex min-w-min text-text-link"
      onClick={(event: MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();
        mutate();
      }}
    >
      Say thanks
    </Button>
  );
};
