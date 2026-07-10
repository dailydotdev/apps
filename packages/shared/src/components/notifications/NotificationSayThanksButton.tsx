import React, { useState } from 'react';
import type { ReactElement, MouseEvent } from 'react';
import { useMutation } from '@tanstack/react-query';
import type { NotificationItemProps } from './NotificationItem';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { VIcon } from '../icons';
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
}: NotificationItemProps): ReactElement => {
  const { displayToast } = useToastNotification();
  const [thanked, setThanked] = useState(false);

  const { mutate, isPending } = useMutation({
    mutationFn: () => sayThanksForAward({ transactionId: referenceId }),
    onSuccess: () => setThanked(true),
    onError: (error: ApiErrorResult) => {
      // The Award was already thanked (e.g. from another session) — reflect
      // the final state rather than surfacing an error.
      if (getApiError(error, ApiError.Conflict)) {
        setThanked(true);
        return;
      }

      displayToast(DEFAULT_ERROR);
    },
  });

  if (thanked) {
    return (
      <Button
        variant={ButtonVariant.Primary}
        size={ButtonSize.Small}
        icon={<VIcon />}
        disabled
        className="pointer-events-none mt-3"
      >
        Thanked
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
