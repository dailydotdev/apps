import React, { useState } from 'react';
import type { ReactElement, MouseEvent } from 'react';
import { useMutation } from '@tanstack/react-query';
import type { Notification } from '../../graphql/notifications';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { VIcon } from '../icons/V';
import { sayThanksForAward } from '../../graphql/njord';
import { useToastNotification } from '../../hooks/useToastNotification';
import {
  ApiError,
  DEFAULT_ERROR,
  getApiError,
  type ApiErrorResult,
} from '../../graphql/common';

export const NotificationSayThanksButton = ({
  referenceId,
}: Pick<Notification, 'referenceId'>): ReactElement => {
  const { displayToast } = useToastNotification();
  const [thanksSent, setThanksSent] = useState(false);

  const { mutate, isPending } = useMutation({
    mutationFn: () => sayThanksForAward({ transactionId: referenceId }),
    onSuccess: () => setThanksSent(true),
    onError: (error: ApiErrorResult) => {
      // The Award thanks were already sent (e.g. from another session) — reflect
      // the final state rather than surfacing an error.
      if (getApiError(error, ApiError.Conflict)) {
        setThanksSent(true);
        return;
      }

      displayToast(DEFAULT_ERROR);
    },
  });

  if (thanksSent) {
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
