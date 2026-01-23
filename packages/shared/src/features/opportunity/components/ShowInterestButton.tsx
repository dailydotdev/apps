import React from 'react';
import type { ReactElement } from 'react';
import classNames from 'classnames';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import {
  Button,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { VIcon } from '../../../components/icons';
import { useLazyModal } from '../../../hooks/useLazyModal';
import { LazyModal } from '../../../components/modals/common/types';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent, TargetType } from '../../../lib/log';
import { useAuthContext } from '../../../contexts/AuthContext';
import { opportunityApplyMutationOptions } from '../mutations';
import { useToastNotification } from '../../../hooks';
import { opportunityUrl } from '../../../lib/constants';

export const ShowInterestButton = ({
  opportunityId,
  className,
  size = ButtonSize.Small,
}: {
  opportunityId: string;
  className?: { container?: string; button?: string };
  size?: ButtonSize;
}): ReactElement => {
  const { isLoggedIn } = useAuthContext();
  const { openModal } = useLazyModal();
  const { logEvent } = useLogContext();
  const { displayToast } = useToastNotification();
  const router = useRouter();

  const { mutateAsync: applyToOpportunity, isPending } = useMutation({
    ...opportunityApplyMutationOptions(),
    onSuccess: () => {
      logEvent({
        event_name: LogEvent.ApproveOpportunityMatch,
        target_type: TargetType.OpportunityInterestButton,
        target_id: opportunityId,
      });
      router.push(`${opportunityUrl}/${opportunityId}/questions`);
    },
    onError: () => {
      displayToast('Failed to show interest. Please try again.');
    },
  });

  const handleClick = (): void => {
    if (isLoggedIn) {
      applyToOpportunity({ id: opportunityId });
      return;
    }

    logEvent({
      event_name: LogEvent.Click,
      target_type: TargetType.OpportunityInterestButton,
      target_id: opportunityId,
    });

    openModal({
      type: LazyModal.CandidateSignIn,
      props: {
        opportunityId,
        onSuccess: () => {
          // After successful signup/login, apply to the opportunity
          applyToOpportunity({ id: opportunityId });
        },
      },
    });
  };

  return (
    <div className={className?.container}>
      <Button
        className={classNames(className?.button, '!text-white')}
        size={size}
        icon={<VIcon />}
        variant={ButtonVariant.Primary}
        color={ButtonColor.Cabbage}
        onClick={handleClick}
        disabled={isPending}
        loading={isPending}
      >
        Show interest
      </Button>
    </div>
  );
};
