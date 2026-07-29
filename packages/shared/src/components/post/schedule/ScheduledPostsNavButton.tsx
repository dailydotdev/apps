import type { ReactElement } from 'react';
import React from 'react';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';
import { TimerIcon } from '../../icons';
import { Tooltip } from '../../tooltip/Tooltip';

interface ScheduledPostsNavButtonProps {
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

export function ScheduledPostsNavButton({
  onClick,
  disabled,
  className,
}: ScheduledPostsNavButtonProps): ReactElement {
  return (
    <Tooltip content="Scheduled posts">
      <Button
        type="button"
        size={ButtonSize.Small}
        variant={ButtonVariant.Tertiary}
        icon={<TimerIcon />}
        onClick={onClick}
        disabled={disabled}
        className={className}
        aria-label="Scheduled posts"
      />
    </Tooltip>
  );
}
