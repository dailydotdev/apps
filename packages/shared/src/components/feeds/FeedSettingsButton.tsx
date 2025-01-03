import type { ReactElement } from 'react';
import React from 'react';
import type { ButtonProps } from '../buttons/Button';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { useLogContext } from '../../contexts/LogContext';
import { LogEvent } from '../../lib/log';
import { FilterIcon } from '../icons';

export function FeedSettingsButton({
  onClick,
  children = 'Feed settings',
  ...props
}: ButtonProps<'button'>): ReactElement {
  const { logEvent } = useLogContext();

  const onButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    logEvent({ event_name: LogEvent.ManageTags });
    onClick(event);
  };

  return (
    <Button
      variant={ButtonVariant.Primary}
      size={ButtonSize.Small}
      icon={<FilterIcon />}
      {...props}
      onClick={onButtonClick}
    >
      {children}
    </Button>
  );
}
