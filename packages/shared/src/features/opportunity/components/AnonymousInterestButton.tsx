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

export const AnonymousInterestButton = ({
  opportunityId,
  className,
  size = ButtonSize.Small,
}: {
  opportunityId: string;
  className?: { container?: string; button?: string };
  size?: ButtonSize;
}): ReactElement => {
  const { openModal } = useLazyModal();
  const { logEvent } = useLogContext();

  const handleClick = (): void => {
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
          // After successful signup/login, the page will re-render
          // with the user logged in, showing the regular ResponseButtons
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
