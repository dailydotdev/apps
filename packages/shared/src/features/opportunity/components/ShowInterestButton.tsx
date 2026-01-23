import React from 'react';
import type { ReactElement } from 'react';
import classNames from 'classnames';
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
import { LogEvent } from '../../../lib/log';
import { useAuthContext } from '../../../contexts/AuthContext';

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

  const handleApply = async (): Promise<void> => {
    logEvent({
      event_name: LogEvent.Click,
      target_type: 'opportunity_interest',
      target_id: opportunityId,
    });

    // TODO: Call opportunityApply mutation here
    // For now, redirect to questions page after applying
    window.location.href = `/jobs/${opportunityId}/questions`;
  };

  const handleClick = (): void => {
    if (isLoggedIn) {
      handleApply();
      return;
    }

    logEvent({
      event_name: LogEvent.Click,
      target_type: 'anonymous_opportunity_interest',
      target_id: opportunityId,
    });

    openModal({
      type: LazyModal.CandidateSignIn,
      props: {
        opportunityId,
        onSuccess: () => {
          // After successful signup/login, call the apply action
          handleApply();
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
      >
        Show interest
      </Button>
    </div>
  );
};
